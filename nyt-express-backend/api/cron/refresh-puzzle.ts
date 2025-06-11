import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import moment from 'moment';
import NytController from '../../src/controllers/nytController';
import { Puzzle } from '../../src/models/puzzle';
import { Solution } from '../../src/models/solution';
import { User } from '../../src/models/user';
import { Request, Response } from 'express';

// Helper to create a mock Express response
const createMockResponse = () => {
    const res: Partial<Response> = {
        status: (code: number) => {
            console.log(`[Cron Job] Response status: ${code}`);
            return res as Response;
        },
        json: (data: any) => {
            console.log('[Cron Job] Response JSON:', data.message || data);
            return res as Response;
        },
    };
    return res as Response;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {


    try {
        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.DATABASE_URL as string);
            console.log('[Cron Job] MongoDB connected');
        }

        const nytController = new NytController(Puzzle, Solution, User);

        // --- Fetch Puzzles ---
        const endDate = moment();
        const startDate = moment().subtract(1, 'month');
        const start = startDate.format('YYYY-MM-DD');
        const end = endDate.format('YYYY-MM-DD');

        console.log(`[Cron Job] Fetching puzzles from ${start} to ${end}`);
        
        const puzzleReq = {
            body: { type: 'mini', start, end }
        } as Request;
        const puzzleRes = createMockResponse();

        try {
            await nytController.fetchAndSavePuzzlesByDateRange(puzzleReq, puzzleRes);
        } catch (error: any) {
            console.error('[Cron Job] Error fetching puzzles:', error.message);
            // We throw here to make sure the job is marked as failed
            throw new Error('Failed to fetch puzzles');
        }

        // --- Fetch Solutions for all users ---
        const users = await User.find();
        console.log(`[Cron Job] Fetching solutions for ${users.length} users`);

        const results = {
            usersProcessed: 0,
            errors: [] as string[]
        };

        for (const user of users) {
            console.log(`[Cron Job] Fetching solutions for user ${user.userID}`);
            const solutionReq = {
                body: { userID: user.userID, start, end }
            } as Request;
            const solutionRes = createMockResponse();

            try {
                await nytController.fetchAndSaveSolutionsForUser(solutionReq, solutionRes);
                results.usersProcessed++;
            } catch (error: any) {
                const errorMessage = `Error fetching solutions for user ${user.userID}: ${error.message}`;
                console.error(`[Cron Job] ${errorMessage}`);
                results.errors.push(errorMessage);
            }
        }

        console.log('[Cron Job] Puzzle refresh completed successfully');
        return response.status(200).json({
            message: 'Puzzle refresh completed successfully',
            results
        });

    } catch (error: any) {
        console.error('[Cron Job] Error:', error);
        return response.status(500).json({
            error: 'Failed to refresh puzzles',
            details: error.message
        });
    }
} 