import { Router } from 'express';
import NytController from '../controllers/nytController';
import { Puzzle } from '../models/puzzle';
import { Solution } from '../models/solution';
import { User } from '../models/user';
import { getUserStats, deleteUser, getAllUsers } from '../controllers/userController';
import { verifyAndCreateUser } from '../controllers/authController';
import { 
    getPuzzleSolutions, 
    getTodaysPuzzleDetails, 
    getPuzzleByDate,
    getAllPuzzles
} from '../controllers/puzzleController';
import {
    getLeaderboardByAverageTime,
    getLeaderboardByPuzzlesSolved,
    getLeaderboardByLongestStreak
} from '../controllers/leaderboardController';

const router = Router();
const nytController = new NytController(Puzzle, Solution, User);

// NYT Routes
router.post('/nyt/puzzles', nytController.fetchAndSavePuzzlesByDateRange.bind(nytController));
router.post('/nyt/refresh-solutions', nytController.refreshUserSolutions.bind(nytController));
router.post('/nyt/save-user', nytController.saveUser.bind(nytController));
router.post('/nyt/fetch-solutions', nytController.fetchAndSaveSolutionsForUser.bind(nytController));

// User Routes
router.get('/users/stats/:userID', getUserStats);
router.delete('/users/:userID', deleteUser);
router.get('/users', getAllUsers);
router.post('/users/verify', verifyAndCreateUser);

// Puzzle Routes
router.get('/puzzles', getAllPuzzles);
router.get('/puzzles/:puzzleId/solutions', getPuzzleSolutions);
router.get('/puzzles/today', getTodaysPuzzleDetails);
router.get('/puzzles/by-date/:date', getPuzzleByDate);

// Leaderboard Routes
router.get('/leaderboard/average-time', getLeaderboardByAverageTime);
router.get('/leaderboard/puzzles-solved', getLeaderboardByPuzzlesSolved);
router.get('/leaderboard/longest-streak', getLeaderboardByLongestStreak);

export default router;
