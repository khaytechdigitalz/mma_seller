import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  color: string; // Hex color or Tailwind class if setup for bg
  className?: string;
  trackColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color,
  className = "",
  trackColor = "bg-gray-200",
}) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`w-full h-2 rounded-full overflow-hidden ${trackColor} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ease-in-out ${color}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
