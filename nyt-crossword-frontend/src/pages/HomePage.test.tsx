import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from './HomePage';
import * as FetchData from '../services/FetchData'; // To mock its functions

// Mock child components to simplify HomePage test
jest.mock('../components/PuzzleCalendar', () => () => <div data-testid="puzzle-calendar">Puzzle Calendar</div>);
jest.mock('../components/SolverList', () => ({solvers, title}: {solvers: any[], title: string}) => (
    <div data-testid="solver-list">
        <h2>{title}</h2>
        {solvers.length} solvers displayed
    </div>
));

// Mock the fetchTodaysPuzzleData function
jest.spyOn(FetchData, 'fetchTodaysPuzzleData');

const mockTodaysPuzzleData = {
  puzzle: {
    id: 'puzzle123',
    puzzleID: 'nyt-2023-10-27',
    printDate: '2023-10-27T00:00:00.000Z',
  },
  topSolvers: [
    { userID: 'user1', calcs: { secondsSpentSolving: 120 } },
    { userID: 'user2', calcs: { secondsSpentSolving: 150 } },
  ],
};

describe('HomePage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (FetchData.fetchTodaysPuzzleData as jest.Mock).mockClear();
  });

  test('renders loading state initially', () => {
    (FetchData.fetchTodaysPuzzleData as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<Router><HomePage /></Router>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders puzzle data after successful fetch', async () => {
    (FetchData.fetchTodaysPuzzleData as jest.Mock).mockResolvedValue(mockTodaysPuzzleData);
    render(<Router><HomePage /></Router>);

    await waitFor(() => {
      expect(screen.getByText(/Today's Puzzle - 10\/27\/2023/i)).toBeInTheDocument(); // Date format check
    });
    expect(screen.getByText(/Puzzle ID: nyt-2023-10-27/i)).toBeInTheDocument();
    expect(screen.getByTestId('solver-list')).toHaveTextContent('Fastest Solvers for Today');
    expect(screen.getByTestId('solver-list')).toHaveTextContent('2 solvers displayed');
    expect(screen.getByTestId('puzzle-calendar')).toBeInTheDocument();
  });

  test('renders error state on fetch failure', async () => {
    (FetchData.fetchTodaysPuzzleData as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    render(<Router><HomePage /></Router>);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Failed to fetch data for today's puzzle/i);
    });
  });

  test('renders calendar and specific message if no puzzle data but call succeeds', async () => {
    (FetchData.fetchTodaysPuzzleData as jest.Mock).mockResolvedValue({ puzzle: null, topSolvers: [] });
    render(<Router><HomePage /></Router>);

    await waitFor(() => {
      expect(screen.getByText(/Select a date to view a puzzle:/i)).toBeInTheDocument();
    });
    expect(screen.getByTestId('puzzle-calendar')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/No puzzle data available for today/i)
  });
});
