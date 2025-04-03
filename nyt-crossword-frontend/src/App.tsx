import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Container } from '@mui/material';
import SummaryStatistics from './components/SummaryStatistics';
import WeeklyBarChart from './components/WeeklyBarChart';


const Example: React.FC = () => {
  const stats = [
    { value: 320, label: 'Puzzles Solved' },
    { value: '33.9%', label: 'Solve Rate' },
    { value: 0, label: 'Current Streak' },
    { value: 2, label: 'Longest Streak' },
  ];

  return (
    <Container maxWidth="lg">
      <SummaryStatistics stats={stats} title="Your Statistics" />
    </Container>
  );
};

const Example2: React.FC = () => {
  const weeklyData = [
    {
      day: 'Monday',
      averageSolveTime: 1652,
      bestSolveTime: 869,
      bestDate: '2023-10-16',
      thisWeeksTime: 1500,
      thisWeeksDate: '2025-03-25',
    },
    {
      day: 'Tuesday',
      averageSolveTime: 1500,
      bestSolveTime: 800,
      bestDate: '2023-10-17',
      thisWeeksTime: 1400,
      thisWeeksDate: '2025-03-26',
    },
    {
      day: 'Wednesday',
      averageSolveTime: 1400,
      bestSolveTime: 700,
      bestDate: '2023-10-18',
      thisWeeksTime: 1300,
      thisWeeksDate: '2025-03-27',
    },
    {
      day: 'Thursday',
      averageSolveTime: 1300,
      bestSolveTime: 750,
      bestDate: '2023-10-19',
      thisWeeksTime: 1200,
      thisWeeksDate: '2025-03-28',
    },
    {
      day: 'Friday',
      averageSolveTime: 1200,
      bestSolveTime: 600,
      bestDate: '2023-10-20',
      thisWeeksTime: 1100,
      thisWeeksDate: '2025-03-29',
    },
    {
      day: 'Saturday',
      averageSolveTime: 1100,
      bestSolveTime: 500,
      bestDate: '2023-10-21',
      thisWeeksTime: 1000,
      thisWeeksDate: '2025-03-30',
    },
    {
      day: 'Sunday',
      averageSolveTime: 1000,
      bestSolveTime: 400,
      bestDate: '2023-10-22',
      thisWeeksTime: 900,
      thisWeeksDate: '2025-03-31',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
        Weekly Solve Time Comparison
      </Typography>
      <WeeklyBarChart data={weeklyData} />
    </Container>
  );
};



function App() {
  return (
    <div>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NYT Crossword Leaderboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Example />
      <Example2 />
    </div>
  );
}

export default App;