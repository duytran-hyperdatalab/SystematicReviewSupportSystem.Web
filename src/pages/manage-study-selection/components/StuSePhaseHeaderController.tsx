import React from 'react';
import { type LucideIcon, FileText, LayoutList, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useNavigate, useParams } from 'react-router-dom';

export type SelectionPhase = 'TITLE_ABSTRACT' | 'FULL_TEXT';

interface PhaseItem {
    id: SelectionPhase;
    label: string;
    icon: LucideIcon;
    description: string;
}

const PHASES: PhaseItem[] = [
    {
        id: 'TITLE_ABSTRACT',
        label: 'Title & Abstract Screening',
        icon: LayoutList,
        description: 'Initial screening based on basic information'
    },
    {
        id: 'FULL_TEXT',
        label: 'Full-Text Screening',
        icon: FileText,
        description: 'Detailed analysis of selected papers'
    }
];

interface StuSePhaseHeaderControllerProps {
    currentPhase: SelectionPhase;
    onPhaseChange: (phase: SelectionPhase) => void;
}

export const StuSePhaseHeaderController: React.FC<StuSePhaseHeaderControllerProps> = ({
    currentPhase,
    onPhaseChange
}) => {
    const navigate = useNavigate();
    const { projectId, processId } = useParams<{ projectId: string; processId: string }>();

    const handleBack = () => {
        navigate(`/projects/${projectId}/processes/${processId}`);
    };

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-3 grid grid-cols-3 items-center">
            <div className="flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
                    title="Back to Process Workspace"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <LayoutList className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-none mb-1">Study Selection</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manage Phase Progress</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-self-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {PHASES.map((phase, index) => {
                    const isActive = currentPhase === phase.id;
                    const Icon = phase.icon;

                    return (
                        <React.Fragment key={phase.id}>
                            <button
                                onClick={() => onPhaseChange(phase.id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                )}
                            >
                                <Icon className={cn(
                                    "w-4 h-4 transition-transform duration-200",
                                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:scale-110"
                                )} />
                                <div className="text-left">
                                    <div className="text-sm font-bold leading-none">{phase.label}</div>
                                </div>
                                {isActive && (
                                    <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
                                )}
                            </button>
                            {index < PHASES.length - 1 && (
                                <div className="px-1 text-slate-300">
                                    <ChevronRight size={16} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="justify-self-end" />
        </div>
    );
};
