import { Request, Response } from 'express';
import { User } from '../models/user';
import NytService from '../services/nytService';

export const verifyAndCreateUser = async (req: Request, res: Response): Promise<void> => {
    const { username, token, expirationDate } = req.body;

    if (!username || !token || !expirationDate) {
        res.status(400).json({ error: 'Username, token, and expiration date are required' });
        return;
    }

    try {
        // Check if token is already in use
        const existingToken = await User.findOne({ cookie: token });
        if (existingToken) {
            res.status(400).json({ error: 'This NYT token is already registered to another user' });
            return;
        }

        // Create NYT service instance with the provided token
        const nytService = new NytService(token);

        // Try to fetch today's puzzle to verify the token
        try {
            await nytService.fetchPuzzles('mini', new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]);
        } catch (error) {
            res.status(401).json({ error: 'Invalid NYT token' });
            return;
        }

        // Check if username is already taken
        const existingUser = await User.findOne({ name: username });
        if (existingUser) {
            res.status(400).json({ error: 'Username is already taken' });
            return;
        }

        // Generate a new user ID (get the highest current ID and increment)
        const highestUser = await User.findOne().sort('-userID');
        const nextUserID = highestUser ? highestUser.userID + 1 : 1;

        // Create new user with expiration date
        const user = new User({
            userID: nextUserID,
            name: username,
            cookie: token,
            expirationDate: new Date(expirationDate)
        });

        await user.save();

        res.status(201).json({
            userID: user.userID,
            username: user.name,
            expirationDate: user.expirationDate
        });
    } catch (error) {
        console.error('Error verifying and creating user:', error);
        res.status(500).json({ error: 'Failed to verify and create user' });
    }
}; 