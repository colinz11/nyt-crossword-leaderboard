import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material'; // Removed List, ListItem, ListItemText
import { useNavigate } from 'react-router-dom'; // Removed Link as SolverList handles it
import { fetchTodaysPuzzleData } from '../services/FetchData';
import PuzzleCalendar from '../components/PuzzleCalendar';
import SolverList from '../components/SolverList'; // Import SolverList

// Define interfaces for the expected data structure (Solver might be slightly different from SolverForList)
interface PuzzleInfo { // Renamed from Puzzle to avoid conflict if more specific Puzzle types are needed elsewhere
  id: string;
  puzzleID: string;
  printDate: string;
  // Add other puzzle fields as necessary
}

interface HomePageSolver { // Renamed from Solver to be specific to HomePage's raw data
  userID: string;
  calcs?: {
    secondsSpentSolving?: number;
  };
  // Add other solver fields as necessary, e.g., username if available directly
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
    const dateString = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
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

  if (!data || !data.puzzle) {
    return (
      <Container>
        {/* Still show calendar even if today's puzzle data fails, or show a specific message */}
        <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>Select a date to view a puzzle:</Typography>
        <PuzzleCalendar onDateChange={handleDateSelect} />
        <Alert severity="info" sx={{mt:2}}>No puzzle data available for today.</Alert>
      </Container>
    );
  }


  return (
    <Container>
      <Grid container spacing={3} sx={{ mt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Today's Puzzle - {new Date(data.puzzle.printDate).toLocaleDateString()}
          </Typography>

          <Paper elevation={3} sx={{ padding: 2, marginBottom: 3 }}>
            <Typography variant="h6">Puzzle Information</Typography>
            <Typography>Puzzle ID: {data.puzzle.puzzleID}</Typography>
            {/* Add more puzzle details here as they become available */}
          </Paper>

          <SolverList
            solvers={data.topSolutions.map(s => ({
              userID: s.userID,
              solveTime: s.calcs?.secondsSpentSolving,
            }))}
            title="Fastest Solvers for Today"
            emptyMessage="No solvers yet for today's puzzle."
          />
  
          <Typography variant="h6" component="h2" gutterBottom>
            Select a Puzzle Date
          </Typography>
          <Paper elevation={3} sx={{ padding: 1 }}>
            <PuzzleCalendar onDateChange={handleDateSelect} />
          </Paper>
      </Grid>
    </Container>
  );
};

export default HomePage;