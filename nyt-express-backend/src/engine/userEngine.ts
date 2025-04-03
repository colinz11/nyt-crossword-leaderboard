import { Model } from 'mongoose';
import { PuzzleDocument } from '../models/puzzle';
import { SolutionDocument } from '../models/solution';
import { UserDocument } from '../models/user';

// Define a new type for enriched solutions
type EnrichedSolution = SolutionDocument & { printDate: string };

class UserEngine {
    private solutionModel: Model<SolutionDocument>;
    private puzzleModel: Model<PuzzleDocument>;
    private userSolutions: SolutionDocument[] = [];
    private solvedPuzzles: SolutionDocument[] = [];
    private sortedSolutions: EnrichedSolution[] = [];

    constructor(solutionModel: Model<SolutionDocument>, puzzleModel: Model<PuzzleDocument>) {
        this.puzzleModel = puzzleModel;
        this.solutionModel = solutionModel;
    }
    
    async getUserSolutions(userID: string): Promise<void> {
        try {
            // Fetch all solutions for the user
            this.userSolutions  = await this.solutionModel.find({ userID }).exec();
            this.solvedPuzzles = this.userSolutions.filter(solution => solution.calcs?.solved);
            // Extract unique puzzleIDs from the solutions
            const puzzleIDs = [...new Set(this.userSolutions.map(solution => solution.puzzleID))];
    
            // Fetch all puzzles matching the puzzleIDs in one query
            const puzzles = await this.puzzleModel.find({ puzzleID: { $in: puzzleIDs } }).exec();
    
            // Create a map of puzzleID to printDate for quick lookup
            const puzzleDateMap = puzzles.reduce((map, puzzle) => {
                map[puzzle.puzzleID] = puzzle.printDate;
                return map;
            }, {} as Record<string, Date>);
    
            // Add printDate to each solution and filter out solutions without a matching puzzle
            const solutionsWithDates = this.userSolutions.map(solution => ({
                ...solution.toObject(),
                printDate: puzzleDateMap[solution.puzzleID],
            })).filter(solution => solution.printDate);
    
            // Sort solutions by printDate (ascending order)
            this.sortedSolutions = solutionsWithDates.sort(
                (a, b) => new Date(a.printDate).getTime() - new Date(b.printDate).getTime()
            );
            
    
            console.log(`User solutions fetched and sorted for userID ${userID}:`, this.userSolutions.length);
        } catch (error) {
            console.error(`Error fetching solutions for userID ${userID}:`, error);
            throw new Error('Failed to fetch and sort user solutions');
        }
    }

    getAverageSolveTime(): number {
        const totalSolveTime = this.userSolutions.reduce((acc, solution) => {
            return acc + (solution.calcs?.secondsSpentSolving || 0);
        }, 0);
        return this.solvedPuzzles.length > 0 ? parseFloat((totalSolveTime / this.solvedPuzzles.length).toFixed(2)) : 0;
    }
    
    getTotalPuzzlesSolved(): number {
        return this.solvedPuzzles.length;
    }
    
    getCurrentStreak(): number {
        let currentStreak = 0;
    
        // Iterate through solutions in reverse order (most recent first)
        for (let i = this.sortedSolutions.length - 1; i >= 0; i--) {
            const solution = this.sortedSolutions[i];
            if (solution.calcs?.solved) {
                currentStreak++;
            } else {
                break; // Streak ends when an unsolved puzzle is encountered
            }
        }
    
        return currentStreak;
    }
    
    getLongestStreak(): number {
        let longestStreak = 0;
        let currentStreak = 0;
    
        // Iterate through solutions in chronological order
        for (const solution of this.sortedSolutions) {
            if (solution.calcs?.solved) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0; // Reset streak on unsolved puzzle
            }
        }
    
        return longestStreak;
    }

    getAutoCompletePercentage(): number {
      
        const autoCompletedPuzzles = this.solvedPuzzles.filter(solution => solution.autocheckEnabled);
    
        if (this.solvedPuzzles.length === 0) {
            return 0; // Avoid division by zero
        }
    
        const percentage = (autoCompletedPuzzles.length / this.solvedPuzzles.length);
        return parseFloat(percentage.toFixed(4)); // Return percentage rounded to 2 decimal places
    }
}

export default UserEngine;