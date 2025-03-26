const UserEngine = require('./userEngine');
const { NytPuzzle, Solution, User } = require('../models'); // Adjust the import based on your project structure

class LeaderboardEngine {
    constructor() {
        this.userEngine = new UserEngine(NytPuzzle, Solution, User);
    }

    async rankBestSolvers() {
        const users = await User.find();
        const userStats = [];

        for (const user of users) {
            await this.userEngine.getUserSolutions(user._id);
            const percentageSolved = this.userEngine.getPercentageOfPuzzlesSolved();
            const averageSolveTime = this.userEngine.getAverageSolveTime();
            const totalPuzzlesSolved = this.userEngine.getTotalPuzzlesSolved();

            userStats.push({
                userId: user._id,
                username: user.username,
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

module.exports = LeaderboardEngine;