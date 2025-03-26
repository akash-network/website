import { cn } from "@/lib/utils";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import * as React from "react";
import { Doughnut } from "react-chartjs-2";

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CircularProgressBarProps {
  diameter?: number; // Diameter of the entire SVG element
  strokeWidth?: number; // Width of the stroke for the progress circles
  primaryProgress?: number; // Primary progress value (0-100)
  primaryColor?: string; // Color of the primary progress bar
  secondaryColor?: string; // Color of the secondary progress bar
  pathLength?: number; // Total path length for dasharray calculations
  className?: string; // Additional custom class names for styling
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  diameter = 100,
  strokeWidth = 9,
  primaryProgress = 50,
  primaryColor = "var(--primary)",
  secondaryColor = "#cccccc",
  className,
}) => {
  // Calculate the available and used percentages
  const availablePercentage = primaryProgress;
  const usedPercentage = 100 - primaryProgress;

  // Set up the data for the donut chart
  const data = {
    datasets: [
      {
        data: [availablePercentage, usedPercentage],
        backgroundColor: [primaryColor, secondaryColor],
        borderColor: ["transparent", "transparent"],
        borderWidth: 0,
        borderRadius: 10,
        spacing: 2, // Add space between segments
        weight: strokeWidth,
      },
    ],
  };

  // Configure the options for the donut chart
  const options = {
    cutout: `${85}%`, // Thickness of the donut (higher percentage = thinner ring)
    responsive: true,
    maintainAspectRatio: true,
    layout: {
      padding: 0,
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
    },
    animation: {
      animateRotate: true,
      animateScale: false,
    },
  };

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className,
      )}
    >
      <div className="h-full w-full">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default CircularProgressBar;
