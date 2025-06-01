import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import './NavigationBar.css';

const NavigationBar: React.FC = () => {
  return (
    <AppBar position="static" className="nav-bar">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" className="nav-title">
          NYT Crossword Stats
        </Typography>
        <div className="nav-links">
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/leaderboard">
            Leaderboard
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/login"
            variant="outlined"
            className="login-button"
          >
            Login
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
