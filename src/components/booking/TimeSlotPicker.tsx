"use client";

import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoading?: boolean;
}

export default function TimeSlotPicker({
  slots,
  selectedTime,
  onSelectTime,
  isLoading = false,
}: TimeSlotPickerProps) {
  if (isLoading) {
    return (
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Pick a Time
        </h2>
        <p className="mt-1 text-sm text-muted">Loading available times...</p>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-blush-light"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Pick a Time
      </h2>
      <p className="mt-1 text-sm text-muted">
        Select your preferred time slot
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;

          return (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelectTime(slot.time)}
              disabled={!slot.available}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
                !slot.available &&
                  "cursor-not-allowed bg-gray-50 text-muted-light line-through",
                slot.available &&
                  !isSelected &&
                  "border border-border-light bg-white text-foreground hover:border-rose-gold-light hover:shadow-sm",
                isSelected &&
                  "border-2 border-rose-gold bg-blush text-rose-gold-dark shadow-md"
              )}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
