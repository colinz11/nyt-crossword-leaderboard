import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Container } from '@mui/material';
import SummaryStatistics from '../components/SummaryStatistics';
import WeeklyBarChart from '../components/WeeklyBarChart';
import { fetchUserStats } from '../services/FetchData';
import './UserPage.css';

interface UserStats {
  userID: string;
  username: string;
  averageSolveTime: number;
  totalPuzzlesSolved: number;
  currentStreak: number;
  longestStreak: number;
  autoCompletePct: number;
  statsByDay: {
    day: string;
    stats: {
      averageSolveTime: number;
      bestSolveTime: number;
      bestDate: string;
      thisWeeksTime: number;
      thisWeeksDate: string;
    };
  }[];
}

const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [stats, setStats] = useState<{ value: number | string; label: string }[]>([]);
  const [weeklyData, setWeeklyData] = useState<UserStats['statsByDay']>([]);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatsAsync = async () => {
      try {
        if (!userId) {
          setError('User ID is missing.');
          return;
        }

        const data: UserStats = await fetchUserStats(userId);
        setUsername(data.username);
        setStats([
          { value: data.totalPuzzlesSolved, label: 'Puzzles Solved' },
          { value: `${data.autoCompletePct}%`, label: 'Auto Complete Rate' },
          { value: data.currentStreak, label: 'Current Streak' },
          { value: data.longestStreak, label: 'Longest Streak' },
          { value: data.averageSolveTime, label: 'Average Solve Time' },
        ]);
        setWeeklyData(data.statsByDay);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to fetch user stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAsync();
  }, [userId]);

  if (error) {
    return <div className="user-page-error">{error}</div>;
  }

  if (loading) {
    return <div className="user-page-loading">Loading...</div>;
  }

  return (
    <div className="user-page">
      <div className="container">
        {/* Page Title */}
        <div className="user-page-header">
          <h1 className="user-page-title">{username}'s Statistics</h1>
        </div>

        {/* Summary Statistics */}
        <SummaryStatistics stats={stats} title={`${username}'s Summary`} />

        {/* Weekly Bar Chart */}
        <div className="weekly-chart-section">
          <h2 className="weekly-chart-title">Weekly Solve Time Comparison</h2>
          {weeklyData && weeklyData.length > 0 && <WeeklyBarChart data={weeklyData} />}
        </div>
      </div>
    </div>
  );
};

export default UserPage;