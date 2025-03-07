"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DateFilterDialogProps {
  onDateChange: (range: DateRange) => void;
  isDarkMode: boolean;
}

export function DateFilterDialog({ onDateChange, isDarkMode }: DateFilterDialogProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const today = new Date();

  const yesterday = {
    from: subDays(today, 1),
    to: subDays(today, 1),
  };
  
  const last7Days = {
    from: subDays(today, 6),
    to: today,
  };
  
  const last30Days = {
    from: subDays(today, 29),
    to: today,
  };
  
  const monthToDate = {
    from: startOfMonth(today),
    to: today,
  };
  
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1)),
  };
  
  const yearToDate = {
    from: startOfYear(today),
    to: today,
  };
  
  const lastYear = {
    from: startOfYear(subYears(today, 1)),
    to: endOfYear(subYears(today, 1)),
  };

  const handleSelect = (range: DateRange) => {
    setDate(range);
    if (range?.from && range?.to) {
      onDateChange(range);
      setIsOpen(false);
      setShowCustom(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`w-full justify-start text-left font-normal ${
          isDarkMode ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-white"
        }`}
      >
        {date?.from ? (
          date.to ? (
            <>
              {date.from.toLocaleDateString()} - {date.to.toLocaleDateString()}
            </>
          ) : (
            date.from.toLocaleDateString()
          )
        ) : (
          <span>Filter by Date</span>
        )}
      </Button>
      <DialogContent className={`sm:max-w-[800px] ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? "text-white" : ""}>Select Date Range</DialogTitle>
        </DialogHeader>
        <div className="flex max-sm:flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <div className="relative border-border py-4 max-sm:order-1 max-sm:border-t sm:w-48">
            <div className="h-full border-border sm:border-e">
              <div className="flex flex-col gap-1 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setDate({
                      from: today,
                      to: today,
                    });
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setDate(yesterday);
                  }}
                >
                  Yesterday
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setDate(last7Days);
                  }}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setDate(last30Days);
                  }}
                >
                  Last 30 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setDate(monthToDate);
                  }}
                >
                  Month to date
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setDate(lastMonth);
                  }}
                >
                  Last month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setDate(yearToDate);
                  }}
                >
                  Year to date
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setDate(lastYear);
                  }}
                >
                  Last year
                </Button>
              </div>
            </div>
          </div>
          <Calendar
            mode="range"
            selected={date}
            onSelect={handleSelect}
            month={date?.from || today}
            numberOfMonths={2}
            className={`p-4 ${isDarkMode ? "bg-gray-900 text-white" : "bg-background"}`}
            disabled={[{ after: today }]}
            showOutsideDays={false}
            fixedWeeks
          />
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              setDate(undefined);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (date?.from && date?.to) {
                onDateChange(date);
                setIsOpen(false);
              }
            }}
            disabled={!date?.from || !date?.to}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}