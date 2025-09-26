'use client'

import * as React from "react"
import { format, isAfter, parse } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button, Box, TextField, InputAdornment } from '@mui/material'
import { Calendar } from "./calendar"
import { Popover, PopoverTrigger, PopoverDialog } from "./popover"

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
  const [localDate, setLocalDate] = React.useState<DateRange | undefined>(date);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  // Estados para los campos de la primera fecha
  const [startDay, setStartDay] = React.useState('');
  const [startMonth, setStartMonth] = React.useState('');
  const [startYear, setStartYear] = React.useState('');

  // Estados para los campos de la segunda fecha
  const [endDay, setEndDay] = React.useState('');
  const [endMonth, setEndMonth] = React.useState('');
  const [endYear, setEndYear] = React.useState('');

  React.useEffect(() => {
    setLocalDate(date);
    if (date?.from) {
      setStartDay(format(date.from, 'dd', { locale: es }));
      setStartMonth(format(date.from, 'MM', { locale: es }));
      setStartYear(format(date.from, 'yyyy', { locale: es }));
    } else {
      setStartDay('');
      setStartMonth('');
      setStartYear('');
    }

    if (date?.to) {
      setEndDay(format(date.to, 'dd', { locale: es }));
      setEndMonth(format(date.to, 'MM', { locale: es }));
      setEndYear(format(date.to, 'yyyy', { locale: es }));
    } else {
      setEndDay('');
      setEndMonth('');
      setEndYear('');
    }
  }, [date]);

  // Función para actualizar la fecha cuando cambian los campos
  const updateDateFromFields = () => {
    let newRange: DateRange | undefined = undefined;

    // Actualizar primera fecha si está completa
    if (startDay && startMonth && startYear) {
      const firstDate = parse(`${startDay}${startMonth}${startYear}`, 'ddMMyyyy', new Date());
      if (firstDate && !isNaN(firstDate.getTime())) {
        // Actualizar segunda fecha si está completa
        if (endDay && endMonth && endYear) {
          const secondDate = parse(`${endDay}${endMonth}${endYear}`, 'ddMMyyyy', new Date());
          if (secondDate && !isNaN(secondDate.getTime())) {
            newRange = { from: firstDate, to: secondDate };
          } else {
            newRange = { from: firstDate, to: undefined };
          }
        } else {
          newRange = { from: firstDate, to: undefined };
        }
      }
    }

    setLocalDate(newRange);
    onDateChange(newRange);
  };

  // Efectos para actualizar la fecha cuando cambian los campos
  React.useEffect(() => {
    const timer = setTimeout(updateDateFromFields, 500); // Debounce de 500ms
    return () => clearTimeout(timer);
  }, [startDay, startMonth, startYear, endDay, endMonth, endYear]);

  const handleDayClick = (day: Date) => {
    let newRange: DateRange;
    
    if (localDate?.from && localDate.to) {
      newRange = { from: day, to: undefined };
    } else if (localDate?.from) {
      if (isAfter(day, localDate.from)) {
        newRange = { from: localDate.from, to: day };
      } else {
        newRange = { from: day, to: localDate.from };
      }
    } else {
      newRange = { from: day, to: undefined };
    }
    
    setLocalDate(newRange);
    setPopoverOpen(false);
    onDateChange(newRange);
  };

  const handleClear = () => {
    setLocalDate(undefined);
    setStartDay('');
    setStartMonth('');
    setStartYear('');
    setEndDay('');
    setEndMonth('');
    setEndYear('');
    setPopoverOpen(false);
    onDateChange(undefined);
  };

  const handleConfirm = () => {
    onDateChange(localDate);
    setPopoverOpen(false);
  };

  const popoverActions = (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%', mt: 2 }}>
      <Button 
        variant="outlined" 
        onClick={handleClear}
        size="small"
      >
        Limpiar
      </Button>
      <Button 
        variant="contained" 
        onClick={handleConfirm}
        size="small"
      >
        Confirmar
      </Button>
    </Box>
  );

  // Función para manejar el input en campos específicos
  const handleFieldInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void, maxLength: number) => {
    const newValue = e.target.value.replace(/\D/g, ''); // Solo permitir números
    if (newValue.length <= maxLength) {
      setter(newValue);
    }
  };

  return (
    <div className={className}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        gap: 0.5, // Reducir espaciado entre elementos
      }}>
        {/* Contenedor principal para las fechas - ocupa todo el espacio disponible */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 1, // Ocupa todo el espacio restante
          minWidth: 0, // Permitir que se encoja
        }}>
          {/* Primera fecha - bloque único con subrayado */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.23)',
            paddingBottom: '4px',
            marginRight: '8px', // Espacio antes del guión
          }}>
            <input
              value={startDay}
              onChange={(e) => handleFieldInput(e, setStartDay, 2)}
              placeholder="dd"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '20px',
                fontSize: '14px',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
            <span style={{ margin: '0 2px', fontSize: '14px' }}>/</span>
            <input
              value={startMonth}
              onChange={(e) => handleFieldInput(e, setStartMonth, 2)}
              placeholder="mm"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '20px',
                fontSize: '14px',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
            <span style={{ margin: '0 2px', fontSize: '14px' }}>/</span>
            <input
              value={startYear}
              onChange={(e) => handleFieldInput(e, setStartYear, 4)}
              placeholder="aaaa"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '35px',
                fontSize: '14px',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
          </Box>

          {/* Separador */}
          <span style={{ margin: '0 4px', fontSize: '14px' }}>-</span>

          {/* Segunda fecha - bloque único con subrayado */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.23)',
            paddingBottom: '4px',
          }}>
            <input
              value={endDay}
              onChange={(e) => handleFieldInput(e, setEndDay, 2)}
              placeholder="dd"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '20px',
                fontSize: '14px',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
            <span style={{ margin: '0 2px', fontSize: '14px' }}>/</span>
            <input
              value={endMonth}
              onChange={(e) => handleFieldInput(e, setEndMonth, 2)}
              placeholder="mm"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '20px',
                fontSize: '14px',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
            <span style={{ margin: '0 2px', fontSize: '14px' }}>/</span>
            <input
              value={endYear}
              onChange={(e) => handleFieldInput(e, setEndYear, 4)}
              placeholder="aaaa"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '35px',
                fontSize: '14px',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
          </Box>
        </Box>

        {/* Botón del calendario - tamaño fijo pequeño */}
        <PopoverTrigger>
          <Button
            size="small"
            onClick={() => setPopoverOpen(true)}
            sx={{ 
              minWidth: '24px', 
              height: '24px', 
              padding: '2px',
              borderRadius: '4px',
              flexShrink: 0, // No permitir que se encoja
            }}
          >
            <CalendarIcon style={{ height: '14px', width: '14px' }} />
          </Button>
        </PopoverTrigger>
      </Box>

      <Popover isOpen={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverDialog>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
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
          {popoverActions}
        </PopoverDialog>
      </Popover>
    </div>
  )
}
