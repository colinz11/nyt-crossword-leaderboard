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

// GET /api/puzzles/today
export const getTodaysPuzzleDetails = async (req: Request, res: Response) => {
  try {
    // TODO: Implement logic to get the latest puzzle
    // For now, let's assume we have a function in puzzleEngine to get the latest puzzle
    const latestPuzzle = await puzzleEngine.getLatestPuzzle(); // This function needs to be created in PuzzleEngine

    if (!latestPuzzle) {
      return res.status(404).json({ error: 'No puzzles found' });
    }

    // TODO: Implement logic to get top 5 solvers for this puzzle
    // For now, let's assume we have a function in puzzleEngine to get top solvers for a puzzle
    const topSolvers = await puzzleEngine.getTopSolversForPuzzle(latestPuzzle.id, 5); // This function needs to be created in PuzzleEngine

    res.json({
      puzzle: latestPuzzle,
      topSolvers: topSolvers,
    });
  } catch (error: any) {
    console.error('Error fetching today\'s puzzle details:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s puzzle details' });
  }
};

// GET /api/puzzles/by-date/:date
export const getPuzzleByDate = async (req: Request, res: Response) => {
  const { date } = req.params; // Date will be in YYYY-MM-DD format

  try {
    // Validate date format if necessary (e.g., using a regex or library)
    // For now, assume date is in 'YYYY-MM-DD'
    const puzzle = await puzzleEngine.getPuzzleByPrintDate(date);

    if (!puzzle) {
      return res.status(404).json({ error: `No puzzle found for date ${date}` });
    }

    // Optionally, fetch top solvers for this puzzle as well
    const topSolvers = await puzzleEngine.getTopSolversForPuzzle(puzzle.id, 5);

    res.json({
      puzzle,
      topSolvers, // Or an empty array if you don't want to include solvers here
    });
  } catch (error: any) {
    console.error(`Error fetching puzzle for date ${date}:`, error);
    res.status(500).json({ error: `Failed to fetch puzzle for date ${date}` });
  }
};

/*
================================================================================
CONCEPTUAL BACKEND TESTS for puzzleController.ts
================================================================================

These tests would typically be in a separate file like `puzzleController.test.ts`
and use a testing framework like Jest with Supertest for HTTP requests and Mongoose mocking.

--------------------------------------------------------------------------------
TEST SUITE: puzzleController - GET /api/puzzles/today
--------------------------------------------------------------------------------

1.  **Should return today's puzzle and top solvers successfully (200 OK):**
    *   Mock `puzzleEngine.getLatestPuzzle` to return a valid puzzle document (including `body`).
    *   Mock `puzzleEngine.getTopSolversForPuzzle` to return an array of solver documents.
    *   Make a GET request to `/api/puzzles/today`.
    *   Assert status code is 200.
    *   Assert response body contains `puzzle` object with expected fields (e.g., `puzzleID`, `printDate`, `body`).
    *   Assert response body contains `topSolvers` array.

2.  **Should return 404 if no puzzles are found:**
    *   Mock `puzzleEngine.getLatestPuzzle` to return `null`.
    *   Make a GET request to `/api/puzzles/today`.
    *   Assert status code is 404.
    *   Assert response body contains an appropriate error message (e.g., `{ error: 'No puzzles found' }`).

3.  **Should handle errors from puzzleEngine.getLatestPuzzle (500 Internal Server Error):**
    *   Mock `puzzleEngine.getLatestPuzzle` to throw an error.
    *   Make a GET request to `/api/puzzles/today`.
    *   Assert status code is 500.
    *   Assert response body contains an appropriate error message.

4.  **Should handle errors from puzzleEngine.getTopSolversForPuzzle (500 Internal Server Error):**
    *   Mock `puzzleEngine.getLatestPuzzle` to return a valid puzzle.
    *   Mock `puzzleEngine.getTopSolversForPuzzle` to throw an error.
    *   Make a GET request to `/api/puzzles/today`.
    *   Assert status code is 500.
    *   Assert response body contains an appropriate error message.

--------------------------------------------------------------------------------
TEST SUITE: puzzleController - GET /api/puzzles/by-date/:date
--------------------------------------------------------------------------------

1.  **Should return puzzle and solvers for a valid date with a puzzle (200 OK):**
    *   Define a valid date string (e.g., '2023-10-26').
    *   Mock `puzzleEngine.getPuzzleByPrintDate` to return a valid puzzle document for that date.
    *   Mock `puzzleEngine.getTopSolversForPuzzle` to return an array of solvers.
    *   Make a GET request to `/api/puzzles/by-date/2023-10-26`.
    *   Assert status code is 200.
    *   Assert response body contains `puzzle` and `topSolvers`.
    *   Assert `puzzle.printDate` (or a transformed version) matches the requested date.

2.  **Should return 404 if no puzzle is found for the given date:**
    *   Define a date string for which no puzzle exists.
    *   Mock `puzzleEngine.getPuzzleByPrintDate` to return `null`.
    *   Make a GET request to `/api/puzzles/by-date/YYYY-MM-DD`.
    *   Assert status code is 404.
    *   Assert response body contains an error message like `{ error: 'No puzzle found for date YYYY-MM-DD' }`.

3.  **Should handle invalid date format in parameter (though current controller doesn't explicitly validate format):**
    *   (Optional, good to have) If date format validation were added, test it.
    *   Currently, an invalid date format might pass to `new Date()` in `puzzleEngine` and result in `null` or an unexpected date, likely leading to a 404 if no puzzle matches.

4.  **Should handle errors from puzzleEngine.getPuzzleByPrintDate (500 Internal Server Error):**
    *   Mock `puzzleEngine.getPuzzleByPrintDate` to throw an error.
    *   Make a GET request to `/api/puzzles/by-date/YYYY-MM-DD`.
    *   Assert status code is 500.

5.  **Should handle errors from puzzleEngine.getTopSolversForPuzzle when fetching for a specific date (500 Internal Server Error):**
    *   Mock `puzzleEngine.getPuzzleByPrintDate` to return a valid puzzle.
    *   Mock `puzzleEngine.getTopSolversForPuzzle` to throw an error.
    *   Make a GET request to `/api/puzzles/by-date/YYYY-MM-DD`.
    *   Assert status code is 500.

--------------------------------------------------------------------------------
General Considerations for Backend Tests:
--------------------------------------------------------------------------------
-   Use `mongodb-memory-server` for in-memory MongoDB instances to avoid reliance on a live DB.
-   Ensure proper setup and teardown of test environment (e.g., clearing mocks, disconnecting DB).
-   Test for edge cases (e.g., empty arrays for solvers).
-   Verify that sensitive data is not accidentally exposed if applicable.
-   Check that `puzzle.body` is returned and `solution.solvePath` is included in solver objects (even if empty, the field should be there if defined in the schema).
*/
