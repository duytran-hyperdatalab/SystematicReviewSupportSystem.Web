import React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // Base styles
          "w-full px-4 py-3 rounded-xl bg-gray-50/50 border",
          "text-text-main placeholder:text-gray-400",
          "transition-all duration-200 ease-in-out",
          "focus:bg-white focus:outline-none focus:ring-2",
          
          // Default state (no error)
          !error && "border-border-default focus:ring-primary/20 focus:border-border-focus",

          // Error state
          error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",

          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
