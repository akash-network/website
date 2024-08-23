import { cn } from '@/lib/utils';
import * as React from 'react';

interface CircularProgressBarProps {
    diameter?: number; // Diameter of the entire SVG element
    strokeWidth?: number; // Width of the stroke for the progress circles
    progressValue: number; // Progress value (0-100) representing the percentage of the circle that is filled
    primaryColor?: string; // Color of the primary progress bar
    secondaryColor?: string; // Color of the secondary progress bar
    backgroundCircleColor?: string; // Background color for the circle behind the progress bars
    gapSize?: number; // Gap between the primary and secondary progress bars
    className?: string; // Additional custom class names for styling
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
    diameter = 100,
    strokeWidth = 10,
    progressValue,
    primaryColor = '#ff4757',
    secondaryColor = '#e5e7eb',
    backgroundCircleColor = 'transparent',
    gapSize = 1,
    className,
}) => {
    // Radius of the progress circles
    const radius = (diameter - strokeWidth) / 2;
    // Circumference of the circles (used for calculating strokeDasharray)
    const circumference = 2 * Math.PI * radius;
    // Offset for the primary progress bar (determines how much of the circle is filled)
    const primaryOffset = circumference - (progressValue / 100) * circumference;
    // Offset for the secondary progress bar (adjusted for gap between bars)
    const secondaryOffset = circumference - (1 - (progressValue + gapSize * 2) / 100) * circumference;

    return (
        <svg
            width={diameter}
            height={diameter}
            className={cn("relative transform rotate-[-90deg]", className)} // Rotates the progress bar to start from the top
        >
            {/* Background Circle */}
            <circle
                cx={diameter / 2}
                cy={diameter / 2}
                r={radius}
                stroke={backgroundCircleColor}
                strokeWidth={strokeWidth}
                fill="transparent"
            />
            {/* Secondary Progress Bar */}
            <circle
                cx={diameter / 2}
                cy={diameter / 2}
                r={radius}
                stroke={secondaryColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={secondaryOffset}
                strokeLinecap="butt"
                transform={`rotate(${(progressValue + gapSize) * 3.6}, ${diameter / 2}, ${diameter / 2})`}
            />
            {/* Primary Progress Bar */}
            <circle
                cx={diameter / 2}
                cy={diameter / 2}
                r={radius}
                stroke={primaryColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={primaryOffset}
                strokeLinecap="butt"
            />
        </svg>
    );
};

export default CircularProgressBar;
