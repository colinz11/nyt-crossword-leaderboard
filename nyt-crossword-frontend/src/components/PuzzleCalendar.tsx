import React, { useState } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PuzzleCalendar.css';

interface PuzzleCalendarProps {
  onDateChange: (date: Date) => void;
  highlightedDates?: Date[]; // Dates that should be highlighted (e.g., completed puzzles)
}

const PuzzleCalendar: React.FC<PuzzleCalendarProps> = ({ onDateChange, highlightedDates = [] }) => {
  const [date, setDate] = useState<Date>(new Date()); // Default to today

  const handleDateClick = (value: Date) => {
    setDate(value);
    onDateChange(value);
  };

  const onChange: CalendarProps['onChange'] = (value) => {
    // Handle both single date and date range selections
    const selectedDate = Array.isArray(value) ? value[0] : value;
    if (selectedDate instanceof Date) {
      handleDateClick(selectedDate);
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const isHighlighted = highlightedDates.some(
        (highlightedDate) =>
          highlightedDate.getDate() === date.getDate() &&
          highlightedDate.getMonth() === date.getMonth() &&
          highlightedDate.getFullYear() === date.getFullYear()
      );
      return isHighlighted ? 'highlighted-date' : '';
    }
    return '';
  };

  return (
    <div className="puzzle-calendar">
      <Calendar
        onChange={onChange}
        value={date}
        tileClassName={tileClassName}
        minDetail="month"
        maxDetail="month"
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={false}
        selectRange={false}
      />
    </div>
  );
};

export default PuzzleCalendar;