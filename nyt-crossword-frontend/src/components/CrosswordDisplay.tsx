import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material'; // SvgIcon removed as it's not used
import { Button } from '@mui/material'; // Added Button
import { useEffect, useState } from 'react'; // Added hooks

// --- Data Structures ---
interface CellCoordinate {
  row: number;
  col: number;
}

interface SolveStep {
  cell: CellCoordinate;
  char: string;
  timestamp: number; // Milliseconds since epoch or start of puzzle
}

export interface SolutionForDisplay {
  userId: string;
  solvePath: SolveStep[];
  totalTime: number; // Seconds
  color?: string; // Assigned color for this user's path
}

export interface CrosswordCell {
  char: string | null;
  isBlack: boolean;
  number: number | null;
  // For display purposes, we might add:
  currentDisplayChar?: string | null; // Character currently shown in cell (could be from a solver)
  highlightColor?: string; // For highlighting solver paths
}

export interface CrosswordBoardData {
  size: { rows: number; cols: number };
  grid: CrosswordCell[][]; // 2D array of cells
}

// --- Component Props ---
interface CrosswordDisplayProps {
  boardData: CrosswordBoardData;
  solutions?: SolutionForDisplay[]; // Optional for now, can be added for race lines
  topN?: number; // Number of top solvers for race lines
}

const CELL_SIZE = 30; // px
const GRID_STROKE_COLOR = '#333';
const CELL_BG_COLOR = '#fff';
const BLACK_CELL_BG_COLOR = '#333';

const CELL_NUMBER_COLOR = '#555';

// Assign unique colors to solvers for display
const SOLVER_COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFF6', '#F6FF33'];


const CrosswordDisplay: React.FC<CrosswordDisplayProps> = ({ boardData, solutions = [], topN = 5 }) => {
  const [currentGrid, setCurrentGrid] = useState<CrosswordCell[][]>(boardData.grid);
  const [replayTime, setReplayTime] = useState<number>(0); // Time in seconds for replay
  const [maxReplayTime, setMaxReplayTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [solverColors, setSolverColors] = useState<{[userId: string]: string}>({});

  // Initialize or update grid when boardData changes
  useEffect(() => {
    setCurrentGrid(JSON.parse(JSON.stringify(boardData.grid))); // Deep copy to allow modification
    // Reset replay time etc. if boardData changes (e.g. new puzzle loaded)
    setReplayTime(0);
    setIsPlaying(false);
  }, [boardData]);

  // Prepare solutions and determine max replay time
  const preparedSolutions = React.useMemo(() => {
    const filteredSolutions = solutions
      .filter(s => s.solvePath && s.solvePath.length > 0 && s.totalTime > 0)
      .sort((a, b) => a.totalTime - b.totalTime)
      .slice(0, topN);

    let maxTime = 0;
    const newSolverColors: {[userId: string]: string} = {};
    filteredSolutions.forEach((sol, index) => {
      if (sol.totalTime > maxTime) maxTime = sol.totalTime;
      newSolverColors[sol.userId] = SOLVER_COLORS[index % SOLVER_COLORS.length];
    });
    setMaxReplayTime(maxTime);
    setSolverColors(newSolverColors);
    return filteredSolutions;
  }, [solutions, topN]);

  // Update grid based on replayTime
  useEffect(() => {
    if (!preparedSolutions.length || !boardData.grid) return;

    const newDisplayGrid: CrosswordCell[][] = JSON.parse(JSON.stringify(boardData.grid)); // Start with empty board structure

    preparedSolutions.forEach(solver => {
      const solverColor = solverColors[solver.userId];
      solver.solvePath.forEach(step => {
        // Timestamp in SolveStep is assumed to be in milliseconds, convert replayTime (seconds)
        if (step.timestamp / 1000 <= replayTime) {
          const { row, col } = step.cell;
          if (row < newDisplayGrid.length && col < newDisplayGrid[0].length) {
            // Only update if cell is empty or this solver is "faster" for this cell (optional logic)
            // For now, last one to write at this timestamp wins, or first if sorted by timestamp.
            // A more complex logic could show who was first for each cell.
            newDisplayGrid[row][col].currentDisplayChar = step.char;
            newDisplayGrid[row][col].highlightColor = solverColor; // Highlight cell with solver's color
          }
        }
      });
    });
    setCurrentGrid(newDisplayGrid);
  }, [replayTime, preparedSolutions, boardData.grid, solverColors]);

  // Animation loop for replay
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isPlaying && replayTime < maxReplayTime) {
      timerId = setTimeout(() => {
        setReplayTime(prevTime => Math.min(prevTime + 0.1, maxReplayTime)); // Increment by 0.1s
      }, 100); // Update every 100ms
    } else if (isPlaying && replayTime >= maxReplayTime) {
      setIsPlaying(false); // Stop when max time is reached
    }
    return () => clearTimeout(timerId);
  }, [isPlaying, replayTime, maxReplayTime]);


  if (!boardData) {
    return <Typography>Loading crossword grid...</Typography>;
  }

  const { size } = boardData; // grid is now from currentGrid state
  const totalWidth = size.cols * CELL_SIZE;
  const totalHeight = size.rows * CELL_SIZE;

  const handlePlayPause = () => {
    if (replayTime >= maxReplayTime && isPlaying) { // If at end and playing, effectively means pause and reset
        setReplayTime(0);
        setIsPlaying(false);
    } else if (replayTime >= maxReplayTime && !isPlaying) { // If at end and paused, restart
        setReplayTime(0);
        setIsPlaying(true);
    }
    else {
        setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReplayTime(Number(event.target.value));
  };

  return (
    <Grid container spacing={2}>
      {/* Replay Controls - Basic */}
      {preparedSolutions.length > 0 && (
        <Grid>
          <Paper sx={{p:1, mb:1}}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button onClick={handlePlayPause} variant="contained" size="small">
                {isPlaying ? 'Pause' : (replayTime >= maxReplayTime ? 'Replay' : 'Play')}
              </Button>
              <input
                  type="range"
                  min="0"
                  max={maxReplayTime}
                  value={replayTime}
                  step="0.1"
                  onChange={handleSliderChange}
                  style={{width: '100%'}}
              />
              <Typography variant="caption" sx={{ minWidth: '80px'}}>Time: {replayTime.toFixed(1)}s / {maxReplayTime.toFixed(1)}s</Typography>
            </Box>
          </Paper>
        </Grid>
      )}

      {/* Crossword Grid */}
      <Grid>
        <Paper elevation={3} sx={{ p: 2, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>Crossword</Typography>
          <svg width={totalWidth} height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`}>
            {currentGrid.map((row, rIndex) =>
              row.map((cell, cIndex) => {
                const x = cIndex * CELL_SIZE;
                const y = rIndex * CELL_SIZE;
                return (
                  <g key={`cell-${rIndex}-${cIndex}`}>
                    <rect
                      x={x}
                      y={y}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={cell.isBlack ? BLACK_CELL_BG_COLOR : (cell.highlightColor || CELL_BG_COLOR)}
                      stroke={GRID_STROKE_COLOR}
                      strokeWidth="1"
                    />
                    {cell.number && !cell.isBlack && (
                      <text
                        x={x + 2}
                        y={y + 10} // Adjust for small font size
                        fontSize="10"
                        fill={CELL_NUMBER_COLOR}
                        dominantBaseline="hanging"
                      >
                        {cell.number}
                      </text>
                    )}
                    {cell.currentDisplayChar && !cell.isBlack && (
                      <text
                        x={x + CELL_SIZE / 2}
                        y={y + CELL_SIZE / 2}
                        fontSize="16"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#000" // Character color
                      >
                        {cell.currentDisplayChar}
                      </text>
                    )}
                  </g>
                );
              })
            )}
            {/* Race lines could be drawn here as SVG paths if desired, but cell highlighting is simpler for now */}
          </svg>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Removed the MuiList and MuiListItem import from here as ClueDisplay handles its own MUI imports.

export default CrosswordDisplay;
