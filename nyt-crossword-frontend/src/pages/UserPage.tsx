import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import moment from 'moment';
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

type TimePeriod = 'all' | '1y' | '6m' | '3m' | '1m' | '7d';

const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [stats, setStats] = useState<{ value: number | string; label: string }[]>([]);
  const [weeklyData, setWeeklyData] = useState<UserStats['statsByDay']>([]);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState<{ completed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  const getDateRange = (period: TimePeriod): { startDate: string | null, endDate: string } => {
    const endDate = moment().format('YYYY-MM-DD');
    
    switch (period) {
      case '1y':
        return { startDate: moment().subtract(1, 'year').format('YYYY-MM-DD'), endDate };
      case '6m':
        return { startDate: moment().subtract(6, 'months').format('YYYY-MM-DD'), endDate };
      case '3m':
        return { startDate: moment().subtract(3, 'months').format('YYYY-MM-DD'), endDate };
      case '1m':
        return { startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'), endDate };
      case '7d':
        return { startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'), endDate };
      default:
        return { startDate: null, endDate };
    }
  };

  const fetchStatsAsync = async () => {
    try {
      if (!userId) {
        setError('User ID is missing.');
        return;
      }

      const { startDate, endDate } = getDateRange(timePeriod);
      const data: UserStats = await fetchUserStats(userId, startDate, endDate);
      setUsername(data.username);
      setStats([
        { value: data.totalPuzzlesSolved, label: 'Puzzles Solved' },
        { value: `${(data.autoCompletePct * 100).toFixed(2)}%`, label: 'Auto Complete Rate' },
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
  }, [userId, timePeriod]);

  const handleRefresh = async () => {
    if (!userId || refreshing) return;
    
    setRefreshing(true);
    setError(null);
    setRefreshProgress(null);

    const { startDate, endDate } = getDateRange(timePeriod);
    
    try {
      await refreshUserSolutions(
        userId, 
        startDate, 
        endDate,
        30, // Process 30 days at a time
        (progress) => {
          setRefreshProgress(progress);
        }
      );
      await fetchStatsAsync();
    } catch (err) {
      console.error('Error refreshing user solutions:', err);
      setError('Failed to refresh solutions.');
    } finally {
      setRefreshing(false);
      setRefreshProgress(null);
    }
  };

  const handleTimePeriodChange = (event: SelectChangeEvent<TimePeriod>) => {
    setTimePeriod(event.target.value as TimePeriod);
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
        {/* Page Title and Controls */}
        <div className="user-page-header">
          <div className="header-content">
            <h1 className="user-page-title">{username}'s Statistics</h1>
            <div className="header-controls">
              <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                <InputLabel id="time-period-label">Time Period</InputLabel>
                <Select
                  labelId="time-period-label"
                  value={timePeriod}
                  label="Time Period"
                  onChange={handleTimePeriodChange}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="1y">Last Year</MenuItem>
                  <MenuItem value="6m">Last 6 Months</MenuItem>
                  <MenuItem value="3m">Last 3 Months</MenuItem>
                  <MenuItem value="1m">Last Month</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRefresh}
                disabled={refreshing}
                startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                className="refresh-button"
              >
                {refreshing ? (
                  refreshProgress 
                    ? `Refreshing... ${Math.round((refreshProgress.completed / refreshProgress.total) * 100)}%`
                    : 'Refreshing...'
                ) : 'Refresh Stats'}
              </Button>
            </div>
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