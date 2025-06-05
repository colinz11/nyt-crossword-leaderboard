import { Router, Request, Response, NextFunction } from 'express';
import { Puzzle } from '../models/puzzle';
import { Solution } from '../models/solution';
import { User } from '../models/user';
import NytService from '../services/nytService';
import moment from 'moment';

const router = Router();

// Verify cron request is from Vercel
const verifyCron = (req: Request, res: Response, next: NextFunction): void => {
    // Vercel sends this header with cron jobs
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
};

router.post('/refresh-puzzle', verifyCron, async (req: Request, res: Response): Promise<void> => {
    try {
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
            res.status(200).json({ message: 'No puzzle found for today' });
            return;
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

        const results = {
            puzzlesUpdated: puzzles.length,
            usersProcessed: 0,
            errors: [] as string[]
        };

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
                }
                results.usersProcessed++;
            } catch (error) {
                const errorMessage = `Error updating solutions for user ${user.userID}: ${error}`;
                console.error(errorMessage);
                results.errors.push(errorMessage);
            }
        }

        console.log('Puzzle refresh completed successfully');
        res.status(200).json({
            message: 'Puzzle refresh completed successfully',
            results
        });
    } catch (error: any) {
        console.error('Error in cron job:', error);
        res.status(500).json({
            error: 'Failed to refresh puzzles',
            details: error.message
        });
    }
});

export default router; 