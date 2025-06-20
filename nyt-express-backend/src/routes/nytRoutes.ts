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
import { refreshPuzzle } from '../api/cron/refresh-puzzle';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

const router = Router();
const nytController = new NytController(Puzzle, Solution, User);

// NYT Routes
router.post('/nyt/puzzles', nytController.fetchAndSavePuzzlesByDateRange.bind(nytController));
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

// Cron Routes
router.get('/cron/refresh-puzzle', (req: ExpressRequest, res: ExpressResponse) => {
    // The imported `refreshPuzzle` handler has a signature that is not directly
    // compatible with Express. We cast the request and response objects to 'any'
    // to bypass the type-checking and allow Express to call the handler.
    refreshPuzzle(req as any, res as any);
});

export default router;
