import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Link as RouterLink removed, SolverList handles it
import { Typography, Container, CircularProgress, Alert } from '@mui/material'; // List, ListItem, ListItemText removed
import { fetchPuzzleDataByDate } from '../services/FetchData'; // Import services
import SolverList from '../components/SolverList'; // Import SolverList
import { CrosswordCell } from '../model/Board';


// Interface for Puzzle data (matching backend response)
interface PuzzleApiResponse { // Renamed to avoid conflict with internal Puzzle type if any
  _id: string; // MongoDB document ID
  puzzleID: string; // The specific ID for the puzzle (e.g., from NYT)
  printDate: string;
  editor?: string;
  author?: string;
  title?: string;
}

interface NytPuzzleBody {
  size: { rows: number; cols: number };
  grid: CrosswordCell[]; // Flat array, length = rows * cols
}

// Interface for Solver data (matching backend response)
interface SolverApiResponse {
  username?: string;
  solutionData: {
    userID: string;
    board?: {
      cells: CrosswordCell[]; // Optional, if the backend provides the board state
    }
    calcs?: {
      secondsSpentSolving?: number;
    };
  }
}

// Combined interface for the page's data state
interface PuzzlePageData {
  puzzle: PuzzleApiResponse;
  topSolutions: SolverApiResponse[];
}


// Props for PuzzlePage (currently none as params are from URL)
// interface PuzzlePageProps {}

const PuzzlePage: React.FC = () => {
  const { dateString } = useParams<{ dateString?: string }>();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PuzzlePageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPuzzleData = async () => {
      setLoading(true);
      setError(null);
      setPageData(null); // Reset page data on new load

      try {
        let fetchedData: PuzzlePageData | null = null;
        let dateToFetch = dateString;

        // If no dateString, use today's date in YYYY-MM-DD format
        if (!dateToFetch) {
          const today = new Date();
          dateToFetch = today.toISOString().split('T')[0];
          // Optionally, update the URL to reflect today's date
          navigate(`/puzzle/${dateToFetch}`, { replace: true });
        }

        if (dateToFetch) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToFetch)) {
            setError("Invalid date format. Please use YYYY-MM-DD.");
            setLoading(false);
            return;
          }
          fetchedData = await fetchPuzzleDataByDate(dateToFetch) as PuzzlePageData;
        } 

        if (fetchedData && fetchedData.puzzle) {
          setPageData(fetchedData);
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
  }, [dateString, navigate]);

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

  if (!pageData || !pageData.puzzle) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {dateString ? `Puzzle data or structure not available for ${new Date(dateString + 'T00:00:00Z').toLocaleDateString()}.` : 'Puzzle data or structure not available.'}
        </Typography>
        {/* It might be that pageData.puzzle is available but transformedBoardData is not if parsing failed */}
        {pageData && pageData.puzzle && (
          <Alert severity="warning" sx={{ mt: 1 }}>Could not parse puzzle structure from API data.</Alert>
        )}
      </Container>
    );
  }

  const { puzzle, topSolutions } = pageData;
  const formattedPrintDate = new Date(puzzle.printDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

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

      <SolverList
        solvers={topSolutions.map(s => ({
          userID: s.solutionData.userID,
          username: s.username,
          solveTime: s.solutionData.calcs?.secondsSpentSolving,
        }))}
        title="Fastest Solvers for This Puzzle"
        emptyMessage="No solvers recorded for this puzzle yet, or data is unavailable."
      />
    </Container>
  );
};

export default PuzzlePage;