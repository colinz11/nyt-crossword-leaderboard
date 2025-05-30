import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid, Box, CircularProgress, Alert
} from '@mui/material';
import {
    fetchLeaderboardByAverageTime,
    fetchLeaderboardByPuzzlesSolved,
    fetchLeaderboardByLongestStreak
} from '../services/FetchData';

// Interfaces for leaderboard data
interface AverageTimeEntry {
    userID: string;
    username?: string;
    averageSolveTime: number;
    puzzlesSolvedCount: number;
}

interface PuzzlesSolvedEntry {
    userID: string;
    username?: string;
    puzzlesSolvedCount: number;
}

interface LongestStreakEntry {
    userID: string;
    username?: string;
    longestStreak: number;
}

// Utility to format time (similar to PuzzlePage)
const formatTime = (seconds: number): string => {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) return 'N/A';
    if (seconds === 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60); // Round seconds to nearest whole number
    let timeString = '';
    if (mins > 0) {
        timeString += `${mins}m `;
    }
    timeString += `${secs}s`;
    return timeString.trim();
};

const LeaderboardPage: React.FC = () => {
    const [averageTimeLeaderboard, setAverageTimeLeaderboard] = useState<AverageTimeEntry[]>([]);
    const [puzzlesSolvedLeaderboard, setPuzzlesSolvedLeaderboard] = useState<PuzzlesSolvedEntry[]>([]);
    const [longestStreakLeaderboard, setLongestStreakLeaderboard] = useState<LongestStreakEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const limit = 5; // Default limit for leaderboards

    useEffect(() => {
        const fetchLeaderboards = async () => {
            setLoading(true);
            setError(null);
            try {
                const [avgTimeData, puzzlesSolvedData, longestStreakData] = await Promise.all([
                    fetchLeaderboardByAverageTime(limit),
                    fetchLeaderboardByPuzzlesSolved(limit),
                    fetchLeaderboardByLongestStreak(limit)
                ]);
                setAverageTimeLeaderboard(avgTimeData || []);
                setPuzzlesSolvedLeaderboard(puzzlesSolvedData || []);
                setLongestStreakLeaderboard(longestStreakData || []);
            } catch (err: any) {
                console.error("Failed to fetch leaderboards:", err);
                setError(err.message || "An unknown error occurred while fetching leaderboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboards();
    }, []);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
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

    return (
        <Container maxWidth="lg">
            <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mt: 3, mb: 3 }}>
                🏆 General Leaderboards 🏆
            </Typography>
            <Grid container spacing={4}>
                {/* Top Solvers by Average Time */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h5" component="h2" gutterBottom align="center">
                            Fastest Solvers
                        </Typography>
                        <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 2 }}>
                            (Average Solve Time)
                        </Typography>
                        {averageTimeLeaderboard.length > 0 ? (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell align="right">Avg. Time</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {averageTimeLeaderboard.map((entry, index) => (
                                        <TableRow key={entry.userID}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{entry.username || entry.userID}</TableCell>
                                            <TableCell align="right">{formatTime(entry.averageSolveTime)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <Typography align="center">No data available.</Typography>}
                    </Paper>
                </Grid>

                {/* Top Solvers by Puzzles Solved */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h5" component="h2" gutterBottom align="center">
                            Most Puzzles Solved
                        </Typography>
                        <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 2 }}>
                            (Total Count)
                        </Typography>
                        {puzzlesSolvedLeaderboard.length > 0 ? (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell align="right">Puzzles Solved</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {puzzlesSolvedLeaderboard.map((entry, index) => (
                                        <TableRow key={entry.userID}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{entry.username || entry.userID}</TableCell>
                                            <TableCell align="right">{entry.puzzlesSolvedCount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <Typography align="center">No data available.</Typography>}
                    </Paper>
                </Grid>

                {/* Top Solvers by Longest Streak */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h5" component="h2" gutterBottom align="center">
                            Longest Streaks
                        </Typography>
                        <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 2 }}>
                            (Consecutive Days Solved)
                        </Typography>
                        {longestStreakLeaderboard.length > 0 ? (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell align="right">Streak</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {longestStreakLeaderboard.map((entry, index) => (
                                        <TableRow key={entry.userID}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{entry.username || entry.userID}</TableCell>
                                            <TableCell align="right">{entry.longestStreak} days</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <Typography align="center">No data available.</Typography>}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default LeaderboardPage;
