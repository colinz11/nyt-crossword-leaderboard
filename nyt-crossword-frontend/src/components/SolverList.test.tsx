import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // For <Link>
import SolverList, { SolverForList } from './SolverList';

describe('SolverList', () => {
  const mockSolvers: SolverForList[] = [
    { userID: 'user1', username: 'Alice', solveTime: 120 },
    { userID: 'user2', solveTime: 150.5 },
    { userID: 'user3', username: 'Bob', displayValue: 'Special Value' },
  ];

  test('renders the title', () => {
    render(
      <Router>
        <SolverList solvers={mockSolvers} title="Top Players" />
      </Router>
    );
    expect(screen.getByRole('heading', { name: /top players/i })).toBeInTheDocument();
  });

  test('renders a list of solvers with correct data', () => {
    render(
      <Router>
        <SolverList solvers={mockSolvers} />
      </Router>
    );

    // Check for Alice
    const aliceLink = screen.getByRole('link', { name: /alice/i });
    expect(aliceLink).toBeInTheDocument();
    expect(aliceLink).toHaveAttribute('href', '/user/user1');
    expect(screen.getByText(/time: 120.00 seconds/i)).toBeInTheDocument();

    // Check for User 2 (no username)
    const user2Link = screen.getByRole('link', { name: /user user2/i });
    expect(user2Link).toBeInTheDocument();
    expect(user2Link).toHaveAttribute('href', '/user/user2');
    expect(screen.getByText(/time: 150.50 seconds/i)).toBeInTheDocument();

    // Check for Bob (with displayValue)
    const bobLink = screen.getByRole('link', { name: /bob/i });
    expect(bobLink).toBeInTheDocument();
    expect(bobLink).toHaveAttribute('href', '/user/user3');
    expect(screen.getByText(/special value/i)).toBeInTheDocument();
  });

  test('renders links correctly', () => {
    render(
      <Router>
        <SolverList solvers={mockSolvers.slice(0, 1)} />
      </Router>
    );
    const userLink = screen.getByRole('link', { name: /alice/i });
    expect(userLink).toHaveAttribute('href', '/user/user1');
  });

  test('renders empty message when no solvers are provided', () => {
    render(
      <Router>
        <SolverList solvers={[]} emptyMessage="No one here!" />
      </Router>
    );
    expect(screen.getByText(/no one here!/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('renders default empty message if none provided', () => {
    render(
      <Router>
        <SolverList solvers={[]} />
      </Router>
    );
    expect(screen.getByText(/no solvers to display/i)).toBeInTheDocument();
  });

   test('renders default title if none provided', () => {
    render(
      <Router>
        <SolverList solvers={mockSolvers} />
      </Router>
    );
    expect(screen.getByRole('heading', {name: /fastest solvers/i})).toBeInTheDocument();
  });
});
