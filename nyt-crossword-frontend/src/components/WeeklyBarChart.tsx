import React from 'react';
import { BarChart } from '@mui/x-charts';
import { formatTime } from '../utils/utils'; 

interface WeeklyBarChartProps {
  data: {
    day: string; // Day of the week
    stats: {
      averageSolveTime: number; // Average solve time in seconds
      bestSolveTime: number; // Best solve time in seconds
      bestDate: string; // Date of the best solve time
      thisWeeksTime: number; // This week's solve time in seconds
      thisWeeksDate: string; // Date of this week's solve time
    };
  }[]; // Array of data points
}


const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <BarChart
        xAxis={[
          {
            data: data.map((item) => item.day), // Days of the week
            scaleType: 'band', // Use band scale for categorical data
            tickSize: 10, // Adjust tick size for better spacing
          },
        ]}
        yAxis={[
          {
            valueFormatter: (value) => formatTime(value), // Format y-axis labels
          },
        ]}
        series={[
          {
            data: data.map((item) => item.stats.bestSolveTime), // Best solve times
            label: 'Best Solve Time',
            color: '#FFD700', // Gold color for "Best"
            valueFormatter: (value, index) =>
              `${formatTime(value)} (${data[index.dataIndex].stats.bestDate})`, // Show time and date
          },
          {
            data: data.map((item) => item.stats.thisWeeksTime), // This week's solve times
            label: "This Week's Solve Time",
            color: '#FF69B4', // Pink color for "This Week"
            valueFormatter: (value, index) =>
              `${formatTime(value)} (${data[index.dataIndex].stats.thisWeeksDate})`, // Show time and date
          },
          {
            data: data.map((item) => item.stats.averageSolveTime), // Average solve times
            label: 'Average Solve Time',
            color: '#1E90FF', // Blue color for "Average"
            valueFormatter: (value) => formatTime(value),
          },
        ]}
        height={400}
      />
    </div>
  );
};

export default WeeklyBarChart;