import React from "react";
import { cn } from "../../utils/cn";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", className, ...props }) => {
  const sizeStyles = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={cn("flex justify-center items-center", className)} {...props}>
      <div
        className={cn(
          "border-blue-200 border-t-primary rounded-full animate-spin",
          sizeStyles[size]
        )}
      />
    </div>
  );
};

export default LoadingSpinner;
