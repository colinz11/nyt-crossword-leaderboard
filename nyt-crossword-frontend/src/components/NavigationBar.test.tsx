import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Needed for <Link>
import NavigationBar from './NavigationBar';

describe('NavigationBar', () => {
  test('renders Home and Puzzle links', () => {
    render(
      <Router>
        <NavigationBar />
      </Router>
    );

    const homeLink = screen.getByRole('link', { name: /home/i });
    const puzzleLink = screen.getByRole('link', { name: /puzzle/i });

    expect(homeLink).toBeInTheDocument();
    expect(puzzleLink).toBeInTheDocument();
  });

  test('Home link has correct href', () => {
    render(
      <Router>
        <NavigationBar />
      </Router>
    );
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('Puzzle link has correct href', () => {
    render(
      <Router>
        <NavigationBar />
      </Router>
    );
    const puzzleLink = screen.getByRole('link', { name: /puzzle/i });
    expect(puzzleLink).toHaveAttribute('href', '/puzzle');
  });
});
