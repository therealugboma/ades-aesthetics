"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

interface BookingStepsProps {
  steps: Step[];
  currentStep: number;
}

export default function BookingSteps({
  steps,
  currentStep,
}: BookingStepsProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                  isCompleted &&
                    "bg-rose-gold text-white shadow-md shadow-rose-gold/25",
                  isCurrent &&
                    "border-2 border-rose-gold bg-white text-rose-gold shadow-md",
                  !isCompleted &&
                    !isCurrent &&
                    "border-2 border-border-light bg-white text-muted"
                )}
              >
                {isCompleted ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  isCurrent
                    ? "text-rose-gold"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-6 h-0.5 w-12 sm:w-20",
                  index < currentStep ? "bg-rose-gold" : "bg-border-light"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
