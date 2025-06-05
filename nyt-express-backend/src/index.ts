import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import nytRoutes from './routes/nytRoutes';
import cronRoutes from './routes/cronRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
import { authenticateApiKey } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from the frontend
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL as string)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Database connection error:', err));

// Health check endpoint for Vercel - no auth required
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

// Cron job routes - protected by CRON_SECRET
app.use('/api/cron', cronRoutes);

// Apply authentication middleware to all API routes
app.use('/api', authenticateApiKey, nytRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app; 