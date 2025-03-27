import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

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

  
    </div>
  );
}

export default App;