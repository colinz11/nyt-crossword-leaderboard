import React from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export interface SolverForList {
  userID: string;
  username?: string; // Optional, if available
  solveTime?: number; // Seconds
  displayValue?: string; // If time is pre-formatted or it's another metric
}

interface SolverListProps {
  solvers: SolverForList[];
  title?: string;
  emptyMessage?: string;
}

const SolverList: React.FC<SolverListProps> = ({
  solvers,
  title = "Fastest Solvers",
  emptyMessage = "No solvers to display."
}) => {
  if (!solvers || solvers.length === 0) {
    return <Typography sx={{mt: 2, mb: 2}}>{emptyMessage}</Typography>;
  }

  return (
    <>
      {title && (
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
          {title}
        </Typography>
      )}
      <List component={Paper} elevation={2} sx={{ mb: 3 }}>
        {solvers.map((solver, index) => (
          <ListItem key={solver.userID || index} divider={index < solvers.length - 1}>
            <ListItemText
              primary={
                <RouterLink to={`/user/${solver.userID}`}>
                  {solver.username || `User ${solver.userID}`}
                </RouterLink>
              }
              secondary={
                solver.displayValue ? solver.displayValue :
                solver.solveTime !== undefined ? `Time: ${solver.solveTime.toFixed(2)} seconds` : ''
              }
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default SolverList;
