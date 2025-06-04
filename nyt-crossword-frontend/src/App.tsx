import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import NavigationBar from './components/NavigationBar';
import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import PuzzlePage from './pages/PuzzlePage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <NavigationBar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/puzzle/:date" element={<PuzzlePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Analytics />
      </div>
    </Router>
  );
};

export default App;