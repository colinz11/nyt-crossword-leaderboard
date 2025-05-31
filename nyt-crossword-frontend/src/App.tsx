import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import UserPage from './pages/UserPage';
import PuzzlePage from './pages/PuzzlePage'; // Assuming PuzzlePage exists
import LeaderboardPage from './pages/LeaderboardPage';
import { Container } from '@mui/material';
import HomePage from './pages/HomePage'; 

const App: React.FC = () => {
  return (
    <Router>
      <NavigationBar />
      <Container sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/puzzle" element={<PuzzlePage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/puzzle/:puzzleId" element={<PuzzlePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;