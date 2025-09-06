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
    Menu,
    X,
    Gift,
    Coffee,
    Home,
    Settings
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
        `flex items-center py-3 px-4 rounded-xl mb-2 w-full overflow-hidden transition-all duration-200 group
        ${isActive
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-[1.02]"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md hover:transform hover:scale-[1.01]"
        }`;

    const mobileNavButtonClass = (isActive) =>
        `flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 min-w-0 flex-1 group
        ${isActive
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md hover:transform hover:scale-105"
        }`;

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
                className={`hidden md:flex bg-white shadow-2xl border-r border-gray-100 p-6 flex-col transition-all duration-300 ease-in-out
                ${collapsed ? "w-20" : "w-72"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    {!collapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                                    {user.role === "superadmin" ? "Администратор" : "Администратор бани"}
                                </h2>
                                <p className="text-sm text-gray-500">Панель управления</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                        ) : (
                            <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                        )}
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="space-y-2 mb-6">
                    {user.role === "superadmin" && (
                        <button
                            onClick={() => handleTabClick("users")}
                            className={navButtonClass(activeTab === "users")}
                        >
                            <User className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            {!collapsed && <span className="font-medium">Пользователи</span>}
                        </button>
                    )}

                    <button
                        onClick={() => handleTabClick("bathhouses")}
                        className={navButtonClass(activeTab === "bathhouses")}
                    >
                        <Building2 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        {!collapsed && <span className="font-medium">Банные комплексы</span>}
                    </button>

                    <button
                        onClick={() => handleTabClick("bookings")}
                        className={navButtonClass(activeTab === "bookings")}
                    >
                        <Calendar className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        {!collapsed && <span className="font-medium">Бронирования</span>}
                    </button>

                    <button
                        onClick={() => handleTabClick("analytics")}
                        className={navButtonClass(activeTab === "analytics")}
                    >
                        <BarChart className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        {!collapsed && <span className="font-medium">Аналитика</span>}
                    </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Current Bathhouse Info */}
                {bathhouse && (
                    <div className={`mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 ${collapsed ? "text-center" : ""}`}>
                        <h3 className="text-sm font-semibold text-blue-600 mb-2 flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            {!collapsed && "Текущий комплекс"}
                        </h3>
                        <p className="text-lg font-bold text-gray-900 truncate">
                            {bathhouse.name}
                        </p>
                        {!collapsed && bathhouse.address && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                                {bathhouse.address}
                            </p>
                        )}
                    </div>
                )}

                {/* Management Section */}
                {bathhouseID && (
                    <div className="space-y-2 mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            {!collapsed && "Управление"}
                        </h3>

                        <button
                            onClick={handleRoomsClick}
                            className={navButtonClass(activeTab === "rooms")}
                        >
                            <DoorClosed className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            {!collapsed && <span className="font-medium">Сауны/Бани</span>}
                        </button>

                        <button
                            onClick={handleMenuClick}
                            className={navButtonClass(activeTab === "menu")}
                        >
                            <Coffee className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            {!collapsed && <span className="font-medium">Сервис и товары</span>}
                        </button>

                        <button
                            onClick={handleBonusSystemClick}
                            className={navButtonClass(activeTab === "bonus-system")}
                        >
                            <Gift className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            {!collapsed && <span className="font-medium">Бонусная система</span>}
                        </button>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 w-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] group"
                >
                    <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    {!collapsed && <span className="font-medium">Выйти</span>}
                </button>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-50">
                <div className="flex items-center justify-between px-3 py-3">
                    {/* Main navigation items */}
                    <div className="flex flex-1 justify-around">
                        {user.role === "superadmin" && (
                            <button
                                onClick={() => handleTabClick("users")}
                                className={mobileNavButtonClass(activeTab === "users")}
                            >
                                <User className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-medium">Пользователи</span>
                            </button>
                        )}

                        <button
                            onClick={() => handleTabClick("bathhouses")}
                            className={mobileNavButtonClass(activeTab === "bathhouses")}
                        >
                            <Building2 className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Комплексы</span>
                        </button>

                        <button
                            onClick={() => handleTabClick("bookings")}
                            className={mobileNavButtonClass(activeTab === "bookings")}
                        >
                            <Calendar className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Бронирования</span>
                        </button>

                        <button
                            onClick={() => handleTabClick("analytics")}
                            className={mobileNavButtonClass(activeTab === "analytics")}
                        >
                            <BarChart className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Аналитика</span>
                        </button>

                        {/* More menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={mobileNavButtonClass(false)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            ) : (
                                <Menu className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="text-xs font-medium">Управление</span>
                        </button>
                    </div>
                </div>

                {/* Mobile expanded menu */}
                {mobileMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl rounded-t-2xl">
                        <div className="p-6 space-y-3">
                            {/* Current Bathhouse Info */}
                            {bathhouse && (
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 mb-4">
                                    <h3 className="text-sm font-semibold text-blue-600 mb-2 flex items-center">
                                        <Building2 className="w-4 h-4 mr-2" />
                                        Текущий комплекс
                                    </h3>
                                    <p className="text-lg font-bold text-gray-900">
                                        {bathhouse.name}
                                    </p>
                                    {bathhouse.address && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {bathhouse.address}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Management Options */}
                            {bathhouseID && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Управление
                                    </h3>

                                    <button
                                        onClick={handleRoomsClick}
                                        className={`flex items-center w-full py-3 px-4 rounded-xl transition-all duration-200 group ${activeTab === "rooms"
                                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-[1.02]"
                                                : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md hover:transform hover:scale-[1.01]"
                                            }`}
                                    >
                                        <DoorClosed className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Сауны/Бани</span>
                                    </button>

                                    <button
                                        onClick={handleMenuClick}
                                        className={`flex items-center w-full py-3 px-4 rounded-xl transition-all duration-200 group ${activeTab === "menu"
                                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-[1.02]"
                                                : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md hover:transform hover:scale-[1.01]"
                                            }`}
                                    >
                                        <Coffee className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Сервис и товары</span>
                                    </button>

                                    <button
                                        onClick={handleBonusSystemClick}
                                        className={`flex items-center w-full py-3 px-4 rounded-xl transition-all duration-200 group ${activeTab === "bonus-system"
                                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-[1.02]"
                                                : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md hover:transform hover:scale-[1.01]"
                                            }`}
                                    >
                                        <Gift className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Бонусная система</span>
                                    </button>
                                </div>
                            )}

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] group mt-4"
                            >
                                <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">Выйти</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}