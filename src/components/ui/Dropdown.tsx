import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  position?: "top" | "bottom";
  className?: string;
  contentClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = "left",
  position = "bottom",
  className,
  contentClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignments = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  const positions = {
    bottom: "top-full mt-2 origin-top",
    top: "bottom-full mb-2 origin-bottom",
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer font-inherit">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 rounded-md focus:outline-none",
            !contentClassName?.includes("bg-") && "bg-white",
            !contentClassName?.includes("w-") && "w-56",
            !contentClassName?.includes("shadow-") && "shadow-lg",
            !contentClassName?.includes("ring-") && "ring-1 ring-black ring-opacity-5",
            !contentClassName?.includes("p-") && "py-1",
            alignments[align],
            positions[position],
            contentClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  icon,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors",
        className
      )}
      {...props}
    >
      {icon && <span className="mr-3 text-gray-400 group-hover:text-blue-500">{icon}</span>}
      {children}
    </button>
  );
};

export { Dropdown, DropdownItem };
