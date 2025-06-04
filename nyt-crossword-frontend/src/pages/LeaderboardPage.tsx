import React, { useEffect, useState } from 'react';
import {
    CircularProgress, Alert
} from '@mui/material';
import {
    fetchLeaderboardByAverageTime,
    fetchLeaderboardByPuzzlesSolved,
    fetchLeaderboardByLongestStreak
} from '../services/FetchData';
import LeaderboardCategory from '../components/LeaderboardCategory';
import { formatTime } from '../utils/utils';
import './LeaderboardPage.css';

interface LeaderboardEntry {
    userID: string;
    username?: string;
    value: number | string;
    valueLabel: string;
}

const LeaderboardPage: React.FC = () => {
    const [averageTimeLeaderboard, setAverageTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [puzzlesSolvedLeaderboard, setPuzzlesSolvedLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [longestStreakLeaderboard, setLongestStreakLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const limit = 10; // Show more entries

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
                        valueLabel: 'Average Time'
                    }))
                );
                setPuzzlesSolvedLeaderboard(
                    (puzzlesSolvedData || []).map((entry: any) => ({
                        userID: entry.userID,
                        username: entry.username,
                        value: entry.puzzlesSolvedCount,
                        valueLabel: 'Total Puzzles'
                    }))
                );
                setLongestStreakLeaderboard(
                    (longestStreakData || []).map((entry: any) => ({
                        userID: entry.userID,
                        username: entry.username,
                        value: entry.longestStreak,
                        valueLabel: 'Days'
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
            <div className="leaderboard-loading">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className="leaderboard-error">
                <Alert severity="error">{error}</Alert>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <div className="container">
                <div className="leaderboard-page-header">
                    <h1 className="leaderboard-page-title">Leaderboards</h1>
                    <p className="leaderboard-page-subtitle">
                        Compete with fellow crossword enthusiasts and track your progress
                    </p>
                </div>

                <div className="leaderboard-grid">
                    <LeaderboardCategory
                        title="Speed Demons"
                        subtitle="Fastest average solve times"
                        entries={averageTimeLeaderboard}
                    />
                    <LeaderboardCategory
                        title="Puzzle Masters"
                        subtitle="Most puzzles completed"
                        entries={puzzlesSolvedLeaderboard}
                    />
                    <LeaderboardCategory
                        title="Consistency Kings"
                        subtitle="Longest solving streaks"
                        entries={longestStreakLeaderboard}
                    />
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;