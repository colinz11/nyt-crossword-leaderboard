import { Model } from 'mongoose';
import { SolutionDocument } from '../models/solution';
import { Puzzle, PuzzleDocument } from '../models/puzzle'; // Added Puzzle import
import { UserDocument } from '../models/user';

interface UserMap {
    [key: string]: string;
}

interface BoardData {
    username: string;
    solutionData: SolutionDocument;
}

interface BoardDataByUserId {
    [key: string]: BoardData;
}

class PuzzleEngine {
    private solutionModel: Model<SolutionDocument>;
    private puzzleModel: Model<PuzzleDocument>; // Added puzzleModel
    private solutions: SolutionDocument[];
    private userMap: UserMap;

    constructor(solutionModel: Model<SolutionDocument>, puzzleModel: Model<PuzzleDocument>) { // Added puzzleModel to constructor
        this.solutionModel = solutionModel;
        this.puzzleModel = puzzleModel; // Initialize puzzleModel
        this.solutions = [];
        this.userMap = {};
    }

    async getPuzzleDetailsWithTopSolutions(puzzleId: string): Promise<{ puzzle: PuzzleDocument, topSolutions: SolutionDocument[] }> {
      const puzzle = await this.puzzleModel.findOne({ puzzleID: puzzleId });
      if (!puzzle) {
        throw new Error('Puzzle not found');
      }

      const solutions = await this.solutionModel.find({ puzzleID: puzzleId });
      // Assuming 'calcs.secondsSpentSolving' exists and indicates a solved puzzle
      const solvedSolutions = solutions.filter(solution => solution.calcs && solution.calcs.secondsSpentSolving > 0);
      const sortedSolutions = solvedSolutions.sort((a, b) => (a.calcs?.secondsSpentSolving || 0) - (b.calcs?.secondsSpentSolving || 0));
      const topSolutions = sortedSolutions.slice(0, 5);

      return {
        puzzle, // Or specific fields like puzzle.printDate, puzzle.puzzle, puzzle.solution
        topSolutions,
      };
    }

    async getSolutionsByGameId(gameId: string): Promise<SolutionDocument[]> {
        if (!gameId) {
            throw new Error('Missing required parameter: gameId');
        }

        // Return the list of solutions directly
        const solutions = await this.solutionModel.find({ puzzleID: gameId });
        return solutions;
    }

    getSolutionDataByUserId(): BoardDataByUserId {
        if (Object.keys(this.userMap).length === 0) {
            return {};
        }

        const sortedSolutions = this.solutions.sort((a, b) => a.calcs.secondsSpentSolving - b.calcs.secondsSpentSolving);
        const topSolutions = sortedSolutions.slice(0, 10);

        const boardDataByUserId = topSolutions.reduce((acc: BoardDataByUserId, solution) => {
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

export default PuzzleEngine;