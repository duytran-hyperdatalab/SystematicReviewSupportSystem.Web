import { forwardRef } from "react";
import type { IconType } from "react-icons";

interface PrismaStepProps {
  icon: IconType;
  label: string;
  description?: string;
  isActive?: boolean;
}

const PrismaStep = forwardRef<HTMLDivElement, PrismaStepProps>(
  ({ icon: Icon, label, description, isActive = false }, ref) => {
    return (
      <div 
        ref={ref}
        className={`flex flex-col items-center text-center p-4 transition-all duration-500 opacity-0`}
        data-prisma-step
      >
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mb-4 
          ${isActive ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-400 border border-gray-100 shadow-sm"}
          group-hover:scale-110 transition-transform duration-300
        `}>
          <Icon className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
          {label}
        </h4>
        {description && (
          <p className="text-[11px] font-medium text-gray-500 max-w-[120px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  }
);

PrismaStep.displayName = "PrismaStep";

export default PrismaStep;
