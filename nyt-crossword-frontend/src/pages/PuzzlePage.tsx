import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Alert } from '@mui/material';
import { fetchPuzzleDataByDate } from '../services/FetchData';
import SolverList from '../components/SolverList';
import CrosswordGrid from '../components/CrosswordGrid';
import './PuzzlePage.css';

// Interface for Puzzle data (matching backend response)
interface PuzzleApiResponse {
  _id: string;
  puzzleID: string;
  printDate: string;
  editor?: string;
  author?: string;
  title?: string;
}

interface Cell {
  confirmed?: boolean;
  guess?: string;
  timestamp?: string;
  blank?: boolean;
  checked?: boolean;
}

// Interface for Solver data (matching backend response)
interface SolverApiResponse {
  username?: string;
  solutionData: {
    userID: string;
    board?: {
      cells: Cell[];
    };
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
  const params = useParams<{ date: string }>();
  const dateString = params.date;
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PuzzlePageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPuzzleData = async () => {
      setLoading(true);
      setError(null);
      setPageData(null);

      try {
        let fetchedData: PuzzlePageData | null = null;
        let dateToFetch = dateString;
        
        console.log('Received date string:', dateToFetch);

        // If no dateString, use today's date in YYYY-MM-DD format
        if (!dateToFetch) {
          const today = new Date();
          const utcToday = new Date(Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ));
          dateToFetch = utcToday.toISOString().split('T')[0];
          // Update the URL to reflect today's date using the new structure
          navigate(`/puzzle/${dateToFetch}`, { replace: true });
        }

        if (dateToFetch) {
          // Validate date format
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToFetch)) {
            console.error('Invalid date format:', dateToFetch);
            setError("Invalid date format. Please use YYYY-MM-DD.");
            setLoading(false);
            return;
          }

          // Additional validation to ensure the date is valid
          const [year, month, day] = dateToFetch.split('-').map(Number);
          const testDate = new Date(Date.UTC(year, month - 1, day));
          if (
            testDate.getUTCFullYear() !== year ||
            testDate.getUTCMonth() !== month - 1 ||
            testDate.getUTCDate() !== day
          ) {
            console.error('Invalid date values:', dateToFetch);
            setError("Invalid date. Please select a valid date.");
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

  // Find the first solved solution with a board
  const solvedPuzzle = pageData?.topSolutions.find(s => s.solutionData.board?.cells);

  if (loading) {
    return (
      <div className="puzzle-page">
        <div className="container">
          <div className="puzzle-page-loading">
            <CircularProgress />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="puzzle-page">
        <div className="container">
          <div className="puzzle-page-error">
            <Alert severity="error">{error}</Alert>
          </div>
        </div>
      </div>
    );
  }

  if (!pageData || !pageData.puzzle) {
    return (
      <div className="puzzle-page">
        <div className="container">
          <div className="puzzle-page-error">
            <Alert severity="warning">
              {dateString ? `No puzzle data available for ${new Date(dateString + 'T00:00:00Z').toLocaleDateString()}.` : 'No puzzle data available.'}
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  const { puzzle, topSolutions } = pageData;
  const formattedPrintDate = new Date(puzzle.printDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });

  return (
    <div className="puzzle-page">
      <div className="container">
        <div className="puzzle-page-header">
          <h1 className="puzzle-page-title">
            Crossword for {formattedPrintDate}
          </h1>
          {puzzle.title && (
            <p className="puzzle-page-subtitle">"{puzzle.title}"</p>
          )}
          <div className="puzzle-page-meta">
            {puzzle.author && <span>By {puzzle.author}</span>}
            {puzzle.editor && <span>Edited by {puzzle.editor}</span>}
          </div>
        </div>

        {solvedPuzzle?.solutionData.board && (
          <div className="puzzle-grid-section">
            <CrosswordGrid 
              board={solvedPuzzle.solutionData.board}
              title="Completed Puzzle"
              date={puzzle.printDate}
            />
          </div>
        )}

        <div className="solvers-section">
          <SolverList
            solvers={topSolutions.map(s => ({
              userID: s.solutionData.userID,
              username: s.username,
              solveTime: s.solutionData.calcs?.secondsSpentSolving,
            }))}
            title="Fastest Solvers"
            emptyMessage="No solvers recorded for this puzzle yet."
          />
        </div>
      </div>
    </div>
  );
};

export default PuzzlePage;