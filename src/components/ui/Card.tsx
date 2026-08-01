import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, className, hover = true, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm",
        hover &&
          "transition-shadow hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
