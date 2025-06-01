import React, { useState } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface PuzzleCalendarProps {
  onDateChange: (date: Date) => void;
}

const PuzzleCalendar: React.FC<PuzzleCalendarProps> = ({ onDateChange }) => {
  const [date, setDate] = useState<Date>(new Date()); // Default to today

  const handleDateClick = (value: Date) => {
    setDate(value);
    onDateChange(value);
  };

  const onChange: CalendarProps['onChange'] = (value, event) => {
    if (value instanceof Date) {
      handleDateClick(value);
    }
  };

  return (
    <div>
      <Calendar
        onChange={onChange}
        value={date}
      />
    </div>
  );
};

export default PuzzleCalendar;