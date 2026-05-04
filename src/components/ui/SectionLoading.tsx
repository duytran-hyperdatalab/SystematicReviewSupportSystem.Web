import React from "react";
import { FiShield, FiHome } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";

interface SectionLoadingProps {
    type: "admin" | "client";
    title?: string;
    subtitle?: string;
}

const SectionLoading: React.FC<SectionLoadingProps> = ({ type, title, subtitle }) => {
    const isAdmin = type === "admin";
    const Icon = isAdmin ? FiShield : FiHome;

    return (
        <div className="fixed inset-0 bg-white z-[var(--z-index-section-loading)] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                    <Icon className="w-10 h-10 text-indigo-600" />
                </div>
                <LoadingSpinner size="lg" className="absolute inset-0 scale-[2] text-indigo-600" />
            </div>
            <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {title || (isAdmin ? "Initializing Admin Console" : "Loading Client Portal")}
                </h3>
                <p className="text-gray-500 text-sm max-w-[280px] mx-auto animate-pulse">
                    {subtitle || (isAdmin ? "Setting up your management workspace..." : "Preparing your systematic review environment...")}
                </p>
            </div>
        </div>
    );
};

export default SectionLoading;
