import { Router } from 'express';
import { getUserStats } from '../controllers/userController';
import { verifyAndCreateUser } from '../controllers/authController';

const router = Router();

// Get user stats
router.get('/users/stats/:userID', getUserStats);

// Verify and create user
router.post('/users/verify', verifyAndCreateUser);

export default router; 