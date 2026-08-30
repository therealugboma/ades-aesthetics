import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  accentColor?: "rose" | "blue" | "green" | "purple" | "amber";
}

const accentColors = {
  rose: "border-l-rose-gold bg-rose-gold/5",
  blue: "border-l-blue-500 bg-blue-500/5",
  green: "border-l-green-500 bg-green-500/5",
  purple: "border-l-purple-500 bg-purple-500/5",
  amber: "border-l-amber-500 bg-amber-500/5",
};

const iconColors = {
  rose: "bg-rose-gold/10 text-rose-gold",
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-green-500/10 text-green-500",
  purple: "bg-purple-500/10 text-purple-500",
  amber: "bg-amber-500/10 text-amber-500",
};

export default function StatsCard({
  title,
  value,
  trend,
  icon,
  accentColor = "rose",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-light border-l-4 bg-white p-6 shadow-sm",
        accentColors[accentColor]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <svg
                className={cn(
                  "h-4 w-4",
                  trend.isPositive ? "text-green-500" : "text-error"
                )}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    trend.isPositive
                      ? "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                      : "M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 015.572 5.572l2.7 1.2m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941"
                  }
                />
              </svg>
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-500" : "text-error"
                )}
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted">vs last month</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            iconColors[accentColor]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
