import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Container } from '@mui/material';
import SummaryStatistics from '../components/SummaryStatistics';
import WeeklyBarChart from '../components/WeeklyBarChart';
import { fetchUserStats } from '../services/FetchData';

const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [stats, setStats] = useState<{ value: number | string; label: string }[]>([]);
  const [weeklyData, setWeeklyData] = useState<
    {
      day: string;
      stats: {
        averageSolveTime: number;
        bestSolveTime: number;
        bestDate: string;
        thisWeeksTime: number;
        thisWeeksDate: string;
      };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatsAsync = async () => {
      try {
        if (!userId) {
          setError('User ID is missing.');
          return;
        }

        const data = await fetchUserStats(userId); // Fetch user stats from the API
        setStats([
          { value: data.totalPuzzlesSolved, label: 'Puzzles Solved' },
          { value: `${data.autoCompletePct}%`, label: 'Auto Complete Rate' },
          { value: data.currentStreak, label: 'Current Streak' },
          { value: data.longestStreak, label: 'Longest Streak' },
          { value: data.averageSolveTime, label: 'Average Solve Time' },
        ]);
        setWeeklyData(data.statsByDay); // Set weekly data for the bar chart
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to fetch user stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAsync();
  }, [userId]); // Re-run the effect if the userId changes

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        User {userId}'s Statistics
      </Typography>

      {/* Summary Statistics */}
      <SummaryStatistics stats={stats} title={`User ${userId}'s Summary`} />

      {/* Weekly Bar Chart */}
      <Typography variant="h5" sx={{ textAlign: 'center', marginTop: 4, marginBottom: 2 }}>
        Weekly Solve Time Comparison
      </Typography>
      <WeeklyBarChart data={weeklyData} />
    </Container>
  );
};

export default UserPage;