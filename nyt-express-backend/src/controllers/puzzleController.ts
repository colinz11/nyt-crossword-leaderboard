import { Request, Response } from 'express';
import PuzzleEngine from '../engine/puzzleEngine';
import { Solution } from '../models/solution';
import { Puzzle } from '../models/puzzle'; // Import Puzzle model

// Instantiate the PuzzleEngine with your models
const puzzleEngine = new PuzzleEngine(Solution, Puzzle); // Pass Puzzle model to constructor

// GET /api/puzzles/:puzzleId/solutions
export const getPuzzleSolutions = async (req: Request, res: Response) => {
  const { puzzleId } = req.params;

  try {
    // Fetch puzzle details and top solutions
    const result = await puzzleEngine.getPuzzleDetailsWithTopSolutions(puzzleId);
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching puzzle details and top solutions:', error);
    if (error.message === 'Puzzle not found') {
      res.status(404).json({ error: 'Puzzle not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch puzzle details and top solutions' });
    }
  }
};

