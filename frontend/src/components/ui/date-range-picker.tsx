import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange, DayPicker } from 'react-day-picker';
import { Popover, Box, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import { CalendarIcon } from 'lucide-react';

// Import the official stylesheet
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ date, onDateChange }: DateRangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  const displayValue = date?.from
    ? date.to
      ? `${format(date.from, 'dd/MM/yyyy', { locale: es })} - ${format(date.to, 'dd/MM/yyyy', { locale: es })}`
      : format(date.from, 'dd/MM/yyyy', { locale: es })
    : '';

  return (
    <div>
      <OutlinedInput
        value={displayValue}
        placeholder="Seleccione un rango de fechas"
        readOnly
        fullWidth
        sx={{ 
          pr: 1, // Add some padding to the right to not overlap with the icon button
          backgroundColor: 'white', // Match other inputs
        }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-describedby={id} onClick={handleClick} edge="end">
              <CalendarIcon size={20} color="#757575" />
            </IconButton>
          </InputAdornment>
        }
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <DayPicker
          mode="range"
          selected={date}
          onSelect={onDateChange}
          locale={es}
          numberOfMonths={2}
          defaultMonth={date?.from || new Date()}
          showOutsideDays
        />
      </Popover>
    </div>
  );
}
