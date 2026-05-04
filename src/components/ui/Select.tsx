import React from "react";
import { cn } from "../../utils/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            // Base styles
            "w-full px-4 py-2.5 rounded-xl bg-white border appearance-none text-sm font-bold",
            "text-slate-700 placeholder:text-slate-400",
            "transition-all duration-200 ease-in-out",
            "focus:bg-white focus:outline-none focus:ring-2",

            // Default state (no error)
            !error && "border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500 hover:bg-slate-50 shadow-sm cursor-pointer",

            // Error state
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",

            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom Chevron */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
