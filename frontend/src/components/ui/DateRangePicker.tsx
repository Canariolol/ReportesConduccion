"use client"

import * as React from "react"
import { CalendarIcon, Check } from "lucide-react"
import { format } from "date-fns"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

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
              "w-full justify-start text-left font-normal rounded-xl border-border bg-background hover:bg-accent hover:text-accent-foreground",
              !selected?.from && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(selected)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl border-border" align="start">
          <div className="p-4 space-y-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selected?.from}
              selected={tempRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              className="rounded-xl"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!tempRange?.from}
              >
                <Check className="mr-1 h-3 w-3" />
                Confirm
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateRangePicker
