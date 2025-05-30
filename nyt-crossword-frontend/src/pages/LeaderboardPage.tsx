import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Grid, CircularProgress, Alert
} from '@mui/material';
import {
    fetchLeaderboardByAverageTime,
    fetchLeaderboardByPuzzlesSolved,
    fetchLeaderboardByLongestStreak
} from '../services/FetchData';
import LeaderboardCategory from '../components/LeaderboardCategory';

interface LeaderboardEntry {
    userID: string;
    username?: string;
    value: number | string;
    valueLabel: string;
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
    const [averageTimeLeaderboard, setAverageTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [puzzlesSolvedLeaderboard, setPuzzlesSolvedLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [longestStreakLeaderboard, setLongestStreakLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const limit = 5;

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
                setAverageTimeLeaderboard(
                    (avgTimeData || []).map((entry: any) => ({
                        userID: entry.userID,
                        username: entry.username,
                        value: formatTime(entry.averageSolveTime),
                        valueLabel: 'Avg. Time'
                    }))
                );
                setPuzzlesSolvedLeaderboard(
                    (puzzlesSolvedData || []).map((entry: any) => ({
                        userID: entry.userID,
                        username: entry.username,
                        value: entry.puzzlesSolvedCount,
                        valueLabel: 'Puzzles Solved'
                    }))
                );
                setLongestStreakLeaderboard(
                    (longestStreakData || []).map((entry: any) => ({
                        userID: entry.userID,
                        username: entry.username,
                        value: entry.longestStreak,
                        valueLabel: 'Streak'
                    }))
                );
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
                <LeaderboardCategory
                    title="Fastest Solvers"
                    subtitle="(Average Solve Time)"
                    entries={averageTimeLeaderboard}
                />
                <LeaderboardCategory
                    title="Most Puzzles Solved"
                    subtitle="(Total Count)"
                    entries={puzzlesSolvedLeaderboard}
                />
                <LeaderboardCategory
                    title="Longest Streaks"
                    subtitle="(Consecutive Days Solved)"
                    entries={longestStreakLeaderboard}
                    valueSuffix="days"
                />
            </Grid>
        </Container>
    );
};

export default LeaderboardPage;