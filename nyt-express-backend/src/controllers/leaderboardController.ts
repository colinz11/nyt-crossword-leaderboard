import { Request, Response } from 'express';
import { LeaderboardEngine } from '../engine/leaderboardEngine';
import { Solution } from '../models/solution';
import { User } from '../models/user';
import { Puzzle } from '../models/puzzle';

// Instantiate the LeaderboardEngine with the models
const leaderboardEngine = new LeaderboardEngine(Solution, User, Puzzle);

export const getLeaderboardByAverageTime = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const data = await leaderboardEngine.getTopSolversByAverageSpeed(limit);
        res.json(data);
    } catch (error: any) {
        console.error('Error fetching leaderboard by average time:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch leaderboard by average time' });
    }
};

export const getLeaderboardByPuzzlesSolved = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const data = await leaderboardEngine.getTopSolversByPuzzlesSolved(limit);
        res.json(data);
    } catch (error: any) {
        console.error('Error fetching leaderboard by puzzles solved:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch leaderboard by puzzles solved' });
    }
};

export const getLeaderboardByLongestStreak = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const data = await leaderboardEngine.getTopSolversByLongestStreak(limit);
        res.json(data);
    } catch (error: any) {
        console.error('Error fetching leaderboard by longest streak:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch leaderboard by longest streak' });
    }
};
