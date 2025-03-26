const NytService = require('../services/nytService');
const moment = require('moment');
require('dotenv').config();

class NytController {
    constructor(puzzleModel, solutionModel, userModel) {
        this.puzzleModel = puzzleModel;
        this.solutionModel = solutionModel;
        this.userModel = userModel;
    }

    async fetchAndSavePuzzlesByDateRange(req, res) {
        const { type, start, end } = req.query;
        const token = process.env.NYT_TOKEN;

        if (!type || !start || !end) {
            return res.status(400).json({ message: 'Missing required query parameters: type, start, end' });
        }

        const nytService = new NytService(token);
        const startDate = moment(start);
        const endDate = moment(end);

        if (!startDate.isValid() || !endDate.isValid()) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        try {
            let currentStartDate = startDate;
            let currentEndDate = moment(startDate).endOf('month');

            while (currentStartDate.isBefore(endDate)) {
                if (currentEndDate.isAfter(endDate)) {
                    currentEndDate = endDate;
                }

                const puzzles = await nytService.fetchPuzzles(type, currentStartDate.format('YYYY-MM-DD'), currentEndDate.format('YYYY-MM-DD'));

                await Promise.all(puzzles.map(async (puzzleData) => {
                    await this.puzzleModel.findOneAndUpdate(
                        { puzzle_id: puzzleData.puzzle_id },
                        puzzleData,
                        { upsert: true, new: true }
                    );
                }));

                currentStartDate = currentEndDate.add(1, 'day').startOf('day');
                currentEndDate = moment(currentStartDate).endOf('month');
            }

            res.status(200).json({ message: 'Puzzles fetched and saved successfully' });
        } catch (error) {
            console.error('Error fetching or saving puzzles by date range:', error.message);
            res.status(500).json({ message: 'Error fetching or saving puzzles by date range', error: error.message });
        }
    }

    async fetchAndSaveSolutionsForUser(req, res) {
        const { userId, start, end } = req.query;

        if (!userId || !start || !end) {
            return res.status(400).json({ message: 'Missing required query parameters: userId, start, end' });
        }

        const startDate = moment(start);
        const endDate = moment(end);

        if (!startDate.isValid() || !endDate.isValid()) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        try {
            // Query the user table for the cookie value (token)
            const user = await this.userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const token = user.cookie;
            const nytService = new NytService(token);

            // Query the puzzles between the start and end dates
            const puzzles = await this.puzzleModel.find({
                print_date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
            });

            // Fetch and save solutions for the puzzles
            await Promise.all(puzzles.map(async (puzzle) => {
                const solutionData = await nytService.fetchSolution(puzzle.puzzle_id, user.userID);
                await this.solutionModel.findOneAndUpdate(
                    { userId: user._id, puzzle_id: puzzle.puzzle_id },
                    { ...solutionData, userId: user._id },
                    { upsert: true, new: true }
                );
            }));

            res.status(200).json({ message: 'Solutions fetched and saved successfully' });
        } catch (error) {
            console.error('Error fetching or saving solutions for user:', error.message);
            res.status(500).json({ message: 'Error fetching or saving solutions for user', error: error.message });
        }
    }

    async refreshAll(req, res) {
        const token = process.env.NYT_TOKEN;

        if (!token) {
            return res.status(400).json({ message: 'Missing NYT token' });
        }

        const nytService = new NytService(token);

        try {
            // Fetch all puzzles
            const puzzles = await nytService.fetchPuzzles('mini', '2020-01-01', moment().format('YYYY-MM-DD'));
            await Promise.all(puzzles.map(async (puzzleData) => {
                await this.puzzleModel.findOneAndUpdate(
                    { puzzle_id: puzzleData.puzzle_id },
                    puzzleData,
                    { upsert: true, new: true }
                );
            }));

            // Fetch all users
            const users = await this.userModel.find();

            // Fetch and save solutions for each user
            const puzzleIds = puzzles.map(puzzle => puzzle.puzzle_id);
            await Promise.all(users.map(async (user) => {
                const userId = user._id;
                const token = user.cookie;
                const nytService = new NytService(token);

                await Promise.all(puzzleIds.map(async (puzzleId) => {
                    const solutionData = await nytService.fetchSolution(puzzleId, userId);
                    await this.solutionModel.findOneAndUpdate(
                        { userId: userId, puzzle_id: puzzleId },
                        { ...solutionData, userId: userId },
                        { upsert: true, new: true }
                    );
                }));
            }));

            res.status(200).json({ message: 'All puzzles and solutions fetched and saved successfully' });
        } catch (error) {
            console.error('Error refreshing all puzzles and solutions:', error.message);
            res.status(500).json({ message: 'Error refreshing all puzzles and solutions', error: error.message });
        }
    }
}

module.exports = NytController;