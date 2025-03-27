import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment'; 

interface Puzzle {
    author: string;
    editor: string;
    formatType: string;
    printDate: string;
    publishType: string;
    puzzleID: string;
    title: string;
    version: string;
}

interface SolutionCell {
    confirmed: boolean;
    guess: string;
    timestamp: Date;
    blank: boolean;
    checked: boolean;
}

interface SolutionCalcs {
    percentFilled: number;
    secondsSpentSolving: number;
    solved: boolean;
}

interface SolutionFirsts {
    checked: number;
    cleared: number;
    opened: number;
    solved: number;
}

interface Solution {
    board: {
        cells: SolutionCell[];
    };
    calcs: SolutionCalcs;
    firsts: SolutionFirsts;
    lastCommitID: string;
    puzzleID: string;
    timestamp: Date;
    userID: string;
    minGuessTime: number;
    lastSolve: Date;
    autocheckEnabled: boolean;
}

class NytService {
    private baseUrl: string;
    private token: string;

    constructor(token: string) {
        this.baseUrl = process.env.NYT_BASE_URL || 'https://nytimes.com/';
        this.token = token;
    }

    private async nyt(path: string): Promise<any> {
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                "Cookie": `NYT-S=${this.token}`
            }
        };

        try {
            const response = await axios.get(`${this.baseUrl}${path}`, axiosConfig);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error(`Error fetching data from ${path}:`, error.response.data);
                throw new Error(`Failed to fetch data from ${path}: ${error.response.data.message}`);
            } else if (error.request) {
                console.error(`No response received from ${path}:`, error.request);
                throw new Error(`No response received from ${path}`);
            } else {
                console.error(`Error setting up request to ${path}:`, error.message);
                throw new Error(`Error setting up request to ${path}`);
            }
        }
    }

   

    public async fetchPuzzles(type: string, start: string, end: string): Promise<Puzzle[]> {
        const startDate = moment(start);
        const endDate = moment(end);
    
        if (!startDate.isValid() || !endDate.isValid()) {
            throw new Error('Invalid date format');
        }
    
        const puzzles: Puzzle[] = [];
    
        let currentStartDate = startDate.clone();
        let currentEndDate = startDate.clone().endOf('month');
    
        while (currentStartDate.isBefore(endDate)) {
            if (currentEndDate.isAfter(endDate)) {
                currentEndDate = endDate.clone();
            }
    
            const path = `svc/crosswords/v3/puzzles.json?publish_type=${type}&date_start=${currentStartDate.format('YYYY-MM-DD')}&date_end=${currentEndDate.format('YYYY-MM-DD')}`;
            try {
                const json = await this.nyt(path);
                puzzles.push(...json.results.map(this.transformPuzzleData));
            } catch (error: any) {
                console.error(`Error fetching puzzles for range ${currentStartDate.format('YYYY-MM-DD')} to ${currentEndDate.format('YYYY-MM-DD')}:`, error.message);
                throw new Error('Failed to fetch puzzles');
            }
    
            // Move to the next month
            currentStartDate = currentEndDate.clone().add(1, 'day').startOf('day');
            currentEndDate = currentStartDate.clone().endOf('month');
        }
    
        return puzzles;
    }

    public async fetchSolution(puzzleId: string, userId: string): Promise<Solution> {
        const path = `svc/crosswords/v6/game/${puzzleId}.json`;
        try {
            const json = await this.nyt(path);
            return this.transformSolutionData(json, puzzleId, userId);
        } catch (error: any) {
            console.error(`Error fetching solution for puzzle ID ${puzzleId}:`, error.message);
            throw new Error('Failed to fetch solution');
        }
    }

    private transformPuzzleData(puzzle: any): Puzzle {
        return {
            author: puzzle.author,
            editor: puzzle.editor,
            formatType: puzzle.format_type,
            printDate: new Date(puzzle.print_date).toISOString(),
            publishType: puzzle.publish_type,
            puzzleID: puzzle.puzzle_id,
            title: puzzle.title || '',
            version: puzzle.version
        };
    }

    private transformSolutionData(json: any, puzzleId: string, userId: string): Solution {
        return {
            board: {
                cells: Array.isArray(json.board?.cells)
                    ? json.board.cells.map((cell: any) => ({
                          confirmed: cell.confirmed,
                          guess: cell.guess,
                          timestamp: cell.timestamp,
                          blank: cell.blank,
                          checked: cell.checked,
                      }))
                    : [],
            },
            calcs: {
                percentFilled: json.calcs?.percentFilled,
                secondsSpentSolving: json.calcs.secondsSpentSolving,
                solved: json.calcs?.solved,
            },
            firsts: {
                checked: json.firsts?.checked ?? 0,
                cleared: json.firsts?.cleared ?? 0,
                opened: json.firsts?.opened ?? 0,
                solved: json.firsts?.solved ?? 0,
            },
            lastCommitID: json.lastCommitID,
            puzzleID: puzzleId,
            timestamp: json.timestamp,
            userID: userId,
            minGuessTime: json.minGuessTime ?? 0,
            lastSolve: json.lastSolve,
            autocheckEnabled: json.autocheckEnabled,
        };
    }
}

export default NytService;