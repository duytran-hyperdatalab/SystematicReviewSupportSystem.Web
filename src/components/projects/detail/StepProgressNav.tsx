import React from "react";
import { FiCheck, FiLock } from "react-icons/fi";

export type StepStatus = "completed" | "current" | "locked";

export interface WorkflowStep {
    key: string;
    label: string;
    status: StepStatus;
}

interface StepProgressNavProps {
    steps: WorkflowStep[];
    onStepClick: (key: string) => void;
}

const StepProgressNav: React.FC<StepProgressNavProps> = ({
    steps,
    onStepClick,
}) => {
    const completedCount = steps.filter((s) => s.status === "completed").length;
    const progressPercent = Math.round((completedCount / steps.length) * 100);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-between relative">
                {steps.map((step, idx) => {
                    const isCompleted = step.status === "completed";
                    const isCurrent = step.status === "current";
                    const isLocked = step.status === "locked";
                    const isClickable = isCompleted || isCurrent;

                    return (
                        <React.Fragment key={step.key}>
                            {/* Step Node */}
                            <div
                                className="flex flex-col items-center relative z-10"
                                style={{ flex: "0 0 auto" }}
                            >
                                <button
                                    type="button"
                                    onClick={() => isClickable && onStepClick(step.key)}
                                    disabled={isLocked}
                                    className={`
                    w-11 h-11 rounded-full flex items-center justify-center
                    text-sm font-bold transition-all duration-300 border-2
                    ${isCompleted
                                            ? "bg-emerald-500 border-emerald-500 text-white cursor-pointer hover:bg-emerald-600 hover:border-emerald-600 hover:shadow-md"
                                            : isCurrent
                                                ? "bg-white border-brand-500 text-brand-600 cursor-pointer step-current-pulse hover:shadow-md"
                                                : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                        }
                  `}
                                    title={
                                        isLocked
                                            ? "Complete previous steps to unlock"
                                            : isCompleted
                                                ? `Revisit ${step.label}`
                                                : step.label
                                    }
                                >
                                    {isCompleted ? (
                                        <FiCheck className="w-5 h-5" strokeWidth={3} />
                                    ) : isLocked ? (
                                        <FiLock className="w-4 h-4" />
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                </button>

                                {/* Label */}
                                <span
                                    className={`
                    mt-3 text-xs font-semibold text-center whitespace-nowrap tracking-wide
                    ${isCompleted
                                            ? "text-emerald-700"
                                            : isCurrent
                                                ? "text-brand-700"
                                                : "text-gray-400"
                                        }
                  `}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {idx < steps.length - 1 && (
                                <div
                                    className="flex-1 mx-3 relative"
                                    style={{ height: "2px", top: "-10px" }}
                                >
                                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-400" : "bg-gray-200"
                                            }`}
                                        style={{
                                            width: isCompleted ? "100%" : "0%",
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">
                        Preparation Progress
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                        {progressPercent}%
                    </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${progressPercent === 100
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-brand-400 to-brand-600"
                            }`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default StepProgressNav;
