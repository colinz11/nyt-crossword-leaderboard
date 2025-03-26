const express = require('express');
const NytController = require('../controllers/nytController');
const { NytPuzzle, Solution, User } = require('../models'); // Adjust the import based on your project structure

const router = express.Router();
const nytController = new NytController(NytPuzzle, Solution, User);

router.get('/fetch-and-save-puzzles-by-date-range', nytController.fetchAndSavePuzzlesByDateRange.bind(nytController));
router.get('/fetch-and-save-solutions-for-user', nytController.fetchAndSaveSolutionsForUser.bind(nytController));
router.get('/refresh-all', nytController.refreshAll.bind(nytController));

module.exports = router;