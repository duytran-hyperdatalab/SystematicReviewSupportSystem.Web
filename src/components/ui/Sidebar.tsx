import React from "react";
import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "../../utils/cn";

export interface SidebarItem {
    icon: IconType;
    label: string;
    path: string;
    onClick?: () => void;
}

interface SidebarProps {
    items: SidebarItem[];
    footerItems?: SidebarItem[];
    isCollapsed: boolean;
    onToggle: () => void;
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    items,
    footerItems,
    isCollapsed,
    onToggle,
    className,
}) => {
    const location = useLocation();

    const renderItem = (item: SidebarItem) => {
        const isActive = location.pathname === item.path;
        const commonClasses = cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all group overflow-hidden whitespace-nowrap w-full text-left relative",
            isActive
                ? "bg-indigo-50/80 text-indigo-600 shadow-sm shadow-indigo-100/50"
                : "text-gray-500 hover:bg-slate-50 hover:text-indigo-600"
        );

        const content = (
            <>
                {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full" />
                )}
                <item.icon
                    className={cn(
                        "w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600"
                    )}
                />
                <span
                    className={cn(
                        "font-bold text-sm transition-all duration-300 ease-in-out",
                        isCollapsed ? "opacity-0 invisible -translate-x-4 w-0" : "opacity-100 visible translate-x-0"
                    )}
                >
                    {item.label}
                </span>
            </>
        );

        if (item.onClick) {
            return (
                <button key={item.label} onClick={item.onClick} className={commonClasses}>
                    {content}
                </button>
            );
        }

        return (
            <Link key={item.path} to={item.path} className={commonClasses}>
                {content}
            </Link>
        );
    };

    return (
        <aside
            className={cn(
                "flex flex-col bg-white border-r border-gray-100 transition-all duration-500 ease-in-out relative z-30",
                isCollapsed ? "w-20" : "w-72",
                className
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -right-4 top-8 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all z-40 shadow-lg shadow-slate-200/50 cursor-pointer active:scale-90"
            >
                {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 py-10 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
                {items.map(renderItem)}
            </nav>

            {/* Footer Items */}
            {footerItems && footerItems.length > 0 && (
                <div className="p-4 border-t border-gray-50 space-y-1.5 mb-2">
                    {footerItems.map(renderItem)}
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
