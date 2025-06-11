import { Request, Response } from 'express';
import { Model } from 'mongoose';
import moment from 'moment';
import dotenv from 'dotenv';
import NytService from '../services/nytService';
import { PuzzleDocument } from '../models/puzzle';
import { SolutionDocument } from '../models/solution';
import { UserDocument } from '../models/user';

dotenv.config();

class NytController {
    private puzzleModel: Model<PuzzleDocument>;
    private solutionModel: Model<SolutionDocument>;
    private userModel: Model<UserDocument>;

    constructor(puzzleModel: Model<PuzzleDocument>, solutionModel: Model<SolutionDocument>, userModel: Model<UserDocument>) {
        this.puzzleModel = puzzleModel;
        this.solutionModel = solutionModel;
        this.userModel = userModel;
    }

    async fetchAndSavePuzzlesByDateRange(req: Request, res: Response): Promise<void> {
        const { type, start, end } = req.body;
        const token = process.env.NYT_TOKEN;

        if (!type || !start || !end) {
            res.status(400).json({ message: 'Missing required query parameters: type, start, end' });
            return;
        }

        if (!token) {
            res.status(400).json({ message: 'Missing NYT token' });
            return;
        }

        const nytService = new NytService(token);
        const startDate = moment(start as string);
        const endDate = moment(end as string);

        if (!startDate.isValid() || !endDate.isValid()) {
            res.status(400).json({ message: 'Invalid date format' });
            return;
        }

        try {
          
            const puzzles = await nytService.fetchPuzzles(type as string, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));

            await Promise.all(puzzles.map(async (puzzleData) => {
                await this.puzzleModel.findOneAndUpdate(
                    { puzzleID: puzzleData.puzzleID },
                    puzzleData,
                    { upsert: true, new: true }
                );
            }));

            res.status(200).json({ message: 'Puzzles fetched and saved successfully' });
        } catch (error: any) {
            console.error('Error fetching or saving puzzles by date range:', error.message);
            res.status(500).json({ message: 'Error fetching or saving puzzles by date range', error: error.message });
        }
    }

    async fetchAndSaveSolutionsForUser(req: Request, res: Response): Promise<void> {
        const { userID, start, end } = req.body;

        if (!userID || !start || !end) {
            res.status(400).json({ message: 'Missing required query parameters: userID, start, end' });
            return;
        }

        const startDate = moment(start as string);
        const endDate = moment(end as string);
     
        console.log("Fetching solutions for user: " + userID + " from " + startDate.toDate() + " to " + endDate.toDate());
        if (!startDate.isValid() || !endDate.isValid()) {
            res.status(400).json({ message: 'Invalid date format' });
            return;
        }

        try {
            const user = await this.userModel.findOne({userID: userID});
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const token = user.cookie;
            const nytService = new NytService(token);

            const puzzles = await this.puzzleModel.find({
                printDate: { $gte: startDate.toDate(), $lte: endDate.toDate() }
            });

            console.log("Found " + puzzles.length + " puzzles to fetch solutions for");

            await Promise.all(puzzles.map(async (puzzle) => {
                const solutionData = await nytService.fetchSolution(String(puzzle.puzzleID), String(user.userID));
                console.log("Fetched solution for puzzle: " + puzzle.puzzleID);
                await this.solutionModel.findOneAndUpdate(
                    { userID: user.userID, puzzleID: puzzle.puzzleID },
                    { ...solutionData, userID: userID },
                    { upsert: true, new: true }
                );
            }));
          

            res.status(200).json({ message: 'Solutions fetched and saved successfully' });
        } catch (error: any) {
            console.error('Error fetching or saving solutions for user:', error.message);
            res.status(500).json({ message: 'Error fetching or saving solutions for user', error: error.message });
        }
    }

    async refreshUserSolutions(req: Request, res: Response): Promise<void> {
      
        const { userID } = req.body;


        if (!userID) {
            res.status(400).json({ message: 'Missing required parameter: userID' });
            return;
        }

        try {
            // Find the user first to fail fast if not found
            const user = await this.userModel.findOne({ userID });
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Create user-specific NYT service with user's token
            const userNytService = new NytService(user.cookie);

            // Get all puzzles from the database
            console.log(`Fetching puzzles from database...`);
            const puzzles = await this.puzzleModel.find({})
                .sort({ printDate: 1 }) // Sort by date ascending
                .lean(); // Use lean() for better performance since we don't need Mongoose documents

            if (!puzzles.length) {
                res.status(404).json({ message: 'No puzzles found in database. Please run puzzle sync first.' });
                return;
            }

            console.log(`Found ${puzzles.length} puzzles to process`);

            // Fetch solutions in batches to avoid overwhelming the NYT API
            const BATCH_SIZE = 50;
            const failedPuzzles: string[] = [];
            const successfulSolutions: any[] = [];

            console.log('Fetching solutions in batches...');
            for (let i = 0; i < puzzles.length; i += BATCH_SIZE) {
                const batch = puzzles.slice(i, i + BATCH_SIZE);
                console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(puzzles.length / BATCH_SIZE)}`);

                const solutionPromises = batch.map(async (puzzle) => {
                    try {
                        const solutionData = await userNytService.fetchSolution(puzzle.puzzleID.toString(), String(userID));
                        return {
                            ...solutionData,
                            userID,
                            puzzleID: puzzle.puzzleID
                        };
                    } catch (error) {
                        console.error(`Failed to fetch solution for puzzle ${puzzle.puzzleID}:`, error);
                        failedPuzzles.push(puzzle.puzzleID.toString());
                        return null;
                    }
                });

                const batchSolutions = await Promise.all(solutionPromises);
                const validSolutions = batchSolutions.filter(solution => solution !== null);
                successfulSolutions.push(...validSolutions);

                if (validSolutions.length > 0) {
                    try {
                        // Bulk upsert solutions for this batch
                        const solutionOps = validSolutions.map(solutionData => ({
                            updateOne: {
                                filter: { userID, puzzleID: solutionData.puzzleID },
                                update: { $set: solutionData },
                                upsert: true
                            }
                        }));

                        await this.solutionModel.bulkWrite(solutionOps, { ordered: false });
                    } catch (error) {
                        console.error('Error during solution bulk upsert:', error);
                        // Continue with next batch as some solutions might have been saved
                    }
                }

                // Add a small delay between batches to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const summary = {
                totalPuzzles: puzzles.length,
                successfulSolutions: successfulSolutions.length,
                failedPuzzles: failedPuzzles.length,
                failedPuzzleIds: failedPuzzles
            };

            console.log('Refresh summary:', summary);

            res.status(200).json({ 
                message: `Solutions refreshed successfully for user ${userID}`,
                summary
            });
        } catch (error: any) {
            console.error('Error refreshing user solutions:', error);
            res.status(500).json({ 
                message: 'Error refreshing user solutions', 
                error: error.message,
                details: error.stack
            });
        }
    }

    async saveUser(req: Request, res: Response): Promise<void> {
        const { cookie, userID, name, expirationDate } = req.body;
        if (!cookie || !userID || !name || !expirationDate) {
            res.status(400).json({ message: 'Missing required fields: cookie, userID, name, expirationDate' });
            return;
        }

        try {
            const user = new this.userModel({ cookie, userID, name, expirationDate });
            await user.save();
            res.status(201).json({ message: 'User saved successfully', user });
        } catch (error: any) {
            console.error('Error saving user:', error.message);
            res.status(500).json({ message: 'Error saving user', error: error.message });
        }
    }
}

export default NytController;