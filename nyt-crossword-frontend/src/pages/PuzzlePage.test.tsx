import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PuzzlePage from './PuzzlePage';
import * as FetchData from '../services/FetchData';

// Mock child components
jest.mock('../components/CrosswordDisplay', () => ({ boardData, solutions, topN }: {boardData: any, solutions: any[], topN: number}) => (
  <div data-testid="crossword-display">
    Crossword Display: {boardData.size.rows}x{boardData.size.cols}
    Solutions: {solutions.length}, TopN: {topN}
  </div>
));
jest.mock('../components/SolverList', () => ({solvers, title}: {solvers: any[], title: string}) => (
    <div data-testid="solver-list">
        <h2>{title}</h2>
        {solvers.length} solvers displayed
    </div>
));

// Mock fetch functions
jest.spyOn(FetchData, 'fetchPuzzleDataByDate');
jest.spyOn(FetchData, 'fetchTodaysPuzzleData');

const mockPuzzleApiResponse = {
  puzzle: {
    _id: '1',
    puzzleID: 'nyt-2023-10-26',
    printDate: '2023-10-26T00:00:00.000Z',
    body: { // Simplified mock body, actual parser in component is more complex
      size: { rows: 15, cols: 15 },
      grid: Array(225).fill({isBlack: false, clueNumbers: []}),
      clues: { across: [{number:1, text:"A clue"}], down: [{number:2, text:"D clue"}] },
    },
  },
  topSolvers: [{ userID: 'user1', calcs: { secondsSpentSolving: 100 } }],
};

describe('PuzzlePage', () => {
  beforeEach(() => {
    (FetchData.fetchPuzzleDataByDate as jest.Mock).mockClear();
    (FetchData.fetchTodaysPuzzleData as jest.Mock).mockClear();
  });

  const renderWithPath = (path: string) => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/puzzle/:dateString" element={<PuzzlePage />} />
          <Route path="/puzzle" element={<PuzzlePage />} /> {/* For today's puzzle */}
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders loading state initially', () => {
    (FetchData.fetchPuzzleDataByDate as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderWithPath('/puzzle/2023-10-26');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('fetches and renders puzzle data by date', async () => {
    (FetchData.fetchPuzzleDataByDate as jest.Mock).mockResolvedValue(mockPuzzleApiResponse);
    renderWithPath('/puzzle/2023-10-26');

    await waitFor(() => {
      expect(FetchData.fetchPuzzleDataByDate).toHaveBeenCalledWith('2023-10-26');
    });
    expect(screen.getByText(/Crossword for 10\/26\/2023/i)).toBeInTheDocument();
    expect(screen.getByTestId('crossword-display')).toHaveTextContent('Crossword Display: 15x15');
    expect(screen.getByTestId('solver-list')).toHaveTextContent('1 solvers displayed');
  });

  test('fetches and renders todays puzzle data if no date param', async () => {
    (FetchData.fetchTodaysPuzzleData as jest.Mock).mockResolvedValue({
        ...mockPuzzleApiResponse,
        puzzle: {...mockPuzzleApiResponse.puzzle, puzzleID: 'nyt-today', printDate: new Date().toISOString()}
    });
    renderWithPath('/puzzle');

    await waitFor(() => {
      expect(FetchData.fetchTodaysPuzzleData).toHaveBeenCalled();
    });
     const today = new Date();
     const expectedDateString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    expect(screen.getByText(new RegExp(`Crossword for ${expectedDateString}`, "i"))).toBeInTheDocument();
    expect(screen.getByTestId('crossword-display')).toBeInTheDocument();
  });

  test('renders error state on fetchPuzzleDataByDate failure', async () => {
    (FetchData.fetchPuzzleDataByDate as jest.Mock).mockRejectedValue(new Error('Failed to fetch by date'));
    renderWithPath('/puzzle/2023-10-26');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Failed to load puzzle data/i);
    });
  });

  test('handles invalid date format', async () => {
    renderWithPath('/puzzle/invalid-date');
    await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent("Invalid date format. Please use YYYY-MM-DD.");
    });
    expect(FetchData.fetchPuzzleDataByDate).not.toHaveBeenCalled();
  });

  test('handles no puzzle found for a valid date', async () => {
    (FetchData.fetchPuzzleDataByDate as jest.Mock).mockResolvedValue({ puzzle: null, topSolvers: [] });
     renderWithPath('/puzzle/2023-01-01');
    await waitFor(() => {
        expect(screen.getByText(/Puzzle data or structure not available for 1\/1\/2023/i)).toBeInTheDocument();
    });
  });
});
