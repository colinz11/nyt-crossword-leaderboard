import { Model } from 'mongoose';
import { PuzzleDocument } from '../models/puzzle';
import { SolutionDocument } from '../models/solution';
import { UserDocument } from '../models/user';
import moment from 'moment-timezone'; // Ensure moment.js is installed

// Define a new type for enriched solutions
type EnrichedSolution = SolutionDocument & { printDate: string };

// Update locale to set Sunday as the start of the week
moment.updateLocale('en', {
    week: {
        dow: 1, // Sunday is the first day of the week
        doy: 4, // The week containing Jan 6th is the first week of the year
    },
});


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
    
    async getUserSolutions(userID: string, startDate?: string, endDate?: string): Promise<void> {
        try {
            // Build puzzle query with date range if provided
            const puzzleQuery: any = {
                printDate: { $lte: moment().endOf('day').toDate() }, // Never include future puzzles
                publishType: 'Mini' // Only include mini puzzles
            };
            
            if (startDate || endDate) {
                if (startDate) {
                    puzzleQuery.printDate.$gte = moment(startDate).startOf('day').toDate();
                }
                if (endDate) {
                    // Make sure we don't exceed today's date
                    const endMoment = moment(endDate).endOf('day');
                    const today = moment().endOf('day');
                    puzzleQuery.printDate.$lte = endMoment.isAfter(today) ? today.toDate() : endMoment.toDate();
                }
            }

            console.log('Puzzle query:', JSON.stringify(puzzleQuery, null, 2));

            // First get valid puzzles within the date range
            const validPuzzles = await this.puzzleModel.find(puzzleQuery).sort({ printDate: 1 }).exec();

            const validPuzzleIds = validPuzzles.map(puzzle => puzzle.puzzleID);

            // Then fetch only solutions for these valid puzzles
            this.userSolutions = await this.solutionModel.find({ 
                userID,
                puzzleID: { $in: validPuzzleIds }
            }).exec();

            // Create a map of puzzleID to printDate for quick lookup
            const puzzleDateMap = validPuzzles.reduce((map, puzzle) => {
                map[puzzle.puzzleID] = puzzle.printDate;
                return map;
            }, {} as Record<string, Date>);

            // Add printDate to each solution
            const solutionsWithDates = this.userSolutions.map(solution => ({
                ...solution.toObject(),
                printDate: puzzleDateMap[solution.puzzleID],
            }));

            // Sort solutions by printDate (ascending order)
            this.sortedSolutions = solutionsWithDates.sort(
                (a, b) => new Date(a.printDate).getTime() - new Date(b.printDate).getTime()
            );

            // Update solvedPuzzles to only include solved puzzles
            this.solvedPuzzles = this.sortedSolutions.filter(solution => solution.calcs?.solved);

            // Log date range of returned solutions
            if (this.sortedSolutions.length > 0) {
                console.log('\nSolutions summary:');
                console.log('First solution date:', moment(this.sortedSolutions[0].printDate).format('YYYY-MM-DD'));
                console.log('Last solution date:', moment(this.sortedSolutions[this.sortedSolutions.length - 1].printDate).format('YYYY-MM-DD'));
                console.log('Number of solutions:', this.sortedSolutions.length);
                console.log('Number of solved puzzles:', this.solvedPuzzles.length);
            }

            console.log(`User solutions fetched and sorted for userID ${userID}:`, {
                totalPuzzlesInRange: validPuzzles.length,
                matchingSolutions: this.sortedSolutions.length,
                solvedPuzzles: this.solvedPuzzles.length
            });
        } catch (error) {
            console.error(`Error fetching solutions for userID ${userID}:`, error);
            throw new Error('Failed to fetch and sort user solutions');
        }
    }

    getAverageSolveTime(): number {
        const totalSolveTime = this.solvedPuzzles.reduce((acc, solution) => {
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
        for (let i = this.sortedSolutions.length - 1; i >= 0; i--) {
            if (this.sortedSolutions[i].calcs?.solved) {
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

    getStatsByDay(dayOfWeek: string): {
        averageSolveTime: number;
        bestSolveTime: number;
        bestDate: string;
        thisWeeksTime: number;
        thisWeeksDate: string;
    } {
        // Filter solutions for the given day of the week and only include solved solutions
        const solutionsForDay = this.sortedSolutions.filter(solution => {
            // Use UTC date directly without adding a day
            const solutionDay = moment(solution.printDate).utc().format('dddd');
            return solutionDay.toLowerCase() === dayOfWeek.toLowerCase() && solution.calcs?.solved;
        });
    
        if (solutionsForDay.length === 0) {
            // Return default values if no solutions exist for the given day
            return {
                averageSolveTime: 0,
                bestSolveTime: 0,
                bestDate: '',
                thisWeeksTime: 0,
                thisWeeksDate: '',
            };
        }
    
        // Calculate average solve time
        const totalSolveTime = solutionsForDay.reduce(
            (acc, solution) => acc + (solution.calcs?.secondsSpentSolving || 0),
            0
        );
        const averageSolveTime = totalSolveTime / solutionsForDay.length;
    
        // Find the best solve time and its date
        const bestSolve = solutionsForDay.reduce(
            (best, solution) => {
                const utcDate = moment(solution.printDate).utc();
                return solution.calcs?.secondsSpentSolving !== undefined &&
                    solution.calcs.secondsSpentSolving < best.time
                    ? { time: solution.calcs.secondsSpentSolving, date: utcDate.format('YYYY-MM-DD') }
                    : best;
            },
            { time: Number.MAX_SAFE_INTEGER, date: '' }
        );
    
        // Find this week's solve time and its date
        const thisWeeksSolve = solutionsForDay.find(solution => {
            const utcDate = moment(solution.printDate).utc();
            return utcDate.isSame(moment().utc(), 'week') &&
                utcDate.format('dddd').toLowerCase() === dayOfWeek.toLowerCase();
        });
    
        // Calculate the date for the given day of the week in the current week
        const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(dayOfWeek.toLowerCase());
        const thisWeeksDate = moment().utc().startOf('week').add(dayIndex, 'days').format('YYYY-MM-DD');
    
        return {
            averageSolveTime: parseFloat(averageSolveTime.toFixed(2)),
            bestSolveTime: bestSolve.time === Number.MAX_SAFE_INTEGER ? 0 : bestSolve.time,
            bestDate: bestSolve.date,
            thisWeeksTime: thisWeeksSolve?.calcs?.secondsSpentSolving || 0,
            thisWeeksDate: thisWeeksDate,
        };
    }
}

export default UserEngine;