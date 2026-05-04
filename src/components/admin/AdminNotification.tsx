import React, { useState, useRef, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useUnreadCount } from "../../hooks/useNotifications";
import NotificationDropdown from "../layout/NotificationDropdown";

const AdminNotification: React.FC = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const { unreadCount } = useUnreadCount();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {showNotifications && (
                <NotificationDropdown disableNavigation={true} />
            )}
        </div>
    );
};

export default AdminNotification;
