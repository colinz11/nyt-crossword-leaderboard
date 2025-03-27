import { Router } from 'express';
import NytController from '../controllers/nytController';
import { Puzzle } from '../models/puzzle';
import { Solution } from '../models/solution';
import { User } from '../models/user';

const router = Router();
const nytController = new NytController(Puzzle, Solution, User);

router.post('/puzzles', nytController.fetchAndSavePuzzlesByDateRange.bind(nytController));
router.post('/solutions', nytController.fetchAndSaveSolutionsForUser.bind(nytController));
router.post('/refresh-all', nytController.refreshAll.bind(nytController));
router.post('/save-user', nytController.saveUser.bind(nytController));

export default router;