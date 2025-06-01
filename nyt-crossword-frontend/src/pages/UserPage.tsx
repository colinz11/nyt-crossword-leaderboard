import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SummaryStatistics from '../components/SummaryStatistics';
import WeeklyBarChart from '../components/WeeklyBarChart';
import { fetchUserStats, refreshUserSolutions } from '../services/FetchData';
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchStatsAsync();
  }, [userId]);

  const handleRefresh = async () => {
    if (!userId || refreshing) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      await refreshUserSolutions(userId);
      await fetchStatsAsync();
    } catch (err) {
      console.error('Error refreshing user solutions:', err);
      setError('Failed to refresh solutions.');
    } finally {
      setRefreshing(false);
    }
  };

  if (error) {
    return <div className="user-page-error">{error}</div>;
  }

  if (loading) {
    return <div className="user-page-loading">Loading...</div>;
  }

  return (
    <div className="user-page">
      <div className="container">
        {/* Page Title and Refresh Button */}
        <div className="user-page-header">
          <div className="header-content">
            <h1 className="user-page-title">{username}'s Statistics</h1>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRefresh}
              disabled={refreshing}
              startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              className="refresh-button"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Stats'}
            </Button>
          </div>
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