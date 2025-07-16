import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import API_URLS from "../api/config";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
dayjs.locale("ru");

export default function Analytics() {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [bathhouses, setBathhouses] = useState([]);
    const [selectedBathhouse, setSelectedBathhouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("day");
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [showAll, setShowAll] = useState(true);
    const [showBookingList, setShowBookingList] = useState(false);

    useEffect(() => {
        fetchBathhouses();
        fetchBookings();
    }, []);

    const fetchBathhouses = async () => {
        try {
            const res = await api.get(API_URLS.bathhouses);
            setBathhouses(res.data);
        } catch (err) {
            toast.error("Не удалось загрузить сауны");
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get(API_URLS.bookings);
            setBookings(res.data);
            setSelectedBookings(res.data.map(b => b.id));
        } catch (err) {
            toast.error("Не удалось загрузить данные");
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const bDate = dayjs(b.start_time);
        let matchBathhouse = true;
        let matchDate = true;
        let matchPeriod = true;

        if (selectedBathhouse) {
            matchBathhouse = b.bathhouse?.id === selectedBathhouse.id;
        }

        if (selectedDate) {
            matchDate = bDate.isSame(dayjs(selectedDate), "day");
        }

        if (!selectedDate) {
            const now = dayjs();
            if (period === "day") matchPeriod = bDate.isSame(now, "day");
            else if (period === "week") matchPeriod = bDate.isSame(now, "week");
            else if (period === "month") matchPeriod = bDate.isSame(now, "month");
            else if (period === "year") matchPeriod = bDate.isSame(now, "year");
        }

        return matchBathhouse && (selectedDate ? matchDate : matchPeriod);
    });

    const periodBookings = showAll ? filteredBookings : filteredBookings.filter(b => selectedBookings.includes(b.id));

    const totalRevenue = periodBookings.reduce((sum, b) => sum + parseInt(b.final_price || 0), 0);
    const totalHours = periodBookings.reduce((sum, b) => sum + (b.hours || 0), 0);

    const roomData = {};
    periodBookings.forEach(b => {
        const roomName = `Комн. #${b.room?.room_number || "N/A"}`;
        roomData[roomName] = (roomData[roomName] || 0) + 1;
    });

    const barChartData = {
        labels: Object.keys(roomData),
        datasets: [
            {
                label: "Количество бронирований",
                data: Object.values(roomData),
                backgroundColor: "rgba(59, 130, 246, 0.6)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
            },
        ],
    };

    const pieChartData = {
        labels: Object.keys(roomData),
        datasets: [
            {
                label: "Распределение по комнатам",
                data: Object.values(roomData),
                backgroundColor: [
                    "rgba(59, 130, 246, 0.7)",
                    "rgba(16, 185, 129, 0.7)",
                    "rgba(234, 179, 8, 0.7)",
                    "rgba(239, 68, 68, 0.7)",
                    "rgba(99, 102, 241, 0.7)",
                    "rgba(236, 72, 153, 0.7)",
                ],
                borderColor: "white",
                borderWidth: 2,
            },
        ],
    };

    const handleBookingSelection = (id) => {
        setSelectedBookings(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedBookings(filteredBookings.map(b => b.id));
    };

    const handleDeselectAll = () => {
        setSelectedBookings([]);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Аналитика бронирований</h2>

            {/* Select Bathhouse */}
            <div className="bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Выберите сауну</label>
                <select
                    value={selectedBathhouse?.id || ""}
                    onChange={(e) => {
                        const selected = bathhouses.find(b => b.id === parseInt(e.target.value));
                        setSelectedBathhouse(selected || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Все сауны</option>
                    {bathhouses.map(bh => (
                        <option key={bh.id} value={bh.id}>{bh.name}</option>
                    ))}
                </select>
            </div>

            {/* Select Date */}
            <div className="bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Выберите дату</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    onClick={() => setSelectedDate("")}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-blue-500 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition"
                >
                    Сбросить дату
                </button>
            </div>

            {/* Period Buttons */}
            {!selectedDate && (
                <div className="flex gap-2">
                    {["day", "week", "month", "year"].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 rounded border transition ${period === p ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {p === "day" ? "День" : p === "week" ? "Неделя" : p === "month" ? "Месяц" : "Год"}
                        </button>
                    ))}
                </div>
            )}

            {/* Booking selection */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-3">Выбор бронирований для анализа</h3>
                <div className="flex gap-4 items-center">
                    <label className="flex items-center">
                        <input type="radio" name="bookingMode" checked={showAll} onChange={() => setShowAll(true)} className="mr-2" />
                        Все бронирования
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name="bookingMode" checked={!showAll} onChange={() => setShowAll(false)} className="mr-2" />
                        Выбранные бронирования
                    </label>
                    <button
                        onClick={() => setShowBookingList(!showBookingList)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        {showBookingList ? "Скрыть список" : "Показать список"}
                    </button>
                </div>
            </div>

            {showBookingList && !showAll && (
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">Список бронирований ({filteredBookings.length})</h4>
                        <div className="flex gap-2">
                            <button onClick={handleSelectAll} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">Выбрать все</button>
                            <button onClick={handleDeselectAll} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm">Снять все</button>
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredBookings.map(b => (
                            <div key={b.id} className="flex items-center p-2 hover:bg-gray-50 border-b">
                                <input type="checkbox" checked={selectedBookings.includes(b.id)} onChange={() => handleBookingSelection(b.id)} className="mr-3" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        Комн. #{b.room?.room_number || "N/A"} - {b.customer_name || b.name || "N/A"}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {dayjs(b.start_time).format("DD.MM.YYYY HH:mm")} - {b.hours}ч - {parseInt(b.final_price || 0).toLocaleString("ru-RU")} ₸
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{periodBookings.length}</div>
                            <div className="text-sm text-blue-800">Бронирований</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{totalHours}</div>
                            <div className="text-sm text-green-800">Часов</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{totalRevenue.toLocaleString("ru-RU")} ₸</div>
                            <div className="text-sm text-purple-800">Выручка</div>
                        </div>
                    </div>

                    {Object.keys(roomData).length > 0 ? (
                        <>
                            <div className="bg-white rounded-lg shadow p-6 mt-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Распределение по комнатам (Bar Chart)</h4>
                                <div className="relative h-[300px]">
                                    <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 mt-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Распределение по комнатам (Pie Chart)</h4>
                                <div className="relative h-[300px]">
                                    <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6 mt-4 text-center">
                            <div className="text-gray-500">Нет данных для отображения графиков</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
