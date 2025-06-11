import { Model } from 'mongoose';
import { SolutionDocument } from '../models/solution';
import { PuzzleDocument } from '../models/puzzle'; // Added Puzzle import
import { User } from '../models/user';

interface BoardData {
  username: string;
  solutionData: SolutionDocument;
}


class PuzzleEngine {
  private solutionModel: Model<SolutionDocument>;
  private puzzleModel: Model<PuzzleDocument>; // Added puzzleModel

  constructor(solutionModel: Model<SolutionDocument>, puzzleModel: Model<PuzzleDocument>) { // Added puzzleModel to constructor
    this.solutionModel = solutionModel;
    this.puzzleModel = puzzleModel; // Initialize puzzleModel

  }

  async getPuzzleDetailsWithTopSolutions(puzzleId: string): Promise<{ puzzle: PuzzleDocument, topSolutions: BoardData[] }> {
    const puzzle = await this.puzzleModel.findOne({ puzzleID: puzzleId });
    if (!puzzle) {
      throw new Error('Puzzle not found');
    }

    const solutions = await this.solutionModel.find({ puzzleID: puzzleId });
    const solvedSolutions = solutions.filter(solution => solution.calcs && solution.calcs.solved && solution.calcs.secondsSpentSolving > 0);
    const sortedSolutions = solvedSolutions.sort((a, b) => (a.calcs?.secondsSpentSolving || 0) - (b.calcs?.secondsSpentSolving || 0));
    const topSolutions = sortedSolutions.slice(0, 5);
    
    // Enrich with usernames
    const userIds = topSolutions.map(sol => Number(sol.userID));
    const users = await User.find({ userID: { $in: userIds } }).select('userID name');
    const userMap = users.reduce((acc: Record<string, string>, user: any) => {
      acc[user.userID] = user.name || user.userID;
      return acc;
    }, {});

    const enrichedSolutions: BoardData[] = topSolutions.map(sol => ({
      username: userMap[sol.userID] || sol.userID.toString(),
      solutionData: sol,
    }));

    return {
      puzzle,
      topSolutions: enrichedSolutions,
    };
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
      publishType: 'Mini', // Only include mini puzzles
    });
    return puzzle;
  }
}

export default PuzzleEngine;