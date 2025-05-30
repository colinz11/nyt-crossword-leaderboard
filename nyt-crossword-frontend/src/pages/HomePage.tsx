import React from 'react';
import { Container, Typography } from '@mui/material';

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

export default HomePage;