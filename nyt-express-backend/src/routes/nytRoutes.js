const express = require('express');
const NytController = require('../controllers/nytController');
const { NytPuzzle, Solution, User } = require('../models'); 
const router = express.Router();

const nytController = new NytController(NytPuzzle, Solution, User);

// Define the routes
router.get('/fetch-and-save-puzzles-by-date-range', nytController.fetchAndSavePuzzlesByDateRange.bind(nytController));
router.get('/fetch-and-save-solutions-for-user', nytController.fetchAndSaveSolutionsForUser.bind(nytController));

module.exports = router;