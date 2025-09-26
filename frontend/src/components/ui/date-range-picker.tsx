import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange, DayPicker } from 'react-day-picker';
import { Popover, Box, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import { CalendarIcon } from 'lucide-react';
import { Check as CheckIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';

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

  const handleClear = () => {
    onDateChange(undefined);
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
          pr: 1,
          backgroundColor: 'white',
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
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgb(0 0 0 / 0.1)',
            mt: 1,
          }
        }}
      >
        <Box sx={{
          fontSize: '0.875rem',
          p: 1.5,
          '--rdp-accent-color': '#1976d2',
          '--rdp-range_middle-background-color': '#e3f2fd',
          '--rdp-day-height': '36px',
          '--rdp-day-width': '36px',
        }}>
          <DayPicker
            mode="range"
            selected={date}
            onSelect={onDateChange}
            locale={es}
            numberOfMonths={2}
            defaultMonth={date?.from || new Date()}
            showOutsideDays
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
            <IconButton onClick={handleClear} size="small" title="Limpiar">
                <DeleteIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={handleClose} size="small" color="primary" title="Confirmar" sx={{ ml: 0.5 }}>
                <CheckIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Popover>
    </div>
  );
}