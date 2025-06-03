import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SolverList.css';

export interface SolverForList {
  userID: string;
  username?: string;
  solveTime?: number;
  displayValue?: string;
  rank?: number;
  trend?: 'up' | 'down' | 'neutral';
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
  const navigate = useNavigate();

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1: return 'rank-first';
      case 2: return 'rank-second';
      case 3: return 'rank-third';
      default: return '';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'neutral': return '→';
      default: return null;
    }
  };

  const handleSolverClick = (userID: string) => {
    navigate(`/user/${userID}`);
  };

  if (!solvers || solvers.length === 0) {
    return <div className="solver-list-empty">{emptyMessage}</div>;
  }

  return (
    <div className="solver-list">
      {title && (
        <h2 className="solver-list-title">{title}</h2>
      )}
      <div className="solver-list-container">
        {solvers.map((solver, index) => (
          <div 
            key={solver.userID || index} 
            className={`solver-list-item ${getRankClass(solver.rank || index + 1)}`}
            onClick={() => handleSolverClick(solver.userID)}
            role="button"
            tabIndex={0}
            title={`View ${solver.username || `User ${solver.userID}`}'s stats`}
          >
            <div className="solver-rank">
              <span className="rank-number">{solver.rank || index + 1}</span>
            </div>
            <div className="solver-info">
              <span className="solver-name">
                {solver.username || `User ${solver.userID}`}
              </span>
              <div className="solver-time">
                {solver.displayValue ? solver.displayValue :
                 solver.solveTime !== undefined ? `${solver.solveTime} seconds` : ''}
              </div>
            </div>
            {solver.trend && (
              <div className={`solver-trend trend-${solver.trend}`}>
                {getTrendIcon(solver.trend)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolverList;
