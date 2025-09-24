'use client'

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button, Popover } from '@mui/material'
import { Calendar } from "./calendar"

interface DateRangePickerProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
}

export default function DateRangePicker({ date, onDateChange, className }: DateRangePickerProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  return (
    <div className={className}>
      <Button
        id="date"
        variant="outlined"
        onClick={handleClick}
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
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={1}
        />
      </Popover>
    </div>
  )
}
