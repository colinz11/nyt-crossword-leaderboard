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
      const solvedSolutions = solutions.filter(solution => solution.calcs && solution.calcs.solved && solution.calcs.secondsSpentSolving > 0);
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

    async getLatestPuzzle(): Promise<PuzzleDocument | null> {
      // Sort by printDate in descending order and pick the first one
      const latestPuzzle = await this.puzzleModel.findOne().sort({ printDate: -1 });
      return latestPuzzle;
    }


    async getPuzzleByPrintDate(dateString: string): Promise<PuzzleDocument | null> {
      // The dateString is expected to be in 'YYYY-MM-DD' format.
      // MongoDB stores dates as ISODate. We need to query for a date range
      // that covers the entire day.
      const startDate = new Date(dateString);
      startDate.setUTCHours(0, 0, 0, 0); // Start of the day in UTC

      const endDate = new Date(dateString);
      endDate.setUTCHours(23, 59, 59, 999); // End of the day in UTC
      const puzzle = await this.puzzleModel.findOne({
        printDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      return puzzle;
    }
}

export default PuzzleEngine;