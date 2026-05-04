import React from "react";
import { FiCheck, FiAlertCircle, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import Card from "../../ui/Card";

interface ChecklistItem {
    label: string;
    completed: boolean;
    required?: boolean;
}

interface ActivateProjectStepProps {
    projectId: string;
    isActive: boolean;
    checklist: ChecklistItem[];
    onActivate: () => Promise<void>;
    isActivating: boolean;
}

const ActivateProjectStep: React.FC<ActivateProjectStepProps> = ({
    projectId,
    isActive,
    checklist,
    onActivate,
    isActivating,
}) => {
    const navigate = useNavigate();
    const allReady = checklist
        .filter((item) => item.required !== false)
        .every((item) => item.completed);

    // ── Post-activation state ────────────────────────────────────────────────
    if (isActive) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FiCheck className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Project Setup Complete
                </h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Your project is now active. You can invite reviewers and create review
                    processes from the Project Overview.
                </p>
                <Button
                    onClick={() => navigate(`/projects/${projectId}`)}
                    className="gap-2"
                >
                    Go to Project Overview
                </Button>
            </div>
        );
    }

    // ── Pre-activation state ─────────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
                    <FiZap className="w-8 h-8 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Activate Your Project
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Review the checklist below and activate your project when ready.
                    Once activated, you'll be able to invite reviewers and create review
                    processes.
                </p>
            </div>

            {/* Readiness Checklist */}
            <Card className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    Readiness Checklist
                </h3>
                <ul className="space-y-3">
                    {checklist.map((item, idx) => (
                        <li
                            key={idx}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${item.completed
                                    ? "bg-emerald-50 border border-emerald-100"
                                    : item.required !== false
                                        ? "bg-amber-50 border border-amber-100"
                                        : "bg-slate-50 border border-slate-100 opacity-80"
                                }`}
                        >
                            {item.completed ? (
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <FiCheck className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                            ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${item.required !== false ? "bg-amber-400" : "bg-slate-300"
                                    }`}>
                                    <FiAlertCircle className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                            )}
                            <div className="flex-1">
                                <span
                                    className={`text-sm font-semibold block ${item.completed ? "text-emerald-900" : "text-slate-900"
                                        }`}
                                >
                                    {item.label}
                                </span>
                                {item.required === false && !item.completed && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                        Optional
                                    </span>
                                )}
                                {item.required !== false && !item.completed && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500">
                                        Required
                                    </span>
                                )}
                            </div>
                            {item.completed && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
                                    Completed
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </Card>

            {/* Activate Button */}
            <div className="text-center">
                {allReady ? (
                    <Button
                        size="lg"
                        onClick={onActivate}
                        disabled={isActivating}
                        className="gap-2 px-10"
                    >
                        <FiZap className="w-5 h-5" />
                        {isActivating ? "Activating..." : "Activate Project"}
                    </Button>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
                        <p className="text-sm text-gray-500">
                            Complete all checklist items above to activate your project.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivateProjectStep;
