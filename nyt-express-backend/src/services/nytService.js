const axios = require('axios');

class NytService {
    constructor(token) {
        this.baseUrl = process.env.NYT_BASE_URL || 'https://nytimes.com/';
        this.token = token;
    }

    async nyt(path) {
        const axiosConfig = {
            headers: {
                "Cookie": `NYT-S=${this.token}`
            }
        };

        try {
            const response = await axios.get(`${this.baseUrl}${path}`, axiosConfig);
            return response.data;
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 200 range
                console.error(`Error fetching data from ${path}:`, error.response.data);
                throw new Error(`Failed to fetch data from ${path}: ${error.response.data.message}`);
            } else if (error.request) {
                // Request was made but no response received
                console.error(`No response received from ${path}:`, error.request);
                throw new Error(`No response received from ${path}`);
            } else {
                // Something happened in setting up the request
                console.error(`Error setting up request to ${path}:`, error.message);
                throw new Error(`Error setting up request to ${path}`);
            }
        }
    }

    async fetchPuzzles(type, start, end) {
        const path = `svc/crosswords/v3/puzzles.json?publish_type=${type}&date_start=${start}&date_end=${end}`;
        try {
            const json = await this.nyt(path);
            return json.results.map(this.transformPuzzleData);
        } catch (error) {
            console.error(`Error fetching puzzles:`, error.message);
            throw new Error('Failed to fetch puzzles');
        }
    }

    async fetchSolution(puzzleId, userId) {
        const path = `svc/crosswords/v6/game/${puzzleId}.json`;
        try {
            const json = await this.nyt(path);
            return this.transformSolutionData(json, puzzleId, userId);
        } catch (error) {
            console.error(`Error fetching solution for puzzle ID ${puzzleId}:`, error.message);
            throw new Error('Failed to fetch solution');
        }
    }

    transformPuzzleData(puzzle) {
        return {
            author: puzzle.author,
            editor: puzzle.editor,
            format_type: puzzle.format_type,
            print_date: new Date(puzzle.print_date),
            publish_type: puzzle.publish_type,
            puzzle_id: puzzle.puzzle_id,
            title: puzzle.title || '',
            version: puzzle.version,
            percent_filled: puzzle.percent_filled,
            solved: puzzle.solved,
            star: puzzle.star || null
        };
    }

    transformSolutionData(json, puzzleId, userId) {
        return {
            board: {
                cells: json.board.map(cell => ({
                    confirmed: cell.confirmed,
                    guess: cell.guess,
                    timestamp: cell.timestamp,
                    blank: cell.blank,
                    checked: cell.checked
                }))
            },
            calcs: {
                percentFilled: json.calcs.percentFilled,
                secondsSpentSolving: json.calcs.secondsSpentSolving,
                solved: json.calcs.solved
            },
            firsts: {
                checked: json.firsts?.checked ?? 0,
                cleared: json.firsts?.cleared ?? 0,
                opened: json.firsts?.opened ?? 0,
                solved: json.firsts?.solved ?? 0
            },
            lastCommitID: json.lastCommitID,
            puzzleID: puzzleId,
            timestamp: json.timestamp,
            userID: userId,
            minGuessTime: json.minGuessTime ?? 0,
            lastSolve: json.lastSolve,
            autocheckEnabled: json.autocheckEnabled ?? false
        };
    }
}

module.exports = NytService;