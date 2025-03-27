import UserEngine from './userEngine';
import { Puzzle } from '../models/puzzle';
import { Solution } from '../models/solution';
import { User, UserDocument } from '../models/user';

interface UserStats {
    userId: string;
    username: string;
    percentageSolved: number;
    averageSolveTime: number;
    totalPuzzlesSolved: number;
}

class LeaderboardEngine {
    private userEngine: UserEngine;

    constructor() {
        this.userEngine = new UserEngine(Puzzle, Solution, User);
    }

    async rankBestSolvers(): Promise<UserStats[]> {
        const users: UserDocument[] = await User.find();
        const userStats: UserStats[] = [];

        for (const user of users) {
            await this.userEngine.getUserSolutions(user.userID.toString());
            const percentageSolved = this.userEngine.getPercentageOfPuzzlesSolved();
            const averageSolveTime = this.userEngine.getAverageSolveTime();
            const totalPuzzlesSolved = this.userEngine.getTotalPuzzlesSolved();

            userStats.push({
                userId: user.userID.toString(),
                username: user.name,
                percentageSolved,
                averageSolveTime,
                totalPuzzlesSolved
            });
        }

        // Rank users by total puzzles solved, then by percentage solved, then by average solve time
        userStats.sort((a, b) => {
            if (b.totalPuzzlesSolved !== a.totalPuzzlesSolved) {
                return b.totalPuzzlesSolved - a.totalPuzzlesSolved;
            }
            if (b.percentageSolved !== a.percentageSolved) {
                return b.percentageSolved - a.percentageSolved;
            }
            return a.averageSolveTime - b.averageSolveTime;
        });

        return userStats;
    }
}

export default LeaderboardEngine;