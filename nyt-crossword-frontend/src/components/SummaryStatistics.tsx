import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import StatBox from './StatBox';
import { formatTime } from '../utils/utils';

interface Stat {
  value: number | string;
  label: string;
}

interface SummaryStatisticsProps {
  stats: Stat[]; // List of stats to display
  title?: string; // Optional title for the statistics section
}

const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({ stats, title }) => {
  return (
    <Box sx={{ marginTop: 4 }}>
      {/* Title */}
      {title && (
        <Typography
          variant="h5"
          sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 2 }}
        >
          {title}
        </Typography>
      )}

      {/* Stat Boxes */}
      <Stack
        direction="row"
        spacing={4}
        justifyContent="center"
        alignItems="center"
      >
        {stats.map((stat, index) => (
          <StatBox
          key={index}
          value={
            typeof stat.value === 'number' && stat.label.toLowerCase().includes('time')
              ? formatTime(stat.value) // Format time if the value is a number and the label includes "time"
              : stat.value
          }
          label={stat.label}
        />
        ))}
      </Stack>
    </Box>
  );
};

export default SummaryStatistics;