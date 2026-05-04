import React, { useState } from "react";
import { cn } from "../../utils/cn";

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ElementType;
    badge?: string | number;
}

interface TabsProps {
    items: TabItem[];
    activeTabId?: string;
    onTabChange?: (tabId: string) => void;
    className?: string;
    listClassName?: string;
    itemClassName?: string;
    contentClassName?: string;
    children?: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({
    items,
    activeTabId: externalActiveTabId,
    onTabChange,
    className,
    listClassName,
    itemClassName,
    contentClassName,
    children,
}) => {
    const [internalActiveTabId, setInternalActiveTabId] = useState(
        items.length > 0 ? items[0].id : ""
    );

    const activeTabId = externalActiveTabId !== undefined ? externalActiveTabId : internalActiveTabId;

    const handleTabClick = (id: string) => {
        if (externalActiveTabId === undefined) {
            setInternalActiveTabId(id);
        }
        if (onTabChange) {
            onTabChange(id);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <div className={cn(
                "flex items-center gap-1 p-1 bg-slate-100/50 border border-slate-100 rounded-[1.5rem] w-fit no-scrollbar backdrop-blur-sm self-center sm:self-start",
                listClassName
            )}>
                {items.map((item) => {
                    const isActive = activeTabId === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id)}
                            className={cn(
                                "flex items-center gap-2.5 px-6 py-3 rounded-[1.25rem] text-sm font-black transition-all duration-300 whitespace-nowrap relative group",
                                isActive
                                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-100 ring-1 ring-indigo-50 border-transparent"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50 border-transparent",
                                itemClassName
                            )}
                        >
                            {Icon && (
                                <Icon
                                    size={18}
                                    className={cn(
                                        "transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                                    )}
                                />
                            )}
                            {item.label}
                            {item.badge !== undefined && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[10px] font-black min-w-[1.25rem] flex items-center justify-center",
                                    isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                                )}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            <div className={cn("w-full h-full", contentClassName)}>
                {children}
            </div>
        </div>
    );
};

export default Tabs;
