import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Link as RouterLink removed, SolverList handles it
import { Typography, Container, Box, CircularProgress, Alert } from '@mui/material'; // List, ListItem, ListItemText removed
import { fetchPuzzleDataByDate, fetchTodaysPuzzleData } from '../services/FetchData'; // Import services
import CrosswordDisplay, { CrosswordBoardData, SolutionForDisplay, CrosswordCell } from '../components/CrosswordDisplay'; // Import the new component and types
import SolverList from '../components/SolverList'; // Import SolverList

// Interface for Puzzle data (matching backend response)
interface PuzzleApiResponse { // Renamed to avoid conflict with internal Puzzle type if any
  _id: string; // MongoDB document ID
  puzzleID: string; // The specific ID for the puzzle (e.g., from NYT)
  printDate: string;
  editor?: string;
  author?: string;
  title?: string;
  body?: NytPuzzleBody; // Assuming this is where NYT specific structure is
  // Other raw fields from NYT like 'grid' (solution) might exist
  // but 'body' is expected to have the canonical structure.
  // We might also have a pre-parsed `structure: CrosswordBoardData` from backend in future.
}

// More detailed assumed structure for NYT's puzzle.body
interface NytGridCell {
  answer: string | null; // The correct character for the cell
  clueNumbers?: number[]; // Numbers this cell is associated with (start of across/down)
  isBlack: boolean;
  isCircled?: boolean;
  // Other NYT specific fields might exist
}

interface NytPuzzleBody {
  size: { rows: number; cols: number };
  grid: NytGridCell[]; // Flat array, length = rows * cols
}

// Interface for Solver data (matching backend response)
interface SolverApiResponse { // Renamed
  userID: string;
  calcs?: {
    secondsSpentSolving?: number;
  };
  solvePath?: Array<{cell: {row: number, col: number}, char: string, timestamp: number}>; // Assumed for race lines
  // username?: string; // If you join username in the backend
}

// Combined interface for the page's data state
interface PuzzlePageData {
  puzzle: PuzzleApiResponse;
  topSolutions: SolverApiResponse[];
}

// Helper function to transform API puzzle data to CrosswordBoardData
const transformNytBodyToBoardData = (nytBody: NytPuzzleBody | undefined, puzzleID: string): CrosswordBoardData => {
  if (!nytBody || !nytBody.grid || !nytBody.size || nytBody.grid.length === 0) {
    console.warn(`NYT body for puzzle ${puzzleID} is missing, incomplete, or grid is empty. Using default empty grid.`);
    const defaultSize = 15; // Default for many NYT puzzles
    return {
      size: { rows: defaultSize, cols: defaultSize },
      grid: Array(defaultSize).fill(null).map(() =>
        Array(defaultSize).fill(null).map(() => ({ char: null, isBlack: false, number: null }))
      ),
    };
  }

  const { size, grid: flatNytGrid } = nytBody;
  const newGrid: CrosswordCell[][] = Array(size.rows).fill(null).map(() =>
    Array(size.cols).fill(null).map(() => ({
      char: null, // Empty grid for display initially
      isBlack: false,
      number: null,
    }))
  );

  // Populate grid cells (black cells and numbers)
  for (let r = 0; r < size.rows; r++) {
    for (let c = 0; c < size.cols; c++) {
      const flatIndex = r * size.cols + c;
      const nytCellData = flatNytGrid[flatIndex];

      if (nytCellData.isBlack) {
        newGrid[r][c].isBlack = true;
      } else {
        // Check for clue numbers associated with this cell
        // NYT often puts the number directly in the cell that starts a clue.
        // The `clueNumbers` array in NytGridCell might hold these.
        // Or, we might need to infer them by looking at `nytCluesSource` and `relatedAnswerCells`.
        // For simplicity, if `nytCellData.clueNumbers` exists and has items, take the first.
        if (nytCellData.clueNumbers && nytCellData.clueNumbers.length > 0) {
          newGrid[r][c].number = nytCellData.clueNumbers[0];
        }
        // `char` will be left null for an empty display. If we wanted to show solution:
        // newGrid[r][c].char = nytCellData.answer;
      }
    }
  }



  return {
    size: { rows: size.rows, cols: size.cols },
    grid: newGrid
  };
};


const transformSolversForDisplay = (solvers: SolverApiResponse[] | undefined): SolutionForDisplay[] => {
  if (!solvers) return [];
  return solvers.map(s => ({
    userId: s.userID,
    solvePath: s.solvePath || [], // Ensure solvePath is an array
    totalTime: s.calcs?.secondsSpentSolving || 0,
    // color can be assigned here or in CrosswordDisplay
  }));
};


// Props for PuzzlePage (currently none as params are from URL)
// interface PuzzlePageProps {}

const PuzzlePage: React.FC = () => {
  const { dateString, puzzleId: routePuzzleId } = useParams<{ dateString?: string; puzzleId?: string }>();
  const [pageData, setPageData] = useState<PuzzlePageData | null>(null);
  const [transformedBoardData, setTransformedBoardData] = useState<CrosswordBoardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPuzzleData = async () => {
      setLoading(true);
      setError(null);
      setPageData(null); // Reset page data on new load
      setTransformedBoardData(null); // Reset board data

      try {
        let fetchedData: PuzzlePageData | null = null;
        if (dateString) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            setError("Invalid date format. Please use YYYY-MM-DD.");
            setLoading(false);
            return;
          }
          fetchedData = await fetchPuzzleDataByDate(dateString) as PuzzlePageData;
        } else if (routePuzzleId) {
           // This case implies fetching today's puzzle if /puzzle is hit,
           // or a specific puzzle if /puzzle/:puzzleId (non-date) is hit.
           // The current logic defaults to today's puzzle if no dateString.
           // If puzzleId is meant to be a specific non-date ID, backend needs to handle that.
           // For now, we assume /puzzle means today, and /puzzle/:dateString for specific dates.
           // If routePuzzleId is present but not a date, it might be an old route or needs specific handling.
           // For this iteration, we'll assume routePuzzleId is not the primary way to fetch if dateString is absent,
           // and we default to today's puzzle.
           console.warn("Accessing PuzzlePage with puzzleId param - defaulting to today's puzzle if no dateString.");
           fetchedData = await fetchTodaysPuzzleData() as PuzzlePageData;
        } else {
          // No date string or specific puzzleId, default to today's puzzle
          fetchedData = await fetchTodaysPuzzleData() as PuzzlePageData;
        }

        if (fetchedData && fetchedData.puzzle) {
          setPageData(fetchedData);
          // Transform data for CrosswordDisplay
          // The backend's `puzzle.body` should contain the NYT specific structure.
          // Or if backend pre-parses it into `puzzle.structure` (CrosswordBoardData), use that.
          const boardData = transformNytBodyToBoardData(fetchedData.puzzle.body, fetchedData.puzzle.puzzleID);
          setTransformedBoardData(boardData);
        } else {
          setError(dateString ? `No puzzle found for ${dateString}.` : 'No puzzle data available.');
        }
      } catch (err: any) {
        console.error('Failed to fetch puzzle data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load puzzle data.');
      } finally {
        setLoading(false);
      }
    };

    loadPuzzleData();
  }, [dateString, routePuzzleId]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!pageData || !pageData.puzzle || !transformedBoardData) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {dateString ? `Puzzle data or structure not available for ${new Date(dateString + 'T00:00:00Z').toLocaleDateString()}.` : 'Puzzle data or structure not available.'}
        </Typography>
         {/* It might be that pageData.puzzle is available but transformedBoardData is not if parsing failed */}
        {pageData && pageData.puzzle && !transformedBoardData && (
          <Alert severity="warning" sx={{mt:1}}>Could not parse puzzle structure from API data.</Alert>
        )}
      </Container>
    );
  }

  const { puzzle, topSolutions } = pageData;
  const formattedPrintDate = new Date(puzzle.printDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

  const displaySolutions = transformSolversForDisplay(topSolutions);

  return (
    <Container maxWidth="lg"> {/* Using maxWidth="lg" for better layout of grid and clues */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        Crossword for {formattedPrintDate}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Puzzle ID: {puzzle.puzzleID} {puzzle.title && `- "${puzzle.title}"`}
      </Typography>
      {puzzle.author && <Typography variant="body2" gutterBottom>Author: {puzzle.author}</Typography>}
      {puzzle.editor && <Typography variant="body2" gutterBottom>Editor: {puzzle.editor}</Typography>}

      <Box sx={{ my: 3 }}>
        <CrosswordDisplay boardData={transformedBoardData} solutions={displaySolutions} topN={5} />
      </Box>

      <SolverList
        solvers={topSolutions.map(s => ({
          userID: s.userID,
          solveTime: s.calcs?.secondsSpentSolving,
        }))}
        title="Fastest Solvers for This Puzzle"
        emptyMessage="No solvers recorded for this puzzle yet, or data is unavailable."
      />
    </Container>
  );
};

export default PuzzlePage;