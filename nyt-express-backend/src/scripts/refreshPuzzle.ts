import dotenv from 'dotenv';
import moment from 'moment';
import NytService from '../services/nytService';
import { Puzzle } from '../models/puzzle';
import { Solution } from '../models/solution';
import { User } from '../models/user';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function refreshPuzzle() {
    try {
        // Connect to MongoDB
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        const token = process.env.NYT_TOKEN;
        if (!token) {
            throw new Error('NYT_TOKEN environment variable is not set');
        }

        const nytService = new NytService(token);

        // Get today's date in YYYY-MM-DD format
        const todayMoment = moment();
        const tomorrowMoment = todayMoment.clone().add(1, 'day');
        const today = todayMoment.format('YYYY-MM-DD');
        const tomorrow = tomorrowMoment.format('YYYY-MM-DD');
        
        // Fetch today's puzzle
        console.log(`Fetching puzzle for ${today}`);
        const puzzles = await nytService.fetchPuzzles('mini', today, tomorrow);

        if (puzzles.length === 0) {
            console.log('No puzzle found for today');
            process.exit(0);
        }

        // Update or insert the puzzle
        for (const puzzleData of puzzles) {
            await Puzzle.findOneAndUpdate(
                { puzzleID: puzzleData.puzzleID },
                puzzleData,
                { upsert: true, new: true }
            );
            console.log(`Updated/inserted puzzle ID: ${puzzleData.puzzleID}`);
        }

        // Fetch and update solutions for all users
        const users = await User.find();
        console.log(`Updating solutions for ${users.length} users`);

        for (const user of users) {
            try {
                const userToken = user.cookie;
                const userNytService = new NytService(userToken);

                for (const puzzle of puzzles) {
                    const solutionData = await userNytService.fetchSolution(puzzle.puzzleID.toString(), user.userID.toString());
                    await Solution.findOneAndUpdate(
                        { userID: user.userID, puzzleID: puzzle.puzzleID },
                        { ...solutionData, userID: user.userID },
                        { upsert: true, new: true }
                    );
                    console.log(`Updated solution for user ${user.userID}, puzzle ${puzzle.puzzleID}`);
                }
            } catch (error) {
                console.error(`Error updating solutions for user ${user.userID}:`, error);
                // Continue with other users even if one fails
                continue;
            }
        }

        console.log('Puzzle refresh completed successfully');
    } catch (error) {
        console.error('Error refreshing puzzle:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

// Run the refresh function
refreshPuzzle(); 