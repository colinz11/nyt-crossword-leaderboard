import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Alert } from '@mui/material';
import { fetchTodaysPuzzleData } from '../services/FetchData';
import PuzzleCalendar from '../components/PuzzleCalendar';
import SolverList from '../components/SolverList';
import CrosswordGrid from '../components/CrosswordGrid';
import './HomePage.css';

// Define interfaces for the expected data structure
interface PuzzleInfo {
  id: string;
  puzzleID: string;
  printDate: string;
}

interface HomePageSolver {
  username?: string;
  solutionData: {
    userID: string;
    board?: {
      cells: {
        confirmed: boolean;
        guess: string;
        timestamp: string;
        blank: boolean;
        checked: boolean;
      }[];
    };
    calcs?: {
      secondsSpentSolving?: number;
    };
  }
}

interface TodaysPuzzleData {
  puzzle: PuzzleInfo;
  topSolutions: HomePageSolver[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TodaysPuzzleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    navigate(`/puzzle/${dateString}`);
  };

  useEffect(() => {
    const getTodaysPuzzle = async () => {
      try {
        setLoading(true);
        const result = await fetchTodaysPuzzleData();
        setData(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data for today\'s puzzle. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getTodaysPuzzle();
  }, []);

  // Find the first solved solution with a board
  const solvedPuzzle = data?.topSolutions.find(s => s.solutionData.board?.cells);

  if (loading) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="home-page-loading">
            <CircularProgress />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="home-page-error">
            <Alert severity="error">{error}</Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="container">
        {/* Header Section */}
        <div className="home-page-header">
          <h1 className="home-page-title">NYT Crossword Leaderboard</h1>
          <p className="home-page-subtitle">Track your progress and compete with friends</p>
        </div>

        {/* Today's Puzzle Section */}
        <div className="puzzle-section">
          <h2 className="puzzle-section-title">
            Today's Puzzle - {data?.puzzle ? new Date(data.puzzle.printDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC'
            }) : 'Loading...'}
          </h2>

          {solvedPuzzle?.solutionData.board && (
            <div className="puzzle-grid-section">
              <CrosswordGrid 
                board={solvedPuzzle.solutionData.board}
                title="Today's Crossword"
                date={data?.puzzle.printDate}
              />
            </div>
          )}

          <SolverList
            solvers={data?.topSolutions.map(s => ({
              userID: s.solutionData.userID,
              username: s.username,
              solveTime: s.solutionData.calcs?.secondsSpentSolving,
            })) || []}
            title="Today's Fastest Solvers"
            emptyMessage="Be the first to solve today's puzzle!"
          />
        </div>

        {/* Calendar Section */}
        <div className="calendar-section">
          <h2 className="calendar-section-title">Browse Past Puzzles</h2>
          <PuzzleCalendar onDateChange={handleDateSelect} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;