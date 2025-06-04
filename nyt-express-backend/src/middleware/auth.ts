import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error('API_KEY environment variable is not set!');
    process.exit(1);
}

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.header('X-API-Key');

    if (!apiKey || apiKey !== API_KEY) {
        res.status(401).json({ error: 'Unauthorized: Invalid API key' });
        return;
    }

    next();
}; 