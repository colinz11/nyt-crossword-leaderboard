import { Model } from 'mongoose';
import { Solution, SolutionDocument } from '../models/solution';
import { User, UserDocument } from '../models/user';
import { Puzzle, PuzzleDocument } from '../models/puzzle';
import UserEngine from './userEngine'; // For streak calculation

export interface LeaderboardUserAverageTime {
    userID: number;
    username?: string;
    averageSolveTime: number;
    puzzlesSolvedCount: number;
}

export interface LeaderboardUserPuzzlesSolved {
    userID: number;
    username?: string;
    puzzlesSolvedCount: number;
}

export interface LeaderboardUserLongestStreak {
    userID: number;
    username?: string;
    longestStreak: number;
}

export class LeaderboardEngine {
    constructor(
        private solutionModel: Model<SolutionDocument>,
        private userModel: Model<UserDocument>,
        private puzzleModel: Model<PuzzleDocument>
    ) {}

    async getTopSolversByAverageSpeed(limit: number = 5): Promise<LeaderboardUserAverageTime[]> {
        const results = await this.solutionModel.aggregate([
            { $match: { 'calcs.solved': true, 'calcs.secondsSpentSolving': { $gt: 0 } } },
            {
                $group: {
                    _id: '$userID',
                    totalSolveTime: { $sum: '$calcs.secondsSpentSolving' },
                    puzzlesSolvedCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    userID: '$_id',
                    averageSolveTime: { $divide: ['$totalSolveTime', '$puzzlesSolvedCount'] },
                    puzzlesSolvedCount: 1,
                    _id: 0,
                },
            },
            { $sort: { averageSolveTime: 1 } },
            { $limit: limit },
        ]);

        return this.enrichUsernames(results) as Promise<LeaderboardUserAverageTime[]>;
    }

    async getTopSolversByPuzzlesSolved(limit: number = 5): Promise<LeaderboardUserPuzzlesSolved[]> {
        const results = await this.solutionModel.aggregate([
            { $match: { 'calcs.solved': true } },
            {
                $group: {
                    _id: '$userID',
                    puzzlesSolvedCount: { $sum: 1 }, // Counts number of solutions, assumes one solution per puzzle per user
                },
            },
            {
                $project: {
                    userID: '$_id',
                    puzzlesSolvedCount: 1,
                    _id: 0,
                },
            },
            { $sort: { puzzlesSolvedCount: -1 } },
            { $limit: limit },
        ]);
        return this.enrichUsernames(results) as Promise<LeaderboardUserPuzzlesSolved[]>;
    }

    async getTopSolversByLongestStreak(limit: number = 5): Promise<LeaderboardUserLongestStreak[]> {
        const users = await this.userModel.find({}).select('userID name'); // Fetch all users
        if (!users.length) return [];

        const userStreaks: LeaderboardUserLongestStreak[] = [];

        for (const user of users) {
            // For each user, we need their solutions and puzzles to calculate streak
            // Instantiate UserEngine for this specific user.
            // UserEngine constructor is UserEngine(solutionModel, puzzleModel)
            const userEngineInstance = new UserEngine(this.solutionModel, this.puzzleModel);
            
            // Load this user's data into the UserEngine instance
            await userEngineInstance.getUserSolutions(user.userID.toString());
            
            // Now calculate the longest streak using UserEngine's method
            const longestStreak = userEngineInstance.getLongestStreak();
          
            userStreaks.push({
                userID: user.userID,
                username: user.name, // username is already selected from the userModel query
                longestStreak,
            });
        }

        userStreaks.sort((a, b) => b.longestStreak - a.longestStreak);
        return userStreaks.slice(0, limit);
    }

    private async enrichUsernames<T extends { userID: number, username?: string }>(results: T[]): Promise<T[]> {
        const userIDs = results.map(r => r.userID);
        const users = await this.userModel.find({ userID: { $in: userIDs } }).select('userID name');
        const userMap = users.reduce((acc, user) => {
            acc[user.userID] = user.name || user.userID; // Fallback to userID if username is not set
            return acc;
        }, {} as Record<number, number | string>);

        return results.map(r => ({
            ...r,
            username: userMap[r.userID],
        }));
    }
}
