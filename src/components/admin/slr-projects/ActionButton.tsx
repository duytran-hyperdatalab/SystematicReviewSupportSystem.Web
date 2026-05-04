import React from "react";
import type { IconType } from "react-icons";
import { cn } from "../../../utils/cn";
import Tooltip from "../../ui/Tooltip";

export interface ActionButtonProps {
    icon: IconType;
    label: string;
    variant?: "normal" | "destructive";
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    icon: Icon,
    label,
    variant = "normal",
    onClick,
    className,
    disabled = false
}) => {
    return (
        <Tooltip content={label} position="bottom">
            <button
                onClick={onClick}
                disabled={disabled}
                className={cn(
                    "p-2 rounded-lg transition-all active:scale-90",
                    variant === "destructive"
                        ? "text-rose-500 hover:bg-rose-50"
                        : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none transform-none",
                    className
                )}
                aria-label={label}
            >
                <Icon size={18} />
            </button>
        </Tooltip>
    );
};

export default ActionButton;
