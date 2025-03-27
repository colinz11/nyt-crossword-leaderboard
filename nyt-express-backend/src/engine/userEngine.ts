import { Model } from 'mongoose';
import { PuzzleDocument } from '../models/puzzle';
import { SolutionDocument } from '../models/solution';
import { UserDocument } from '../models/user';

class UserEngine {
    private puzzleModel: Model<PuzzleDocument>;
    private solutionModel: Model<SolutionDocument>;
    private userModel: Model<UserDocument>;
    private userSolutions: SolutionDocument[] = [];

    constructor(puzzleModel: Model<PuzzleDocument>, solutionModel: Model<SolutionDocument>, userModel: Model<UserDocument>) {
        this.puzzleModel = puzzleModel;
        this.solutionModel = solutionModel;
        this.userModel = userModel;
    }

    async getUserSolutions(userId: string): Promise<void> {
        this.userSolutions = await this.solutionModel.find({ userId });
    }

    getPercentageOfPuzzlesSolved(): number {
        const totalPuzzles = this.userSolutions.length;
        const solvedPuzzles = this.userSolutions.filter(solution => solution.calcs.solved).length;
        return totalPuzzles > 0 ? (solvedPuzzles / totalPuzzles) * 100 : 0;
    }

    getAverageSolveTime(): number {
        const totalSolveTime = this.userSolutions.reduce((acc, solution) => acc + solution.calcs.secondsSpentSolving, 0);
        const solvedPuzzles = this.userSolutions.filter(solution => solution.calcs.solved).length;
        return solvedPuzzles > 0 ? totalSolveTime / solvedPuzzles : 0;
    }

    getTotalPuzzlesSolved(): number {
        return this.userSolutions.filter(solution => solution.calcs.solved).length;
    }
}

export default UserEngine;