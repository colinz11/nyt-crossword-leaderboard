import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Container, Table, TableBody, TableCell, TableHead, TableRow, Paper, Box } from '@mui/material';
import { fetchGameSolutions } from '../services/FetchData'; // Import the service
import LeaderboardCategory from '../components/LeaderboardCategory';

// Interface for the transformed solution data for the frontend
interface TransformedSolution {
  userID: string; // Matching backend field name
  solveTime: number; // in seconds
}

// Interface for Puzzle data (can be expanded)
interface PuzzleData {
  puzzleID: string;
  printDate: string;
  grid: any; // Replace 'any' with a more specific type if grid structure is known
  solution: any; // Replace 'any' with a more specific type
  // Add other puzzle fields as needed
}

interface PuzzlePageProps {
  puzzleId: string;
}

const formatTime = (seconds: number) => {
  if (seconds === -1 || seconds === undefined || seconds === null) return 'unsolved';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const PuzzlePage: React.FC = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [topSolutions, setTopSolutions] = useState<TransformedSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!puzzleId) {
      setError('No puzzle ID provided.');
      setLoading(false);
      return;
    }
    const loadPuzzleData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGameSolutions(puzzleId); // Use the imported service
        setPuzzleData(data.puzzle);
        setTopSolutions(
          data.topSolutions.map((sol: any) => ({
            userID: sol.userID, // Ensure this matches the backend response field
            solveTime: sol.calcs?.secondsSpentSolving ?? -1,
          }))
        );
      } catch (err: any) {
        console.error('Failed to fetch puzzle data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load puzzle data.');
        setPuzzleData(null);
        setTopSolutions([]);
      } finally {
        setLoading(false);
      }
    };
    loadPuzzleData();
  }, [puzzleId]);

  if (loading) {
    return <Container><Typography>Loading...</Typography></Container>;
  }

  if (error) {
    return <Container><Typography color="error">Error: {error}</Typography></Container>;
  }

  if (!puzzleData) {
    return <Container><Typography>No puzzle data found.</Typography></Container>;
  }
  
  const formattedPrintDate = puzzleData.printDate 
    ? new Date(puzzleData.printDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  // Prepare leaderboard entries for the LeaderboardCategory component
  const leaderboardEntries = topSolutions.map((sol, idx) => ({
    userID: sol.userID,
    value: formatTime(sol.solveTime),
    valueLabel: 'Solve Time',
  }));

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Puzzle: {puzzleData.puzzleID} - {formattedPrintDate}
      </Typography>

      <Box my={2}>
        <Typography variant="h5" gutterBottom>Puzzle Grid</Typography>
        {/* Placeholder for puzzle grid display */}
        <Paper style={{ padding: '16px', minHeight: '100px', background: '#f0f0f0' }}>
          <Typography sx={{color: "black"}}>{puzzleData.grid ? JSON.stringify(puzzleData.grid) : "Puzzle Grid Display Here"}</Typography>
        </Paper>
      </Box>

      <Box my={2}>
        <Typography variant="h5" gutterBottom>Solution Grid</Typography>
        {/* Placeholder for solution grid display */}
        <Paper style={{ padding: '16px', minHeight: '100px', background: '#f0f0f0' }}>
          <Typography sx={{color: "black"}}>{puzzleData.solution ? JSON.stringify(puzzleData.solution) : "Solution Grid Display Here"}</Typography>
        </Paper>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Top Solutions
      </Typography>
      <LeaderboardCategory
        title="Top Solutions"
        subtitle="(Fastest Solve Times)"
        entries={leaderboardEntries}
      />
    </Container>
  );
};

export default PuzzlePage;