import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    User,
    Building2,
    DoorClosed,
    LogOut,
    Calendar,
    BarChart,
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, logout, user, bathhouseID, navigate }) {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        return saved === "true";
    });

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", collapsed);
    }, [collapsed]);

    const navButtonClass = (isActive) =>
        `flex items-center py-2 px-3 rounded-md mb-2 w-full overflow-hidden transition 
        ${isActive ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-100 hover:text-green-600"}`;

    return (
        <div
            className={`bg-white shadow-lg p-4 flex flex-col transition-all duration-300 ease-in-out
      ${collapsed ? "w-20" : "w-64"}`}
        >
            <div className="flex items-center justify-between mb-6">
                {!collapsed && (
                    <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                        {user.role === "superadmin" ? "Администратор" : "Администратор бани"}
                    </h2>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto p-1 rounded hover:bg-gray-200 transition"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {user.role === "superadmin" && (
                <button
                    onClick={() => {
                        if (bathhouseID) {
                            navigate(`/dashboard?tab=users`);
                            return;
                        }
                        setActiveTab("users");
                    }}
                    className={navButtonClass(activeTab === "users")}
                >
                    <User className="w-5 h-5 mr-2" />
                    {!collapsed && "Пользователи"}
                </button>
            )}

            <button
                onClick={() => {
                    if (bathhouseID) {
                        navigate(`/dashboard?tab=bathhouses`);
                        return;
                    }
                    setActiveTab("bathhouses");
                }}
                className={navButtonClass(activeTab === "bathhouses")}
            >
                <Building2 className="w-5 h-5 mr-2" />
                {!collapsed && "Банные комплексы"}
            </button>

            <button
                onClick={() => {
                    if (bathhouseID) {
                        navigate(`/dashboard?tab=bookings`);
                        return;
                    }
                    setActiveTab("bookings");
                }}
                className={navButtonClass(activeTab === "bookings")}
            >
                <Calendar className="w-5 h-5 mr-2" />
                {!collapsed && "Бронирования"}
            </button>

            <button
                onClick={() => {
                    if (bathhouseID) {
                        navigate(`/dashboard?tab=analytics`);
                        return;
                    }
                    setActiveTab("analytics");
                }}
                className={navButtonClass(activeTab === "analytics")}
            >
                <BarChart className="w-5 h-5 mr-2" />
                {!collapsed && "Аналитика"}
            </button>

            {bathhouseID && (
                <button
                    onClick={() => {
                        navigate(`/dashboard/rooms?bathhouse_id=${bathhouseID}`);
                        setActiveTab("rooms");
                    }}
                    className={navButtonClass(activeTab === "rooms")}
                >
                    <DoorClosed className="w-5 h-5 mr-2" />
                    {!collapsed && "Сауны/Бани"}
                </button>
            )}

            {bathhouseID && (
                <button
                    onClick={() => {
                        navigate(`/dashboard/menu?bathhouse_id=${bathhouseID}`);
                        setActiveTab("menu");
                    }}
                    className={navButtonClass(activeTab === "menu")}
                >
                    <DoorClosed className="w-5 h-5 mr-2" />
                    {!collapsed && "Сервис и товары"}
                </button>
            )}

            <button
                onClick={logout}
                className="mt-auto flex items-center bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 transition w-full"
            >
                <LogOut className="w-5 h-5 mr-2" />
                {!collapsed && "Выйти"}
            </button>
        </div>
    );
}
