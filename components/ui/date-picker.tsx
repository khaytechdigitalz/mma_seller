"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isWithinInterval,
  isBefore,
} from "date-fns";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "@/icons";
import { cn } from "@/lib/utils";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DatePickerProps {
  // Single date mode
  date?: Date;
  setDate?: (date: Date | undefined) => void;
  // Range mode
  dateRange?: DateRange;
  setDateRange?: (range: DateRange) => void;
  // Common props
  mode?: "single" | "range";
  label?: string;
  className?: string;
}

export default function DatePicker({
  date,
  setDate,
  dateRange,
  setDateRange,
  mode = "single",
  label = "Select Date",
  className,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(
    date || dateRange?.from || new Date(),
  );
  const [rangeStart, setRangeStart] = useState<Date | undefined>(
    dateRange?.from,
  );

  const hasValue =
    mode === "single" ? !!date : !!(dateRange?.from || dateRange?.to);

  const getDisplayValue = () => {
    if (mode === "single") {
      return date ? format(date, "MMM dd, yyyy") : "-- -- --";
    } else {
      if (dateRange?.from && dateRange?.to) {
        return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
      } else if (dateRange?.from) {
        return `${format(dateRange.from, "MMM dd, yyyy")} - ...`;
      }
      return "-- -- --";
    }
  };

  const handleDayClick = (day: Date, close: () => void) => {
    if (mode === "single") {
      setDate?.(day);
      close();
    } else {
      // Range mode
      if (!rangeStart || (rangeStart && dateRange?.to)) {
        // Start new range
        setRangeStart(day);
        setDateRange?.({ from: day, to: undefined });
      } else {
        // Complete the range
        if (isBefore(day, rangeStart)) {
          setDateRange?.({ from: day, to: rangeStart });
        } else {
          setDateRange?.({ from: rangeStart, to: day });
        }
        setRangeStart(undefined);
        close();
      }
    }
  };

  const isInRange = (day: Date) => {
    if (mode !== "range" || !dateRange?.from || !dateRange?.to) return false;
    return isWithinInterval(day, { start: dateRange.from, end: dateRange.to });
  };

  const isRangeStart = (day: Date) => {
    if (mode !== "range" || !dateRange?.from) return false;
    return isSameDay(day, dateRange.from);
  };

  const isRangeEnd = (day: Date) => {
    if (mode !== "range" || !dateRange?.to) return false;
    return isSameDay(day, dateRange.to);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-500/20 -mx-4 px-5">
        <button
          type="button"
          className="flex items-center gap-1 text-base font-semibold text-gray-900 hover:text-primary transition-colors"
        >
          {format(currentMonth, "MMMM yyyy")}
          <ChevronDown className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return (
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = (close: () => void) => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected =
          mode === "single" ? date && isSameDay(day, date) : false;
        const isTodayDate = isToday(day);
        const inRange = isInRange(day);
        const isStart = isRangeStart(day);
        const isEnd = isRangeEnd(day);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative",
              inRange && !isStart && !isEnd && "bg-primary/10",
              isStart && "rounded-l-full bg-primary/10",
              isEnd && "rounded-r-full bg-primary/10",
            )}
          >
            <button
              type="button"
              onClick={() => handleDayClick(cloneDay, close)}
              className={cn(
                "w-10 h-10 flex items-center justify-center text-sm rounded-full transition-colors relative z-10",
                !isCurrentMonth && "text-gray-300",
                isCurrentMonth &&
                  !isSelected &&
                  !isStart &&
                  !isEnd &&
                  "text-gray-900 hover:bg-gray-100",
                isTodayDate &&
                  !isSelected &&
                  !isStart &&
                  !isEnd &&
                  "bg-gray-100 font-semibold",
                (isSelected || isStart || isEnd) &&
                  "bg-primary size-9 text-white font-semibold hover:bg-primary-dark",
              )}
            >
              {format(day, "d")}
            </button>
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>,
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className={cn("relative", className)}>
      <Popover>
        {({ open, close }) => (
          <>
            <PopoverButton className="w-full bg-transparent focus:outline-none focus-visible:ring-0">
              <div className="relative w-full">
                <div
                  className={cn(
                    "flex items-center w-full px-3.5 py-4 h-14 text-sm bg-transparent rounded-full border transition-colors",
                    open || hasValue ? "border-primary" : "border-gray-300",
                    "focus:outline-none focus:ring-0",
                  )}
                >
                  <CalendarIcon
                    className={cn(
                      "mr-2 h-5 w-5 shrink-0 transition-colors",
                      open || hasValue
                        ? "text-primary"
                        : "text-light-primary-text",
                    )}
                  />
                  <span
                    className={cn(
                      "block truncate text-sm",
                      hasValue ? "text-light-primary-text" : "text-transparent",
                    )}
                  >
                    {hasValue ? getDisplayValue() : " "}
                  </span>
                </div>

                <label
                  className={cn(
                    "absolute text-sm duration-300 transform  px-2 pointer-events-none start-8",
                    hasValue || open
                      ? "-translate-y-4 scale-75 bg-white top-2 text-primary z-10 origin-left left-3.5"
                      : "scale-100 -translate-y-1/2 top-1/2 text-gray-500",
                  )}
                >
                  {label}
                </label>
              </div>
            </PopoverButton>

            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <PopoverPanel
                anchor="bottom start"
                className="z-50 mt-2 p-4 bg-white rounded-lg ring-1 ring-gray-500/20 max-w-[480px]"
              >
                {renderHeader()}
                {renderDays()}
                {renderCells(close)}
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}
