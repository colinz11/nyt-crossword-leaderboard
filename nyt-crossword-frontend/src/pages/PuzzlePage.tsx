import React, { useEffect, useState } from 'react';
import { Typography, Container, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

interface Solution {
  userId: string;
  solveTime: number; // in seconds
}

interface PuzzlePageProps {
  puzzleId: string;
}

const formatTime = (seconds: number) => {
  if (seconds === -1) return 'unsolved';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PuzzlePage: React.FC<PuzzlePageProps> = ({ puzzleId }) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const res = await fetch(`/api/puzzles/${puzzleId}/solutions`);
        const data = await res.json();
        // Assume API returns an array of { userId, calcs: { secondsSpentSolving } }
        setSolutions(
          data.map((sol: any) => ({
            userId: sol.userId,
            solveTime: sol.calcs?.secondsSpentSolving ?? -1,
          }))
        );
      } catch (err) {
        setSolutions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSolutions();
  }, [puzzleId]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Puzzle {puzzleId} Solutions
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Solve Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {solutions.map((sol) => (
                <TableRow key={sol.userId}>
                  <TableCell>{sol.userId}</TableCell>
                  <TableCell>{formatTime(sol.solveTime)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default PuzzlePage;