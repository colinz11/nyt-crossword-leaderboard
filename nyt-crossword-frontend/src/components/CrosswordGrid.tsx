import React from 'react';
import './CrosswordGrid.css';

interface Cell {
  confirmed?: boolean;
  guess?: string;
  timestamp?: string;
  blank?: boolean;
  checked?: boolean;
}

interface CrosswordGridProps {
  board: {
    cells: Cell[];
  };
  title?: string;
  date?: string; // UTC date string
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({ board, title, date }) => {
  // Determine grid size based on date
  const isSaturday = date ? new Date(date).getUTCDay() === 6 : false;
  const GRID_SIZE = isSaturday ? 7 : 5;
  const cells = board.cells;

  const getCellContent = (cell: Cell) => {
    if (cell === undefined) return '';
    if (cell.blank) return '';
    return cell.guess;
  };

  const getCellClass = (cell: Cell) => {
    if (cell === undefined) return '';
    let classes = ['crossword-cell'];
    if (cell.blank) classes.push('blank');
    if (cell.confirmed) classes.push('confirmed');
    return classes.join(' ');
  };

  // Create a 2D array of cells for easier rendering
  // Note: cells are ordered left to right, top to bottom
  const gridCells = Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => cells[row * GRID_SIZE + col])
  );

  return (
    <div className={`crossword-grid-container ${isSaturday ? 'saturday' : 'weekday'}`}>
      {title && <h3 className="crossword-grid-title">{title}</h3>}
      <div className="crossword-grid">
        {gridCells.map((row, rowIndex) => (
          <div key={rowIndex} className="crossword-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell)}
              >
                {getCellContent(cell)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrosswordGrid; 