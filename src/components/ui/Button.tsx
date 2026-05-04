import React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, isLoading, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary text-text-on-primary border border-transparent shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/30 focus:ring-primary/20 focus:border-primary",
      secondary: "bg-gray-200 text-gray-800 border border-transparent hover:bg-gray-300 focus:ring-gray-300",
      danger: "bg-red-600 text-white border border-transparent hover:bg-red-700 focus:ring-red-600/20",
      success: "bg-green-600 text-white border border-transparent hover:bg-green-700 focus:ring-green-600/20",
      outline: "bg-transparent border border-gray-300 text-text-main hover:bg-gray-50 focus:ring-gray-200",
      ghost: "bg-transparent text-text-main hover:bg-gray-100 focus:ring-gray-200",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-3.5 text-base",
      lg: "px-6 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          // Base Layout & Typography
          "rounded-xl font-semibold tracking-wide flex items-center justify-center transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
          
          variants[variant],
          sizes[size],
          
          // Animation
          !disabled && !isLoading && "transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",

          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-currentColor"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
