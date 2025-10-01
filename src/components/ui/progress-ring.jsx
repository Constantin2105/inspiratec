import React from 'react';
import { cn } from '@/lib/utils/cn';

const ProgressRing = ({
  progress,
  size = 40,
  strokeWidth = 4,
  className,
  ...props
}) => {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getRingColor = (p) => {
    if (p >= 80) return 'stroke-green-500';
    if (p >= 50) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }} {...props}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-300", getRingColor(progress))}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {Math.round(progress)}
      </span>
    </div>
  );
};

export default ProgressRing;