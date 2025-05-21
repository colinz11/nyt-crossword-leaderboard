import { Router } from 'express';
import NytController from '../controllers/nytController';
import { Puzzle } from '../models/puzzle';
import { Solution } from '../models/solution';
import { User } from '../models/user';
import { getUserStats } from '../controllers/userController';
import { getPuzzleSolutions } from '../controllers/puzzleController';

const router = Router();
const nytController = new NytController(Puzzle, Solution, User);

router.post('/nyt/puzzles', nytController.fetchAndSavePuzzlesByDateRange.bind(nytController));
router.post('/nyt/solutions', nytController.fetchAndSaveSolutionsForUser.bind(nytController));
router.post('/nyt/refresh-all', nytController.refreshAll.bind(nytController));
router.post('/nyt/save-user', nytController.saveUser.bind(nytController));
router.get('/users/stats/:userID', getUserStats);
router.get('/puzzles/:puzzleId/solutions', getPuzzleSolutions);

export default router;