import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import API_URLS from "../api/config";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import 'dayjs/locale/ru';
dayjs.locale('ru');


export default function BookingList() {
    const { user } = useContext(AuthContext);
    const [bathhouses, setBathhouses] = useState([]);
    const [selectedBathhouse, setSelectedBathhouse] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingBathhouses, setLoadingBathhouses] = useState(true);
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [viewMode, setViewMode] = useState("table");
    const [currentTime, setCurrentTime] = useState(dayjs());

    const slotHeight = 48; // 48px per hour
    const headerHeight = 48;

    useEffect(() => {
        fetchBathhouses();
    }, []);

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const fetchBathhouses = async () => {
        try {
            setLoadingBathhouses(true);
            const res = await api.get(API_URLS.bathhouses);
            setBathhouses(res.data);

            if (user?.role === "bath_admin" && res.data.length > 0) {
                setSelectedBathhouse(res.data[0]);
                fetchBookings(res.data[0].id);
            }
        } catch (err) {
            toast.error("Не удалось загрузить сауны");
        } finally {
            setLoadingBathhouses(false);
        }
    };

    const fetchBookings = async (bathhouseId) => {
        try {
            setLoading(true);
            const res = await api.get(`${API_URLS.bookings}?bathhouse_id=${bathhouseId}`);
            setBookings(res.data);
        } catch (err) {
            toast.error("Не удалось загрузить бронирования");
        } finally {
            setLoading(false);
        }
    };

    const handleBathhouseChange = (bathhouse) => {
        setSelectedBathhouse(bathhouse);
        if (bathhouse) {
            fetchBookings(bathhouse.id);
        } else {
            setBookings([]);
        }
    };

    const bookingsForCurrentDate = bookings.filter((b) =>
        dayjs(b.start_time).isSame(currentDate, "day")
    );

    const goToPreviousDay = () => setCurrentDate(currentDate.subtract(1, "day"));
    const goToNextDay = () => setCurrentDate(currentDate.add(1, "day"));
    const goToToday = () => setCurrentDate(dayjs());

    const formatDateHeader = () => {
        const today = dayjs();
        let label = currentDate.format("DD MMMM YYYY");
        if (currentDate.isSame(today, 'day')) label += " (Сегодня)";
        else if (currentDate.isSame(today.add(1, 'day'), 'day')) label += " (Завтра)";
        else if (currentDate.isSame(today.subtract(1, 'day'), 'day')) label += " (Вчера)";
        return label;
    };

    const generateTimeSlots = () => {
        if (!selectedBathhouse) return [];

        const slots = [];
        const startTime = dayjs(`2000-01-01 ${selectedBathhouse.start_of_work}`);
        const endTime = dayjs(`2000-01-01 ${selectedBathhouse.end_of_work}`);

        // Calculate if it's an overnight schedule
        const isOvernight = endTime.isBefore(startTime) || endTime.isSame(startTime);

        let currentSlot = startTime;
        let slotIndex = 0;

        while (true) {
            const hour = currentSlot.hour();
            const displayHour = hour;

            slots.push({
                time: `${displayHour.toString().padStart(2, '0')}:00`,
                hour: hour,
                slotIndex: slotIndex
            });

            currentSlot = currentSlot.add(1, 'hour');
            slotIndex++;

            // Stop condition
            if (isOvernight) {
                // For overnight: stop when we reach end time on next day
                if (currentSlot.hour() === endTime.hour() && slotIndex > 1) {
                    break;
                }
                // Safety check to prevent infinite loop
                if (slotIndex >= 24) break;
            } else {
                // For regular schedule: stop when we reach end time
                if (currentSlot.hour() === endTime.hour()) {
                    break;
                }
                // Safety check
                if (slotIndex >= 24) break;
            }
        }

        return slots;
    };

    const getCurrentTimeLinePosition = () => {
        if (!selectedBathhouse) return null;

        const now = currentTime;
        const currentHour = now.hour();
        const currentMinutes = now.minute();

        // Only show the line if we're viewing today
        if (!currentDate.isSame(dayjs(), 'day')) {
            return null;
        }

        const startTime = dayjs(`2000-01-01 ${selectedBathhouse.start_of_work}`);
        const endTime = dayjs(`2000-01-01 ${selectedBathhouse.end_of_work}`);
        const isOvernight = endTime.isBefore(startTime) || endTime.isSame(startTime);

        let isWithinWorkingHours = false;
        let slotPosition = 0;

        if (isOvernight) {
            // For overnight schedule (e.g., 22:00 - 06:00)
            if (currentHour >= startTime.hour() || currentHour < endTime.hour()) {
                isWithinWorkingHours = true;
                if (currentHour >= startTime.hour()) {
                    // Same day (e.g., 22:00, 23:00)
                    slotPosition = currentHour - startTime.hour();
                } else {
                    // Next day (e.g., 00:00, 01:00, 02:00)
                    slotPosition = (24 - startTime.hour()) + currentHour;
                }
            }
        } else {
            // For regular schedule (e.g., 10:00 - 18:00)
            if (currentHour >= startTime.hour() && currentHour < endTime.hour()) {
                isWithinWorkingHours = true;
                slotPosition = currentHour - startTime.hour();
            }
        }

        if (!isWithinWorkingHours) {
            return null;
        }

        const topOffset = (slotPosition * slotHeight) + (currentMinutes / 60) * slotHeight;
        return topOffset;
    };

    const timeSlots = generateTimeSlots();
    const rooms = selectedBathhouse ? selectedBathhouse.rooms || [] : [];

    if (loadingBathhouses) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Бронирования</h2>

            <div className="bg-white rounded-lg shadow p-6 border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Выберите сауну</label>
                <select
                    value={selectedBathhouse?.id || ""}
                    onChange={(e) => {
                        const bathhouse = bathhouses.find(b => b.id === parseInt(e.target.value));
                        handleBathhouseChange(bathhouse);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Выберите сауну</option>
                    {bathhouses.map((bathhouse) => (
                        <option key={bathhouse.id} value={bathhouse.id}>{bathhouse.name}</option>
                    ))}
                </select>
            </div>

            {selectedBathhouse && (
                <>
                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border">
                        <button
                            onClick={goToPreviousDay}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md bg-white hover:bg-blue-50 hover:text-blue-600 hover:scale-105 active:bg-blue-100 active:scale-95 transition-all duration-200"
                        >
                            ← Предыдущий
                        </button>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">{formatDateHeader()}</h3>
                            <button
                                onClick={goToToday}
                                className="mt-2 inline-flex items-center px-3 py-1 border border-blue-500 text-blue-600 font-medium rounded-md hover:bg-green-50 hover:text-green-600 hover:scale-105 active:bg-green-100 active:scale-95 transition-all duration-200"
                            >
                                Сегодня
                            </button>


                        </div>
                        <button
                            onClick={goToNextDay}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md bg-white hover:bg-blue-50 hover:text-blue-600 hover:scale-105 active:bg-blue-100 active:scale-95 transition-all duration-200"
                        >
                            Следующий →
                        </button>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setViewMode("timetable")}
                            className={`px-3 py-1 rounded border transition-transform duration-200 ${viewMode === "timetable" ? "bg-blue-600 text-white scale-105" : "bg-white text-gray-700 hover:scale-102"
                                }`}
                        >
                            Таблица времени
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`px-3 py-1 rounded border transition-transform duration-200 ${viewMode === "table" ? "bg-blue-600 text-white scale-105" : "bg-white text-gray-700 hover:scale-102"
                                }`}
                        >
                            Классическая таблица
                        </button>

                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        // await fetchBookings(selectedBathhouse.id);
                                        toast.success("Добавление бронирования");
                                    } catch (err) {
                                        toast.error("Не удалось добавить бронирование");
                                    }
                                }}
                                className="px-3 py-1 border rounded text-sm text-gray-700 bg-white hover:bg-blue-50 transition"
                                disabled={loading}
                            >
                                ➕ Добавить бронирование
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await fetchBookings(selectedBathhouse.id);
                                        toast.success("Список бронирований обновлен");
                                    } catch (err) {
                                        toast.error("Не удалось обновить список бронирований");
                                    }
                                }}
                                className="ml-auto px-3 py-1 border rounded text-sm text-gray-700 bg-white hover:bg-blue-50 transition"
                                disabled={loading}
                            >
                                🔄 Обновить
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {viewMode === "timetable" ? (
                                <div className="relative border rounded overflow-hidden bg-white shadow mt-4">
                                    <div className="flex">
                                        {/* Fixed time column */}
                                        <div className="w-20 border-r bg-gray-50 flex-shrink-0 sticky left-0 z-10">
                                            <div className="border-b text-xs text-gray-500 flex items-center justify-end pr-2" style={{ height: `${slotHeight}px` }}>Время</div>
                                            {timeSlots.map(slot => (
                                                <div key={slot.time} className="border-b text-xs text-gray-500 flex items-center justify-end pr-2" style={{ height: `${slotHeight}px` }}>{slot.time}</div>
                                            ))}
                                        </div>

                                        {/* Scrollable rooms container */}
                                        <div className="flex-1 overflow-x-auto">
                                            <div className="flex relative" style={{ minWidth: `${rooms.length * 200}px` }}>
                                                {rooms.map(room => (
                                                    <div key={room.id} className="w-48 border-r relative flex-shrink-0">
                                                        <div className="text-center p-2 border-b bg-gray-50" style={{ height: `${headerHeight}px` }}>
                                                            <div className="font-medium">{room.is_sauna ? "Сауна" : room.is_bathhouse ? "Баня" : "Комната"} #{room.room_number}</div>
                                                            <div className="text-xs text-gray-500">{room.capacity} чел.</div>
                                                        </div>
                                                        <div className="relative" style={{ height: `${timeSlots.length * slotHeight}px` }}>
                                                            {bookingsForCurrentDate
                                                                .filter(b => b.room.id === room.id)
                                                                .map(booking => {
                                                                    const start = dayjs(booking.start_time);
                                                                    const startHour = start.hour();
                                                                    const startMinutes = start.minute();

                                                                    // Calculate position based on bathhouse working hours
                                                                    const bathhouseStart = dayjs(`2000-01-01 ${selectedBathhouse.start_of_work}`);
                                                                    const bathhouseEnd = dayjs(`2000-01-01 ${selectedBathhouse.end_of_work}`);
                                                                    const isOvernight = bathhouseEnd.isBefore(bathhouseStart) || bathhouseEnd.isSame(bathhouseStart);

                                                                    let slotPosition = 0;
                                                                    if (isOvernight) {
                                                                        if (startHour >= bathhouseStart.hour()) {
                                                                            slotPosition = startHour - bathhouseStart.hour();
                                                                        } else {
                                                                            slotPosition = (24 - bathhouseStart.hour()) + startHour;
                                                                        }
                                                                    } else {
                                                                        slotPosition = startHour - bathhouseStart.hour();
                                                                    }

                                                                    const topOffset = (slotPosition * slotHeight) + (startMinutes / 60) * slotHeight;
                                                                    const height = booking.hours * slotHeight;

                                                                    return (
                                                                        <div
                                                                            key={booking.id}
                                                                            className="absolute left-1 right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded shadow-md p-2 text-xs cursor-pointer hover:scale-[1.02] transition"
                                                                            style={{ top: `${topOffset}px`, height: `${height}px` }}
                                                                            onClick={() => setSelectedBooking(booking)}
                                                                        >
                                                                            <div className="font-semibold truncate">{booking.name}</div>
                                                                            <div className="truncate">{booking.phone}</div>
                                                                            <div className="truncate">{dayjs(booking.start_time).format("HH:mm")} - {dayjs(booking.start_time).add(booking.hours, 'hour').format("HH:mm")}</div>
                                                                            <div>{booking.hours} ч • {parseInt(booking.final_price).toLocaleString('ru-RU')} ₸</div>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Current time line - adjusted for scrollable container */}
                                                {getCurrentTimeLinePosition() !== null && (
                                                    <div
                                                        className="absolute left-0 right-0 z-10 pointer-events-none"
                                                        style={{ top: `${headerHeight + getCurrentTimeLinePosition()}px` }}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="flex-1 h-0.5 bg-red-500 shadow-sm"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current time indicator - repositioned outside scrollable area */}
                                    {getCurrentTimeLinePosition() !== null && (
                                        <div
                                            className="absolute left-0 z-20 pointer-events-none"
                                            style={{ top: `${headerHeight + getCurrentTimeLinePosition()}px` }}
                                        >
                                            <div className="w-20 flex justify-end pr-2">
                                                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow-md">
                                                    {currentTime.format("HH:mm")}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto mt-4 bg-white border rounded shadow">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Клиент</th>
                                                <th className="px-4 py-2 text-left">Телефон</th>
                                                <th className="px-4 py-2 text-left">Комната</th>
                                                <th className="px-4 py-2 text-left">Дата</th>
                                                <th className="px-4 py-2 text-left">Время</th>
                                                <th className="px-4 py-2 text-left">Часы</th>
                                                <th className="px-4 py-2 text-left">Цена</th>
                                                <th className="px-4 py-2 text-left">Подтверждено</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookingsForCurrentDate.map(booking => (
                                                <tr key={booking.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                                                    <td className="px-4 py-2">{booking.name}</td>
                                                    <td className="px-4 py-2">{booking.phone}</td>
                                                    <td className="px-4 py-2">#{booking.room.room_number}</td>
                                                    <td className="px-4 py-2">{dayjs(booking.start_time).format("DD.MM.YYYY")}</td>
                                                    <td className="px-4 py-2">{dayjs(booking.start_time).format("HH:mm")}</td>
                                                    <td className="px-4 py-2">{booking.hours}</td>
                                                    <td className="px-4 py-2">{parseInt(booking.final_price).toLocaleString('ru-RU')} ₸</td>
                                                    <td className="px-4 py-2">
                                                        {booking.confirmed ? (
                                                            <span className="text-green-600">✔</span>
                                                        ) : (
                                                            <span className="text-red-600">✘</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {bookingsForCurrentDate.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6 mt-4">
                            <h4 className="font-medium text-gray-900 mb-4">Сводка на {currentDate.format("DD MMMM YYYY")}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{bookingsForCurrentDate.length}</div>
                                    <div className="text-sm text-blue-800">Всего бронирований</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{bookingsForCurrentDate.reduce((sum, b) => sum + b.hours, 0)}</div>
                                    <div className="text-sm text-green-800">Часов забронировано</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{bookingsForCurrentDate.reduce((sum, b) => sum + parseInt(b.final_price), 0).toLocaleString('ru-RU')} ₸</div>
                                    <div className="text-sm text-purple-800">Общая выручка</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking details modal */}
                    {selectedBooking && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative transition-all">
                                {/* Close button */}
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Header */}
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedBooking.name}</h3>
                                <p className="text-gray-500 mb-4">{selectedBooking.phone}</p>

                                {/* Divider */}
                                <div className="border-t border-gray-200 my-4"></div>

                                {/* Details */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Комната</span>
                                        <span className="font-medium text-gray-800">#{selectedBooking.room.room_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Начало</span>
                                        <span className="font-medium text-gray-800">{dayjs(selectedBooking.start_time).format("DD MMMM YYYY HH:mm")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Конец</span>
                                        <span className="font-medium text-gray-800">{dayjs(selectedBooking.start_time).add(selectedBooking.hours, 'hour').format("DD MMMM YYYY HH:mm")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Длительность</span>
                                        <span className="font-medium text-gray-800">{selectedBooking.hours} ч</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Итого к оплате</span>
                                        <span className="font-medium text-gray-800">{parseInt(selectedBooking.final_price).toLocaleString('ru-RU')} ₸</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Статус</span>
                                        <span className={`font-medium ${selectedBooking.confirmed ? "text-green-600" : "text-yellow-600"}`}>
                                            {selectedBooking.confirmed ? "Подтверждено" : "Ожидает"}
                                        </span>
                                    </div>
                                </div>

                                {/* Extra Items (if any) */}
                                {Array.isArray(selectedBooking.extra_items) && selectedBooking.extra_items.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Дополнительные услуги</h4>
                                        <div className="overflow-hidden rounded-lg border border-gray-200">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-gray-50 text-gray-600">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-medium">Название</th>
                                                        <th className="px-3 py-2 text-right font-medium">Кол-во</th>
                                                        <th className="px-3 py-2 text-right font-medium">Сумма</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedBooking.extra_items.map((ex) => (
                                                        <tr key={ex.id} className="bg-white">
                                                            <td className="px-3 py-2">{ex.item?.name || "—"}</td>
                                                            <td className="px-3 py-2 text-right">{ex.quantity}</td>
                                                            <td className="px-3 py-2 text-right">{parseInt(ex.price_sum).toLocaleString('ru-RU')} ₸</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}


                                {/* Action button */}
                                <div className="mt-6">
                                    {selectedBooking.confirmed ? (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.delete(`${API_URLS.bookings}${selectedBooking.id}/`);
                                                    toast.success("Бронирование отменено");
                                                    setSelectedBooking(null);
                                                    fetchBookings(selectedBathhouse.id); // refresh list
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error("Не удалось отменить бронирование");
                                                }
                                            }}
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        >
                                            Отменить подтверждение
                                        </button>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.post(`${API_URLS.bookings}${selectedBooking.id}/confirm-booking-admin/`);
                                                    toast.success("Бронирование подтверждено");
                                                    setSelectedBooking(null);
                                                    fetchBookings(selectedBathhouse.id); // refresh list
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error("Не удалось подтвердить бронирование");
                                                }
                                            }}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                        >
                                            Подтвердить
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}


                </>
            )}
        </div>
    );
}