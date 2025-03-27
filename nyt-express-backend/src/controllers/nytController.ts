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

            await Promise.all(puzzles.map(async (puzzle) => {
                const solutionData = await nytService.fetchSolution(String(puzzle.puzzleID), String(user.userID));
                await this.solutionModel.findOneAndUpdate(
                    { userID: user._id, puzzleID: puzzle.puzzleID },
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

    async refreshAll(req: Request, res: Response): Promise<void> {
        const token = process.env.NYT_TOKEN;

        if (!token) {
            res.status(400).json({ message: 'Missing NYT token' });
            return;
        }

        const nytService = new NytService(token);

        try {
            const puzzles = await nytService.fetchPuzzles('mini', '2014-01-01', moment().format('YYYY-MM-DD'));
            await Promise.all(puzzles.map(async (puzzleData) => {
                await this.puzzleModel.findOneAndUpdate(
                    { puzzleID: puzzleData.puzzleID },
                    puzzleData,
                    { upsert: true, new: true }
                );
            }));

            const users = await this.userModel.find();

            const puzzleIds = puzzles.map(puzzle => puzzle.puzzleID);
            await Promise.all(users.map(async (user) => {
                const userID = user.userID;
                const token = user.cookie;
                const nytService = new NytService(token);

                await Promise.all(puzzleIds.map(async (puzzleId) => {
                    const solutionData = await nytService.fetchSolution(puzzleId, String(userID));
                    await this.solutionModel.findOneAndUpdate(
                        { userID: userID, puzzleID: puzzleId },
                        { ...solutionData, userID: userID },
                        { upsert: true, new: true }
                    );
                }));
            }));

            res.status(200).json({ message: 'All puzzles and solutions fetched and saved successfully' });
        } catch (error: any) {
            console.error('Error refreshing all puzzles and solutions:', error.message);
            res.status(500).json({ message: 'Error refreshing all puzzles and solutions', error: error.message });
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