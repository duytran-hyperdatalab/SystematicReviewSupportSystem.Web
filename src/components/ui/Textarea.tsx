import React from "react";
import { cn } from "../../utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          // Base styles
          "w-full px-4 py-3 rounded-xl bg-gray-50/50 border",
          "text-text-main placeholder:text-gray-400",
          "transition-all duration-200 ease-in-out",
          "focus:bg-white focus:outline-none focus:ring-2",
          "min-h-[100px] resize-y", // Textarea specific
          
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

Textarea.displayName = "Textarea";

export default Textarea;
