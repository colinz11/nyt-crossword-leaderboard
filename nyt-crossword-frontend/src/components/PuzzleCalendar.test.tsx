import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PuzzleCalendar from './PuzzleCalendar';
// react-calendar does not export types for CalendarProps['onChange'] in a way that's easily usable for direct value types in tests
// We will test by clicking on a day, which is more user-centric.

describe('PuzzleCalendar', () => {
  test('renders the calendar', () => {
    const mockOnDateChange = jest.fn();
    render(<PuzzleCalendar onDateChange={mockOnDateChange} />);

    // Check for a known class or structure of react-calendar
    // This is a bit of a fragile selector, but react-calendar doesn't offer many specific roles for the main view
    const calendarElement = screen.getByText(new Date().getFullYear().toString()); // Check if current year is visible
    expect(calendarElement).toBeInTheDocument();

    // A more robust way might be to check for the presence of day buttons
    // This gets the button for the current day.
    const todayButton = screen.getByText(new Date().getDate().toString());
    expect(todayButton).toBeInTheDocument();
  });

  test('calls onDateChange when a date is clicked', () => {
    const mockOnDateChange = jest.fn();
    render(<PuzzleCalendar onDateChange={mockOnDateChange} />);

    // Get a day button (e.g., the 15th of the current month/year view)
    // Note: This might fail if the 15th is not in the current view or is disabled.
    // A more robust test might require navigating the calendar or ensuring a specific date is available.
    // For simplicity, we'll try to click on the 15th, assuming it's visible.
    const dayToClick = screen.getByText('15'); // Assumes '15' is visible
    fireEvent.click(dayToClick);

    expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    // Check if the date passed to onDateChange is a Date object
    expect(mockOnDateChange.mock.calls[0][0]).toBeInstanceOf(Date);
    // Optionally, check if it's the correct date, though this depends on calendar's current view
    // For example, if the calendar is showing the current month:
    // const expectedDate = new Date();
    // expectedDate.setDate(15);
    // expect(mockOnDateChange.mock.calls[0][0].getDate()).toBe(expectedDate.getDate());
    // expect(mockOnDateChange.mock.calls[0][0].getMonth()).toBe(expectedDate.getMonth());
  });
});
