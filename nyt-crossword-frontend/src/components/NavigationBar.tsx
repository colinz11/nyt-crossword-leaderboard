import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import './NavigationBar.css';

const NavigationBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <AppBar position="sticky" className="nav-bar">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          className="nav-title"
        >
          NYT Crossword Stats
        </Typography>
        <div className="nav-links">
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            className={isActive('/') ? 'active' : ''}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/leaderboard"
            className={isActive('/leaderboard') ? 'active' : ''}
          >
            Leaderboard
          </Button>
          <Button 
            component={RouterLink} 
            to="/login"
            variant="outlined"
            className={`login-button ${isActive('/login') ? 'active' : ''}`}
          >
            Login
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
