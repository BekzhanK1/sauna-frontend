import { useState, useEffect, use } from "react";
import {
    ChevronLeft,
    ChevronRight,
    User,
    Building2,
    DoorClosed,
    LogOut,
    Calendar,
    BarChart,
    Menu,
    X,
    Gift,
    Coffee
} from "lucide-react";
import api from '../api/axios';
import API_URLS from '../api/config';

export default function Sidebar({ activeTab, setActiveTab, logout, user, bathhouseID, navigate }) {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        return saved === "true";
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [bathhouse, setBathhouse] = useState(null);

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", collapsed);
    }, [collapsed]);

    useEffect(() => {
        const fetchBathhouse = async (bathhouseID) => {
            try {
                const response = await api.get(`${API_URLS.bathhouses}${bathhouseID}`);
                setBathhouse(response.data);
                console.log("Fetched bathhouse:", response.data);
            } catch (error) {
                console.error("Error fetching bathhouse:", error);
            }
        };
        if (bathhouseID) {
            fetchBathhouse(bathhouseID);
        }
    }, [bathhouseID]);

    const navButtonClass = (isActive) =>
        `flex items-center py-2 px-3 rounded-md mb-2 w-full overflow-hidden transition 
        ${isActive ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-100 hover:text-green-600"}`;

    const mobileNavButtonClass = (isActive) =>
        `flex flex-col items-center justify-center py-2 px-3 rounded-md transition min-w-0 flex-1
        ${isActive ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-100 hover:text-green-600"}`;

    const handleTabClick = (tab) => {
        if (bathhouseID) {
            navigate(`/dashboard?tab=${tab}`);
            return;
        }
        setActiveTab(tab);
        setMobileMenuOpen(false); // Close mobile menu after selection
    };

    const handleRoomsClick = () => {
        navigate(`/dashboard/rooms?bathhouse_id=${bathhouseID}`);
        setActiveTab("rooms");
        setMobileMenuOpen(false);
    };

    const handleMenuClick = () => {
        navigate(`/dashboard/menu?bathhouse_id=${bathhouseID}`);
        setActiveTab("menu");
        setMobileMenuOpen(false);
    };

    const handleBonusSystemClick = () => {
        navigate(`/dashboard/bonus-system?bathhouse_id=${bathhouseID}`);
        setActiveTab("bonus-system");
        setMobileMenuOpen(false);
    }

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={`hidden md:flex bg-white shadow-lg p-4 flex-col transition-all duration-300 ease-in-out
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
                        onClick={() => handleTabClick("users")}
                        className={navButtonClass(activeTab === "users")}
                    >
                        <User className="w-5 h-5 mr-2" />
                        {!collapsed && "Пользователи"}
                    </button>
                )}

                <button
                    onClick={() => handleTabClick("bathhouses")}
                    className={navButtonClass(activeTab === "bathhouses")}
                >
                    <Building2 className="w-5 h-5 mr-2" />
                    {!collapsed && "Банные комплексы"}
                </button>

                <button
                    onClick={() => handleTabClick("bookings")}
                    className={navButtonClass(activeTab === "bookings")}
                >
                    <Calendar className="w-5 h-5 mr-2" />
                    {!collapsed && "Бронирования"}
                </button>

                <button
                    onClick={() => handleTabClick("analytics")}
                    className={navButtonClass(activeTab === "analytics")}
                >
                    <BarChart className="w-5 h-5 mr-2" />
                    {!collapsed && "Аналитика"}
                </button>

                <div className="border-t my-4"></div>

                {bathhouse && (
                    <div className={`mb-4 ${collapsed ? "text-center" : ""}`}>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Текущий комплекс:</h3>
                        <p className="text-lg font-bold text-gray-900 truncate">
                            {bathhouse.name}
                        </p>
                    </div>
                )}

                {bathhouseID && (
                    <button
                        onClick={handleRoomsClick}
                        className={navButtonClass(activeTab === "rooms")}
                    >
                        <DoorClosed className="w-5 h-5 mr-2" />
                        {!collapsed && "Сауны/Бани"}
                    </button>
                )}

                {bathhouseID && (
                    <button
                        onClick={handleMenuClick}
                        className={navButtonClass(activeTab === "menu")}
                    >
                        <Coffee className="w-5 h-5 mr-2" />
                        {!collapsed && "Сервис и товары"}
                    </button>
                )}

                {bathhouseID && (
                    <button
                        onClick={handleBonusSystemClick}
                        className={navButtonClass(activeTab === "bonus-system")}
                    >
                        <Gift className="w-5 h-5 mr-2" />
                        {!collapsed && "Бонусная система"}
                    </button>
                )}

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 transition w-full"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    {!collapsed && "Выйти"}
                </button>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-50">
                <div className="flex items-center justify-between px-2 py-2">
                    {/* Main navigation items */}
                    <div className="flex flex-1 justify-around">
                        {user.role === "superadmin" && (
                            <button
                                onClick={() => handleTabClick("users")}
                                className={mobileNavButtonClass(activeTab === "users")}
                            >
                                <User className="w-5 h-5 mb-1" />
                                <span className="text-xs">Пользователи</span>
                            </button>
                        )}

                        <button
                            onClick={() => handleTabClick("bathhouses")}
                            className={mobileNavButtonClass(activeTab === "bathhouses")}
                        >
                            <Building2 className="w-5 h-5 mb-1" />
                            <span className="text-xs">Комплексы</span>
                        </button>

                        <button
                            onClick={() => handleTabClick("bookings")}
                            className={mobileNavButtonClass(activeTab === "bookings")}
                        >
                            <Calendar className="w-5 h-5 mb-1" />
                            <span className="text-xs">Бронирования</span>
                        </button>

                        <button
                            onClick={() => handleTabClick("analytics")}
                            className={mobileNavButtonClass(activeTab === "analytics")}
                        >
                            <BarChart className="w-5 h-5 mb-1" />
                            <span className="text-xs">Аналитика</span>
                        </button>

                        {/* More menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={mobileNavButtonClass(false)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 mb-1" />
                            ) : (
                                <Menu className="w-5 h-5 mb-1" />
                            )}
                            <span className="text-xs">Управление</span>
                        </button>
                    </div>
                </div>

                {/* Mobile expanded menu */}
                {mobileMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg">
                        <div className="p-4 space-y-2">
                            {bathhouseID && (
                                <>
                                    <button
                                        onClick={handleRoomsClick}
                                        className={`flex items-center w-full py-2 px-3 rounded-md transition ${activeTab === "rooms"
                                            ? "bg-green-500 text-white"
                                            : "text-gray-700 hover:bg-green-100 hover:text-green-600"
                                            }`}
                                    >
                                        <DoorClosed className="w-5 h-5 mr-2" />
                                        Сауны/Бани
                                    </button>
                                    <button
                                        onClick={handleMenuClick}
                                        className={`flex items-center w-full py-2 px-3 rounded-md transition ${activeTab === "menu"
                                            ? "bg-green-500 text-white"
                                            : "text-gray-700 hover:bg-green-100 hover:text-green-600"
                                            }`}
                                    >
                                        <DoorClosed className="w-5 h-5 mr-2" />
                                        Сервис и товары
                                    </button>
                                    <button
                                        onClick={handleBonusSystemClick}
                                        className={`flex items-center w-full py-2 px-3 rounded-md transition ${activeTab === "bonus-system"
                                            ? "bg-green-500 text-white"
                                            : "text-gray-700 hover:bg-green-100 hover:text-green-600"
                                            }`}
                                    >
                                        <Gift className="w-5 h-5 mr-2" />
                                        Бонусная система
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 transition"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Выйти
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}