'use client'

import * as React from 'react';
import { DateRangePicker as MuiDateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es'; // Import Spanish locale for dayjs

// Define the value type for the picker
export type DateRange = [Dayjs | null, Dayjs | null];

interface DateRangePickerProps {
  date: { from?: Date, to?: Date };
  onDateChange: (date: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ date, onDateChange, className }: DateRangePickerProps) {
  const [value, setValue] = React.useState<DateRange>([null, null]);

  // Sync state when the external `date` prop changes
  React.useEffect(() => {
    const from = date.from ? dayjs(date.from) : null;
    const to = date.to ? dayjs(date.to) : null;
    setValue([from, to]);
  }, [date]);

  const handleDateChange = (newValue: DateRange) => {
    setValue(newValue);
    onDateChange(newValue);
  };

  return (
    <Box className={className}>
      <MuiDateRangePicker
        value={value}
        onChange={handleDateChange}
      />
    </Box>
  );
}
