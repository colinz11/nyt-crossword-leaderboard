import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatBoxProps {
  value: number | string; // The number or percentage to display
  label: string; // The label for the stat
}

const StatBox: React.FC<StatBoxProps> = ({ value, label }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        border: '1px solid #ddd',
        borderRadius: '8px',
        width: '150px',
        height: '100px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
      }}
    >
      {/* Value */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
        {value}
      </Typography>
      {/* Label */}
      <Typography variant="body2" color="textSecondary">
        {label}
      </Typography>
    </Box>
  );
};

export default StatBox;