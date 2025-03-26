class UserEngine {
    constructor(puzzleModel, solutionModel, userModel) {
        this.puzzleModel = puzzleModel;
        this.solutionModel = solutionModel;
        this.userModel = userModel;
        this.solutions = [];
    }

    async getUserSolutions(userId) {
        this.solutions = await this.solutionModel.find({ userId });
        return this.solutions;
    }

    getPercentageOfPuzzlesSolved() {
        if (this.solutions.length === 0) {
            return 0;
        }

        const solvedCount = this.solutions.filter(solution => solution.calcs.solved).length;
        return (solvedCount / this.solutions.length) * 100;
    }

    getAverageSolveTime() {
        if (this.solutions.length === 0) {
            return 0;
        }

        const totalSolveTime = this.solutions.reduce((total, solution) => total + solution.calcs.secondsSpentSolving, 0);
        return totalSolveTime / this.solutions.length;
    }

    getPercentageUsingAutoChecker() {
        if (this.solutions.length === 0) {
            return 0;
        }

        const autoCheckerCount = this.solutions.filter(solution => solution.autocheckEnabled).length;
        return (autoCheckerCount / this.solutions.length) * 100;
    }

    getAverageSolveTimeByDayOfWeek() {
        if (this.solutions.length === 0) {
            return {};
        }

        const solveTimesByDay = this.solutions.reduce((acc, solution) => {
            const dayOfWeek = new Date(solution.timestamp).getDay();
            if (!acc[dayOfWeek]) {
                acc[dayOfWeek] = { totalSolveTime: 0, count: 0 };
            }
            acc[dayOfWeek].totalSolveTime += solution.calcs.secondsSpentSolving;
            acc[dayOfWeek].count += 1;
            return acc;
        }, {});

        const averageSolveTimeByDay = {};
        for (const [day, data] of Object.entries(solveTimesByDay)) {
            averageSolveTimeByDay[day] = data.totalSolveTime / data.count;
        }

        return averageSolveTimeByDay;
    }

    getTotalPuzzlesSolved() {
        if (this.solutions.length === 0) {
            return 0;
        }

        return this.solutions.filter(solution => solution.calcs.solved).length;
    }
}

module.exports = UserEngine;