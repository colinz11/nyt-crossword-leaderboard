import React from 'react';
import './StatBox.css';

interface StatBoxProps {
  value: number | string; // The number or percentage to display
  label: string; // The label for the stat
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

const StatBox: React.FC<StatBoxProps> = ({ value, label, trend, icon }) => {
  const getTrendClass = () => {
    if (!trend) return '';
    return `trend-${trend}`;
  };

  return (
    <div className={`stat-box ${getTrendClass()}`}>
      <div className="stat-box-content">
        {icon && <div className="stat-box-icon">{icon}</div>}
        <div className="stat-box-value">{value}</div>
        <div className="stat-box-label">{label}</div>
      </div>
      {trend && (
        <div className="stat-box-trend">
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'neutral' && '→'}
        </div>
      )}
    </div>
  );
};

export default StatBox;