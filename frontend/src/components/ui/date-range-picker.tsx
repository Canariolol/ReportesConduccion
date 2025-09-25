'use client'

import * as React from "react"
import { format, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button, Box } from '@mui/material'
import { Calendar } from "./calendar"
import Modal from './Modal'

// Helper function to format weekday names
const formatWeekdayName = (day: Date, options?: { locale?: any }) => {
  return format(day, 'EEEEE', { locale: options?.locale }).charAt(0).toUpperCase();
};

interface DateRangePickerProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ date, onDateChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [localDate, setLocalDate] = React.useState<DateRange | undefined>(date);

  React.useEffect(() => {
    setLocalDate(date);
  }, [date]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const handleDayClick = (day: Date) => {
    if (localDate?.from && localDate.to) {
      setLocalDate({ from: day, to: undefined });
    } else if (localDate?.from) {
      if (isAfter(day, localDate.from)) {
        setLocalDate({ from: localDate.from, to: day });
      } else {
        setLocalDate({ from: day, to: localDate.from });
      }
    } else {
      setLocalDate({ from: day, to: undefined });
    }
  };

  const handleClear = () => {
    setLocalDate(undefined);
  };

  const handleConfirm = () => {
    onDateChange(localDate);
    handleClose();
  };

  const modalActions = (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%' }}>
      <Button variant="outlined" onClick={handleClear}>Limpiar</Button>
      <Button variant="contained" onClick={handleConfirm}>Confirmar</Button>
    </Box>
  );

  return (
    <div className={className}>
      <Button
        id="date"
        variant="outlined"
        onClick={handleOpen}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          textAlign: 'left',
          fontWeight: 'normal',
          textTransform: 'none',
          color: date ? 'inherit' : 'text.secondary',
          borderColor: 'rgba(0, 0, 0, 0.23)',
          '&:hover': {
            borderColor: 'rgba(0, 0, 0, 0.87)',
          },
        }}
      >
        <CalendarIcon style={{ marginRight: '8px', height: '16px', width: '16px' }} />
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, "dd-MM-yyyy", { locale: es })} -{" "}
              {format(date.to, "dd-MM-yyyy", { locale: es })}
            </>
          ) : (
            format(date.from, "dd-MM-yyyy", { locale: es })
          )
        ) : (
          <span>dd-mm-yyyy - dd-mm-yyyy</span>
        )}
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Seleccionar Rango de Fechas"
        actions={modalActions}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -2 }}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={localDate?.from}
            selected={localDate}
            onDayClick={handleDayClick}
            numberOfMonths={1}
            formatters={{ formatWeekdayName }}
            locale={es}
          />
        </Box>
      </Modal>
    </div>
  )
}