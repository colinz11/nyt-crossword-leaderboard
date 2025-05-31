import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CrosswordDisplay, { CrosswordBoardData, SolutionForDisplay } from './CrosswordDisplay';

// Mock ClueDisplay as its tests are separate
jest.mock('./ClueDisplay', () => ({
  __esModule: true,
  default: ({clues}: {clues: any}) => (
    <div data-testid="clue-display">
      Across Clues: {Object.keys(clues.across).length}
      Down Clues: {Object.keys(clues.down).length}
    </div>
  ),
}));

const mockBoardData: CrosswordBoardData = {
  size: { rows: 2, cols: 2 },
  grid: [
    [{ char: null, isBlack: false, number: 1 }, { char: null, isBlack: false, number: 2 }],
    [{ char: null, isBlack: true, number: null }, { char: null, isBlack: false, number: 3 }],
  ],
  clues: {
    across: { 1: 'Across 1', 2: 'Across 2' },
    down: { 1: 'Down 1', 3: 'Down 3' },
  },
};

const mockSolutions: SolutionForDisplay[] = [
  {
    userId: 'user1',
    solvePath: [
      { cell: { row: 0, col: 0 }, char: 'A', timestamp: 100 },
      { cell: { row: 0, col: 1 }, char: 'B', timestamp: 200 },
    ],
    totalTime: 2, // 2 seconds
  },
  {
    userId: 'user2',
    solvePath: [
      { cell: { row: 0, col: 0 }, char: 'X', timestamp: 50 }, // User2 is faster on first cell
      { cell: { row: 1, col: 1 }, char: 'Y', timestamp: 300 },
    ],
    totalTime: 3,
  },
];

describe('CrosswordDisplay', () => {
  test('renders the crossword grid SVG', () => {
    render(<CrosswordDisplay boardData={mockBoardData} solutions={[]} />);
    const svgElement = screen.getByRole('graphics-document', { name: '' }); // SVGs often don't have explicit roles/names unless set
    expect(svgElement).toBeInTheDocument();
    // Check for number of cells (rects + text for numbers)
    // 4 cells = 4 rects. 3 numbers = 3 text elements for numbers
    expect(svgElement.querySelectorAll('rect').length).toBe(4);
    expect(svgElement.querySelectorAll('text').length).toBe(3); // For cell numbers
  });

  test('renders the ClueDisplay component with correct clue counts', () => {
    render(<CrosswordDisplay boardData={mockBoardData} solutions={[]} />);
    const clueDisplayElement = screen.getByTestId('clue-display');
    expect(clueDisplayElement).toBeInTheDocument();
    expect(clueDisplayElement).toHaveTextContent('Across Clues: 2');
    expect(clueDisplayElement).toHaveTextContent('Down Clues: 2');
  });

  test('renders replay controls when solutions are provided', () => {
    render(<CrosswordDisplay boardData={mockBoardData} solutions={mockSolutions} topN={1} />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument(); // input type="range"
    expect(screen.getByText(/time: 0.0s \/ 2.0s/i)).toBeInTheDocument(); // Max time from user1
  });

  test('does not render replay controls when no solutions are provided', () => {
    render(<CrosswordDisplay boardData={mockBoardData} solutions={[]} />);
    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  test('Play/Pause button toggles isPlaying state and text', () => {
    render(<CrosswordDisplay boardData={mockBoardData} solutions={mockSolutions} topN={1} />);
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    fireEvent.click(playButton); // Now it's Pause button
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  // Basic test for character display after some time (manual step, not full animation)
  // This requires understanding the timing and how useEffect updates the grid.
  // This is a simplified test and doesn't verify the animation itself.
  test('displays characters based on replayTime', async () => {
    render(<CrosswordDisplay boardData={mockBoardData} solutions={mockSolutions} topN={2} />);
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    // Wait for a short time for replayTime to advance slightly (e.g., past 0.05s for user2's first char)
    // Timers in RTL are tricky; jest.useFakeTimers might be needed for precise control
    // For simplicity, we'll assume a state update occurs.
    // A better way would be to advance timers or control replayTime directly if possible.

    // Let's simulate moving the slider to a specific time
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.1' } }); // 0.1s, user2's 'X' at 0.05s, user1's 'A' at 0.1s

    // After replayTime is 0.1s:
    // Cell (0,0) should have 'A' (user1's char at 0.1s, user2 put 'X' at 0.05s. Last write wins in current logic or depends on solver order)
    // The test below assumes user1's 'A' will be shown because it's the last one processed for that time or due to solver order.
    // Current logic: iterate preparedSolutions (sorted by totalTime). Inner loop iterates solvePath.
    // If user2 is first in preparedSolutions, their X at 0.05s would be written.
    // Then user1's path is checked. Their A at 0.1s is also <= replayTime=0.1s. It overwrites.
    // So 'A' should be there.

    // This part is tricky because the update is async (useEffect).
    // We might need to wait for the text to appear.
    // The text elements for characters are inside the SVG.
    const svgElement = screen.getByRole('graphics-document', { name: '' });

    // We need to wait for the character 'A' to appear. findByText can wait.
    // However, SVG text might not be easily found by findByText if not structured with accessible roles.
    // Let's check the `currentGrid` state by looking for rendered characters.
    // This test is more of an integration test of the replay logic.
    // It's still simplified as it doesn't test the animation itself.

    // After setting time to 0.1s, cell 0,0 should have 'A' from user1
    // and cell 0,1 should not have 'B' yet (timestamp 0.2s)
    // This requires querying the SVG for text nodes.
    // screen.debug(svgElement); // Useful for seeing the structure

    // Example: find text 'A'. Note: text nodes in SVG can be tricky to query.
    // This test might need refinement based on how characters are rendered.
    // For now, this just checks that the component handles time changes.
    expect(await screen.findByText('A', {}, {timeout: 500})).toBeInTheDocument(); // User1's char 'A' at (0,0) at 0.1s
    expect(screen.queryByText('B')).not.toBeInTheDocument(); // User1's char 'B' at (0,1) at 0.2s

    fireEvent.change(slider, { target: { value: '0.2' } }); // 0.2s
    expect(await screen.findByText('B', {}, {timeout: 500})).toBeInTheDocument(); // User1's char 'B' at (0,1) at 0.2s

  });
});
