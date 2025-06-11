import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import axios from 'axios';
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
        const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
        
        // Get past month date range
        const endDate = moment();
        const startDate = moment().subtract(1, 'month');
        const start = startDate.format('YYYY-MM-DD');
        const end = endDate.format('YYYY-MM-DD');
        
        console.log(`Fetching puzzles from ${start} to ${end}`);
        
        // Call the /nyt/puzzles endpoint to fetch and save puzzles
        try {
            const puzzleResponse = await axios.post(`${baseUrl}/nyt/puzzles`, {
                type: 'mini',
                start,
                end
            }, {
                headers: {
                    'X-API-Key': process.env.API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Puzzles fetch response:', puzzleResponse.data.message);
        } catch (error: any) {
            console.error('Error fetching puzzles:', error.response?.data || error.message);
            throw new Error('Failed to fetch puzzles');
        }

        // Get all users to fetch solutions for
        const users = await User.find();
        console.log(`Fetching solutions for ${users.length} users`);

        const results = {
            usersProcessed: 0,
            errors: [] as string[]
        };

        // Call the /nyt/fetch-solutions endpoint for each user
        for (const user of users) {
            try {
                const solutionResponse = await axios.post(`${baseUrl}/nyt/fetch-solutions`, {
                    userID: user.userID,
                    start,
                    end
                }, {
                    headers: {
                        'X-API-Key': process.env.API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`Solutions fetched for user ${user.userID}:`, solutionResponse.data.message);
                results.usersProcessed++;
            } catch (error: any) {
                const errorMessage = `Error fetching solutions for user ${user.userID}: ${error.response?.data?.message || error.message}`;
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