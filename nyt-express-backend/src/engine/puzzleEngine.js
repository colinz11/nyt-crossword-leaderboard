class PuzzleEngine {
    constructor(solutionModel, userModel) {
        this.solutionModel = solutionModel;
        this.userModel = userModel;
        this.solutions = [];
        this.userMap = {};
    }

    async getSolutionsByGameId(gameId) {
        if (!gameId) {
            throw new Error('Missing required parameter: gameId');
        }

        this.solutions = await this.solutionModel.find({ puzzleID: gameId });
        const userIds = this.solutions.map(solution => solution.userID);

        const users = await this.userModel.find({ _id: { $in: userIds } });
        this.userMap = users.reduce((acc, user) => {
            acc[user._id] = user.username;
            return acc;
        }, {});

        return this.solutions;
    }

    getSolutionDataByUserId() {
        if (Object.keys(this.userMap).length === 0) {
            return {};
        }

        const sortedSolutions = this.solutions.sort((a, b) => a.calcs.secondsSpentSolving - b.calcs.secondsSpentSolving);
        const topSolutions = sortedSolutions.slice(0, 10);

        const boardDataByUserId = topSolutions.reduce((acc, solution) => {
            const username = this.userMap[solution.userID];
            if (username) {
                acc[solution.userID] = {
                    username,
                    solutionData: solution
                };
            }
            return acc;
        }, {});

        return boardDataByUserId;
    }
}

module.exports = PuzzleEngine;