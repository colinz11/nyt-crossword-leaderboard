import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatTime } from '../utils/utils';
import './WeeklyBarChart.css';

interface WeeklyBarChartProps {
  data: {
    day: string;
    stats: {
      averageSolveTime: number;
      bestSolveTime: number;
      bestDate: string;
      thisWeeksTime: number;
      thisWeeksDate: string;
    };
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <h4>{label}</h4>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="tooltip-item">
            <span className="tooltip-label" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="tooltip-value">
              {formatTime(entry.value)}
              {entry.name !== 'Average Solve Time' && (
                <span className="tooltip-date">
                  ({entry.payload.stats[entry.name === 'Best Solve Time' ? 'bestDate' : 'thisWeeksDate']})
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data }) => {
  return (
    <div className="weekly-chart">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--text-secondary)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            tickFormatter={formatTime}
            tick={{ fill: 'var(--text-secondary)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
          <Bar
            dataKey="stats.bestSolveTime"
            name="Best Solve Time"
            fill="#ffd700"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="stats.thisWeeksTime"
            name="This Week's Time"
            fill="#e63939"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="stats.averageSolveTime"
            name="Average Solve Time"
            fill="#1E90FF"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyBarChart;