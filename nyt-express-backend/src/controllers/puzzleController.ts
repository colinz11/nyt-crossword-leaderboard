import { Request, Response } from 'express';
import PuzzleEngine from '../engine/puzzleEngine';
import { Solution } from '../models/solution';

// Instantiate the PuzzleEngine with your models
const puzzleEngine = new PuzzleEngine(Solution);

// GET /api/puzzles/:puzzleId/solutions
export const getPuzzleSolutions = async (req: Request, res: Response) => {
  const { puzzleId } = req.params;

  try {
    // Fetch all solutions for the given puzzle ID
    const solutions = await puzzleEngine.getSolutionsByGameId(puzzleId);


    res.json(solutions);
  } catch (error) {
    console.error('Error fetching puzzle solutions:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle solutions' });
  }
};

