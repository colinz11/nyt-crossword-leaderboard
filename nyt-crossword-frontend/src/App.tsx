import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import UserPage from './pages/UserPage';
import PuzzlePage from './pages/PuzzlePage'; // Assuming PuzzlePage exists
import LeaderboardPage from './pages/LeaderboardPage';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';

// Placeholder for HomePage
const HomePage: React.FC = () => (
  <Container>
    <Typography variant="h3" component="h1" gutterBottom sx={{mt: 2}}>
      Welcome to NYT Crossword Stats
    </Typography>
    <Typography variant="body1">
      Use the navigation above to explore user statistics, puzzle details, or the general leaderboards.
    </Typography>
  </Container>
);

const App: React.FC = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NYT Crossword Stats
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          {/* Example User ID, ideally this would be dynamic */}
          <Button color="inherit" component={Link} to="/user/00000001">User Page</Button>
          {/* Example Puzzle ID, ideally dynamic */}
          <Button color="inherit" component={Link} to="/puzzle/2023-03-15">Puzzle Page</Button>
          <Button color="inherit" component={Link} to="/leaderboard">Leaderboard</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/puzzle/:puzzleId" element={<PuzzlePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;