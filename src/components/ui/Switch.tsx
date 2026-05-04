import React from 'react';
import { cn } from '../../utils/cn';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

const Switch: React.FC<SwitchProps> = ({
    checked,
    onChange,
    disabled = false,
    label,
    className
}) => {
    return (
        <label className={cn(
            "inline-flex items-center cursor-pointer select-none group",
            disabled && "cursor-not-allowed opacity-50",
            className
        )}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                />
                {/* Track */}
                <div className={cn(
                    "w-11 h-6 rounded-full transition-colors duration-200 ease-in-out",
                    checked ? "bg-indigo-600" : "bg-slate-200 group-hover:bg-slate-300"
                )} />
                {/* Thumb */}
                <div className={cn(
                    "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm",
                    checked ? "translate-x-5" : "translate-x-0"
                )} />
            </div>
            {label && (
                <span className="ml-3 text-sm font-medium text-slate-700">{label}</span>
            )}
        </label>
    );
};

export default Switch;
