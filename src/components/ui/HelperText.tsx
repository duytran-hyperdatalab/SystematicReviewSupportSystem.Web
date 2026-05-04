import React from "react";
import { cn } from "../../utils/cn";

export interface HelperTextProps {
  id?: string;
  message?: string;
  variant?: "default" | "error";
  className?: string;
}

const HelperText: React.FC<HelperTextProps> = ({ 
  id,
  message, 
  variant = "default", 
  className 
}) => {
  if (!message) return null;

  return (
    <p
      id={id}
      className={cn(
        "text-sm font-medium mt-1.5 ml-1",
        variant === "default" && "text-text-muted",
        variant === "error" && "text-red-500",
        className
      )}
    >
      {message}
    </p>
  );
};

export default HelperText;
