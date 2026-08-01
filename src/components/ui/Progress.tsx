import { clsx } from "clsx";

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function Progress({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div
        className={clsx(
          "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
          sizeClasses[size],
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-300 ease-out",
            pct >= 100
              ? "bg-green-500"
              : pct >= 75
                ? "bg-blue-500"
                : pct >= 50
                  ? "bg-yellow-500"
                  : "bg-blue-400",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono min-w-[3ch]">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
