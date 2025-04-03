import { Router } from 'express';
import { getUserStats } from '../controllers/userController';

const router = Router();

// Define the endpoint to fetch user stats
router.get('/stats/:userID', getUserStats);

export default router;