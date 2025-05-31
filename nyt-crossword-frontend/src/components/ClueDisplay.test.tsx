import React from 'react';
import { render, screen } from '@testing-library/react';
import ClueDisplay from './ClueDisplay';
import { CrosswordClues } from './CrosswordDisplay'; // Import the type

describe('ClueDisplay', () => {
  const mockClues: CrosswordClues = {
    across: {
      1: 'The sound a cat makes',
      5: 'Opposite of down',
    },
    down: {
      2: 'Not up',
      3: 'A small, mischievous creature',
    },
  };

  test('renders Across and Down sections with titles', () => {
    render(<ClueDisplay clues={mockClues} />);
    expect(screen.getByRole('heading', { name: /across/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /down/i })).toBeInTheDocument();
  });

  test('renders individual clues correctly', () => {
    render(<ClueDisplay clues={mockClues} />);

    // Check Across clues
    expect(screen.getByText((content, element) => content.startsWith('1.') && content.includes('The sound a cat makes'))).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.startsWith('5.') && content.includes('Opposite of down'))).toBeInTheDocument();

    // Check Down clues
    expect(screen.getByText((content, element) => content.startsWith('2.') && content.includes('Not up'))).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.startsWith('3.') && content.includes('A small, mischievous creature'))).toBeInTheDocument();
  });

  test('renders only Across clues if no Down clues are provided', () => {
    const acrossOnlyClues: CrosswordClues = { across: { 10: 'Test clue' }, down: {} };
    render(<ClueDisplay clues={acrossOnlyClues} />);
    expect(screen.getByRole('heading', { name: /across/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /down/i })).not.toBeInTheDocument();
    expect(screen.getByText('10.')).toBeInTheDocument();
  });

  test('renders only Down clues if no Across clues are provided', () => {
    const downOnlyClues: CrosswordClues = { down: { 12: 'Another test' }, across: {} };
    render(<ClueDisplay clues={downOnlyClues} />);
    expect(screen.queryByRole('heading', { name: /across/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /down/i })).toBeInTheDocument();
    expect(screen.getByText('12.')).toBeInTheDocument();
  });

  test('renders "No clues available." if clues object is empty or malformed', () => {
    render(<ClueDisplay clues={{ across: {}, down: {} }} />);
    expect(screen.getByText(/no clues available/i)).toBeInTheDocument();
  });

  test('renders "No clues available." if clues prop is undefined (though TS might prevent this)', () => {
    // @ts-ignore to test runtime robustness if props were not typed
    render(<ClueDisplay clues={undefined} />);
    expect(screen.getByText(/no clues available/i)).toBeInTheDocument();
  });
});
