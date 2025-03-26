const { NytPuzzle, Solution, User } = require('../models'); // Adjust the import based on your project structure
const NytService = require('../services/nytService');
const moment = require('moment'); // Add moment.js for date manipulation
require('dotenv').config(); // Load environment variables

class NytController {
    constructor(puzzleModel, solutionModel, userModel) {
        this.puzzleModel = puzzleModel;
        this.solutionModel = solutionModel;
        this.userModel = userModel;
    }

    async fetchAndSavePuzzlesByDateRange(req, res) {
        const { type, start, end } = req.query;
        const token = process.env.NYT_TOKEN; // Get the token from environment variables
        const nytService = new NytService(token);
        const startDate = moment(start);
        const endDate = moment(end);

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
        const startDate = moment(start);
        const endDate = moment(end);

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
                const solutionData = await nytService.fetchSolution(puzzle.puzzle_id);
                const newSolution = new this.solutionModel({
                    ...solutionData,
                    userId: user._id
                });
                await newSolution.save();
            }));

            res.status(200).json({ message: 'Solutions fetched and saved successfully' });
        } catch (error) {
            console.error('Error fetching or saving solutions for user:', error.message);
            res.status(500).json({ message: 'Error fetching or saving solutions for user', error: error.message });
        }
    }
}

module.exports = NytController;