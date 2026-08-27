"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export default function DatePicker({
  selectedDate,
  onSelectDate,
}: DatePickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isPastDate = (day: number) => {
    if (currentYear < todayYear) return true;
    if (currentYear === todayYear && currentMonth < todayMonth) return true;
    if (
      currentYear === todayYear &&
      currentMonth === todayMonth &&
      day < todayDate
    )
      return true;
    return false;
  };

  const formatDate = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Pick a Date
      </h2>
      <p className="mt-1 text-sm text-muted">Select your preferred date</p>

      <div className="mt-6 rounded-2xl border border-border-light bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-blush-light"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h3 className="font-heading text-base font-semibold text-foreground">
            {monthName}
          </h3>
          <button
            onClick={goToNextMonth}
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-blush-light"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(day);
            const past = isPastDate(day);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => !past && onSelectDate(dateStr)}
                disabled={past}
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                  past && "cursor-not-allowed text-muted-light/50",
                  !past && !isSelected && "text-foreground hover:bg-blush-light",
                  isSelected && "bg-rose-gold text-white shadow-md"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
