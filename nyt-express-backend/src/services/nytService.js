const axios = require('axios');

class NytService {
    constructor(token) {
        this.baseUrl = 'https://nytimes.com/';
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
            console.error(`Error fetching data from ${path}:`, error.message);
            throw new Error(`Failed to fetch data from ${path}`);
        }
    }

    async fetchPuzzles(type, start, end) {
        const path = `svc/crosswords/v3/puzzles.json?publish_type=${type}&date_start=${start}&date_end=${end}`;
        try {
            const json = await this.nyt(path);
            return json.results;
        } catch (error) {
            console.error(`Error fetching puzzles:`, error.message);
            throw new Error('Failed to fetch puzzles');
        }
    }

    async fetchSolution(puzzleId) {
        const path = `svc/crosswords/v6/game/${puzzleId}.json`;
        try {
            const json = await this.nyt(path);
            return json;
        } catch (error) {
            console.error(`Error fetching solution for puzzle ID ${puzzleId}:`, error.message);
            throw new Error('Failed to fetch solution');
        }
    }
}

module.exports = NytService;