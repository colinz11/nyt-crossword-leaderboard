import React from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styling

interface PuzzleCalendarProps {
  onDateChange: (date: Date) => void;
  // tileClassName?: ({ date, view }: { date: Date; view: string }) => string | null | undefined; // Optional: for custom styling of dates
}

const PuzzleCalendar: React.FC<PuzzleCalendarProps> = ({ onDateChange }) => {
  const handleDateClick = (value: Date) => {
    onDateChange(value);
  };

  // Type assertion for the Calendar component's onChange prop
  const onChange: CalendarProps['onChange'] = (value, event) => {
    if (value instanceof Date) {
      handleDateClick(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      // Handle date range selection if necessary, for now, take the start of the range
      handleDateClick(value[0]);
    }
  };

  return (
    <div>
      <Calendar
        onChange={onChange}
        // tileClassName={tileClassName} // Optional: for custom styling
        // You can add other props here like maxDate, minDate, etc.
      />
    </div>
  );
};

export default PuzzleCalendar;
