import { Request, Response } from 'express';
import PuzzleEngine from '../engine/puzzleEngine';
import { Solution } from '../models/solution';
import { Puzzle } from '../models/puzzle'; // Import Puzzle model

// Instantiate the PuzzleEngine with your models
const puzzleEngine = new PuzzleEngine(Solution, Puzzle); // Pass Puzzle model to constructor

// GET /api/puzzles/:puzzleId/solutions
export const getPuzzleSolutions = async (req: Request, res: Response): Promise<any>  => {
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

// GET /api/puzzles/today
export const getTodaysPuzzleDetails = async (req: Request, res: Response): Promise<any>  => {
  try {
   
    const latestPuzzle = await puzzleEngine.getLatestPuzzle();

    if (!latestPuzzle) {
      return res.status(404).json({ error: 'No puzzles found' });
    }

    const result = await puzzleEngine.getPuzzleDetailsWithTopSolutions(latestPuzzle.puzzleID.toString()); 
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching today\'s puzzle details:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s puzzle details' });
  }
};

// GET /api/puzzles/by-date/:date
export const getPuzzleByDate = async (req: Request, res: Response): Promise<any>  => {
  const { date } = req.params; // Date will be in YYYY-MM-DD format

  try {
    // Validate date format if necessary (e.g., using a regex or library)
    // For now, assume date is in 'YYYY-MM-DD'
    const puzzle = await puzzleEngine.getPuzzleByPrintDate(date);

    if (!puzzle) {
      return res.status(404).json({ error: `No puzzle found for date ${date}` });
    }

    // Optionally, fetch top solvers for this puzzle as well
    const result = await puzzleEngine.getPuzzleDetailsWithTopSolutions(puzzle.puzzleID.toString());
    res.json(result);
  } catch (error: any) {
    console.error(`Error fetching puzzle for date ${date}:`, error);
    res.status(500).json({ error: `Failed to fetch puzzle for date ${date}` });
  }
};
