"use client"

import * as React from "react"
import { CalendarIcon, Check } from "lucide-react"
import { format } from "date-fns"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverDialog, PopoverTrigger } from "./popover"

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
  placeholder = "Pick a date range",
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(selected)

  const handleSelect = (range: DateRange | undefined) => {
    setTempRange(range)
  }

  const handleConfirm = () => {
    onSelect?.(tempRange)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempRange(selected)
    setOpen(false)
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder
    if (!range.to) return format(range.from, "MMM dd, yyyy")
    return `${format(range.from, "MMM dd, yyyy")} - ${format(range.to, "MMM dd, yyyy")}`
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground min-h-[40px] px-3 py-2 cursor-pointer",
              !selected?.from && "text-muted-foreground"
            )}
            isDisabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatDateRange(selected)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverDialog className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]" align="start">
          <div className="p-4 space-y-4 bg-white">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selected?.from}
              selected={tempRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              className="bg-white rounded-lg"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
                isDisabled={!tempRange?.from}
              >
                <Check className="mr-1 h-3 w-3" />
                Confirmar
              </Button>
            </div>
          </div>
        </PopoverDialog>
      </Popover>
    </div>
  )
}

export default DateRangePicker
