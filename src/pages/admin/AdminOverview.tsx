import React, { useMemo } from "react";
import { FiGrid } from "react-icons/fi";
import { cn } from "../../utils/cn";
import { useUsers } from "../../hooks/useUsers";
import { useProjects } from "../../hooks/useProjects";

const AdminOverview: React.FC = () => {
    const { data: usersData, isLoading: isUsersLoading } = useUsers({ pageNumber: 1, pageSize: 1 });
    const { data: projectsData, isLoading: isProjectsLoading } = useProjects({ pageNumber: 1, pageSize: 1 });

    const stats = useMemo(() => {
        const totalUsers = usersData?.totalCount || 0;
        const totalProjects = projectsData?.totalCount || 0;
        
        return [
            { 
                label: "Total Users", 
                value: isUsersLoading ? "..." : totalUsers.toLocaleString(), 
                change: "Total", 
                color: "indigo" 
            },
            { 
                label: "Active Projects", 
                value: isProjectsLoading ? "..." : totalProjects.toLocaleString(), 
                change: "Active", 
                color: "emerald" 
            },
            // { label: "System Uptime", value: "99.9%", change: "Stable", color: "blue" },
            // { label: "Pending Tickets", value: "0", change: "-0", color: "rose" },
        ];
    }, [usersData, projectsData, isUsersLoading, isProjectsLoading]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Welcome */}
            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, Admin 👋</h3>
                <p className="text-gray-500 text-sm">Here's what happening with your system today.</p>
            </div>

            {/* Grid for Placeholder Stats <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-default">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 group-hover:text-indigo-400 transition-colors">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-black text-gray-900">{stat.value}</span>
                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded-lg",
                                stat.change.startsWith("+") || stat.change === "Active" || stat.change === "Stable" || stat.change === "Total" 
                                    ? "bg-emerald-50 text-emerald-600" 
                                    : "bg-slate-50 text-slate-600"
                            )}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Placeholder Area */}
            <div className="bg-white rounded-3xl border border-dashed border-gray-300 min-h-[400px] flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-center z-10">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <FiGrid size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700 mb-1">Content Area</h4>
                    <p className="text-gray-400 text-sm max-w-[240px] mx-auto">This area is ready for your dynamic management components and tables.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
