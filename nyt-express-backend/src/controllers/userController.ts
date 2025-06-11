import { Request, Response } from 'express';
import UserEngine from '../engine/userEngine';
import { Solution } from '../models/solution';
import { Puzzle } from '../models/puzzle';
import { User } from '../models/user';
import moment from 'moment';

const userEngine = new UserEngine(Solution, Puzzle);

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userID } = req.params;
        const { startDate, endDate } = req.query;

        if (!userID) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        console.log('Fetching user stats for userId:', userID, 'startDate:', startDate, 'endDate:', endDate);
        
        // Fetch user details
        const user = await User.findOne({ userID: Number(userID) });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if token has expired
        if (user.expirationDate && new Date() > new Date(user.expirationDate)) {
            res.status(401).json({ error: 'Token has expired. Please log in again with a new token.' });
            return;
        }

        // Fetch user solutions with date range if provided
        await userEngine.getUserSolutions(userID, startDate as string, endDate as string);

        // Calculate stats
        const averageSolveTime = userEngine.getAverageSolveTime();
        const totalPuzzlesSolved = userEngine.getTotalPuzzlesSolved();
        const currentStreak = userEngine.getCurrentStreak();
        const longestStreak = userEngine.getLongestStreak();
        const autoCompletePct = userEngine.getAutoCompletePercentage();

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Get stats for each day of the week
        const statsByDay = daysOfWeek.map(day => {
            const stats = userEngine.getStatsByDay(day);
            return {
                day,
                stats,
            };
        });

        // Return stats as JSON
        res.status(200).json({
            userID: user.userID,
            username: user.name,
            expirationDate: user.expirationDate,
            averageSolveTime,
            totalPuzzlesSolved,
            currentStreak,
            longestStreak,
            autoCompletePct,
            statsByDay
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userID } = req.params;

        if (!userID) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        // Delete user's solutions
        await Solution.deleteMany({ userID });

        // Delete user
        const result = await User.findOneAndDelete({ userID: Number(userID) });
        
        if (!result) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({ message: 'User and associated data deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({}, { 
            userID: 1, 
            name: 1, 
            expirationDate: 1,
            _id: 0 
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};