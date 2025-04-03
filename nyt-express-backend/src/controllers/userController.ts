import { Request, Response } from 'express';
import UserEngine from '../engine/userEngine';
import { Solution } from '../models/solution';
import { Puzzle } from '../models/puzzle';
const userEngine = new UserEngine(Solution, Puzzle);

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userID } = req.params;

        if (!userID) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        console.log('Fetching user stats for userId:', userID);
        // Fetch user solutions
        await userEngine.getUserSolutions(userID);
    


        // Calculate stats
        const averageSolveTime = userEngine.getAverageSolveTime();
        const totalPuzzlesSolved = userEngine.getTotalPuzzlesSolved();
        const currentStreak = userEngine.getCurrentStreak();
        const longestStreak = userEngine.getLongestStreak();
        const autoCompletePct = userEngine.getAutoCompletePercentage();

        // Return stats as JSON
        res.status(200).json({
            averageSolveTime,
            totalPuzzlesSolved,
            currentStreak,
            longestStreak,
            autoCompletePct,
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};