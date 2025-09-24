"use client"

import React, { useState } from 'react'
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from 'date-fns/locale'
import { 
  Box, 
  Popover, 
  Button, 
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

interface DateRangePickerProps {
  selected?: DateRange
  onSelect?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function DateRangePicker({
  selected,
  onSelect,
  placeholder = "Seleccionar rango de fechas",
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange | undefined>(selected)
  const [selectingStart, setSelectingStart] = useState(true)

  const handleDateSelect = (date: Date | null) => {
    if (!date) return

    if (selectingStart) {
      setTempRange({
        from: date,
        to: undefined
      })
      setSelectingStart(false)
    } else {
      setTempRange(prev => ({
        from: prev?.from,
        to: date
      }))
    }
  }

  const handleConfirm = () => {
    if (tempRange?.from && tempRange?.to) {
      onSelect?.(tempRange)
    }
    setOpen(false)
    setSelectingStart(true)
  }

  const handleCancel = () => {
    setTempRange(selected)
    setOpen(false)
    setSelectingStart(true)
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder
    if (!range.to) return format(range.from, "dd-MM-yyyy", { locale: es })
    return `${format(range.from, "dd-MM-yyyy", { locale: es })} - ${format(range.to, "dd-MM-yyyy", { locale: es })}`
  }

  return (
    <Box className={className}>
      <Popover
        open={open}
        onClose={handleCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            width: 320
          }
        }}
      >
        <Card sx={{ border: 'none', boxShadow: 'none' }}>
          <CardContent sx={{ p: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                    {selectingStart ? 'Fecha inicio' : 'Fecha término'}
                  </Typography>
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    value={selectingStart ? tempRange?.from || null : tempRange?.to || null}
                    onChange={handleDateSelect}
                    maxDate={selectingStart ? undefined : tempRange?.from}
                    minDate={selectingStart ? tempRange?.to : undefined}
                    sx={{
                      '& .MuiPickersCalendar-root': {
                        minHeight: 280
                      },
                      '& .MuiPickersDay-root': {
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        height: 32,
                        width: 32,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          }
                        }
                      },
                      '& .MuiPickersCalendarHeader-label': {
                        fontSize: '0.875rem'
                      },
                      '& .MuiPickersArrowSwitcher-button': {
                        padding: 0
                      }
                    }}
                  />
                </Box>
                
                {tempRange?.from && (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Inicio: <strong>{format(tempRange.from, "dd-MM-yyyy", { locale: es })}</strong>
                    </Typography>
                    {tempRange?.to && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '0.75rem' }}>
                        Término: <strong>{format(tempRange.to, "dd-MM-yyyy", { locale: es })}</strong>
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button 
                    onClick={handleCancel}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1, fontSize: '0.75rem' }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      if (tempRange?.from && !tempRange?.to) {
                        setSelectingStart(false)
                      } else if (tempRange?.from && tempRange?.to) {
                        handleConfirm()
                      }
                    }}
                    size="small"
                    variant="contained"
                    sx={{ borderRadius: 1, fontSize: '0.75rem' }}
                    disabled={!tempRange?.from}
                  >
                    {tempRange?.from && !tempRange?.to ? 'Siguiente' : 'Listo'}
                  </Button>
                </Box>
              </Stack>
            </LocalizationProvider>
          </CardContent>
        </Card>
      </Popover>

      <IconButton
        onClick={() => setOpen(true)}
        disabled={disabled}
        size="small"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <CalendarIcon style={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  )
}

export default DateRangePicker
