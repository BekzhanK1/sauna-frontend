import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import API_URLS from "../api/config";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import 'dayjs/locale/ru';
import { X, Plus, Clock, User, Phone } from "lucide-react";
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
    const [bookingsForCurrentDate, setBookingsForCurrentDate] = useState([]);

    // Manual booking states
    const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomBookings, setRoomBookings] = useState([]);
    const [selectedStartSlot, setSelectedStartSlot] = useState(null);
    const [selectedEndSlot, setSelectedEndSlot] = useState(null);
    const [bookingName, setBookingName] = useState("");
    const [bookingPhone, setBookingPhone] = useState("");
    const [selectedBookingDate, setSelectedBookingDate] = useState(dayjs());
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemsTotalPrice, setItemsTotalPrice] = useState(0);
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [createBookingLoading, setCreateBookingLoading] = useState(false);

    const slotHeight = 48;
    const headerHeight = 48;

    useEffect(() => {
        fetchBathhouses();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000);
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        const filtered = bookings.filter((b) =>
            dayjs(b.start_time).isSame(currentDate, "day")
        );
        setBookingsForCurrentDate(filtered);
        console.log(bookings)
    }, [bookings, currentDate]);
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
            console.log("Fetching bookings for bathhouse ID:", bathhouseId);
            setLoading(true);
            const res = await api.get(`${API_URLS.bookings}?bathhouse_id=${bathhouseId}`);
            console.log("Fetched bookings:", res.data);
            setBookings(res.data);
        } catch (err) {
            toast.error("Не удалось загрузить бронирования");
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuItems = async (bathhouseId) => {
        try {
            const [itemsRes, categoriesRes] = await Promise.all([
                api.get(`${API_URLS.bathhouseItems}?bathhouse_id=${bathhouseId}`),
                api.get(`${API_URLS.menuCategories}?bathhouse_id=${bathhouseId}`),
            ]);
            setMenuItems(itemsRes.data);
            setCategories(categoriesRes.data);
        } catch {
            toast.error("Не удалось загрузить меню");
        }
    };

    const fetchRoomBookings = async (roomId, date) => {
        try {
            const res = await api.get(`${API_URLS.bookings}room-bookings/`, {
                params: {
                    room_id: roomId,
                    date: date.format('YYYY-MM-DD')
                },
            });
            setRoomBookings(res.data);
        } catch {
            toast.error("Не удалось загрузить бронирования комнаты");
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

    const openCreateBookingModal = () => {
        if (!selectedBathhouse) {
            toast.error("Сначала выберите сауну");
            return;
        }
        setShowCreateBookingModal(true);
        fetchMenuItems(selectedBathhouse.id);
        resetBookingForm();
    };

    const resetBookingForm = () => {
        setSelectedRoom(null);
        setRoomBookings([]);
        setSelectedStartSlot(null);
        setSelectedEndSlot(null);
        setBookingName("");
        setBookingPhone("");
        setSelectedBookingDate(dayjs());
        setSelectedItems([]);
        setItemsTotalPrice(0);
        setEstimatedPrice(0);
    };

    const resetSelectedSlots = () => {
        setSelectedStartSlot(null);
        setSelectedEndSlot(null);
        setEstimatedPrice(0);
    }

    const handleRoomSelect = async (room) => {
        setSelectedRoom(room);
        setSelectedStartSlot(null);
        setSelectedEndSlot(null);
        setEstimatedPrice(0);
        await fetchRoomBookings(room.id, selectedBookingDate);
    };

    const generateTimeSlots = () => {
        if (!selectedBathhouse) return [];

        const slots = [];

        // Handle 24/7 case - check the is_24_hours flag
        if (selectedBathhouse.is_24_hours) {
            for (let hour = 0; hour < 24; hour++) {
                slots.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    hour: hour,
                    slotIndex: hour
                });
            }
            return slots;
        }

        // Regular hours logic
        const startTime = dayjs(`2000-01-01 ${selectedBathhouse.start_of_work}`);
        const endTime = dayjs(`2000-01-01 ${selectedBathhouse.end_of_work}`);
        const isOvernight = endTime.isBefore(startTime);

        let currentSlot = startTime;
        let slotIndex = 0;

        while (true) {
            if (!currentSlot.isValid()) break;

            const hour = currentSlot.hour();
            slots.push({
                time: `${hour.toString().padStart(2, '0')}:00`,
                hour: hour,
                slotIndex: slotIndex
            });

            currentSlot = currentSlot.add(1, 'hour');
            slotIndex++;

            if (isOvernight) {
                if (currentSlot.hour() === endTime.hour() && slotIndex > 1) break;
                if (slotIndex >= 24) break;
            } else {
                if (currentSlot.hour() === endTime.hour()) break;
                if (slotIndex >= 24) break;
            }
        }

        return slots;
    };

    const isSlotBooked = (bookings, slotStart, slotEnd) => {
        return bookings.some((booking) => {
            const bookingStart = dayjs(booking.start_time);
            const bookingEnd = bookingStart.add(booking.hours, "hour");
            return slotStart.isBefore(bookingEnd) && bookingStart.isBefore(slotEnd);
        });
    };

    const handleSlotClick = (slot) => {
        if (!selectedRoom) return;

        if (!selectedStartSlot) {
            setSelectedStartSlot(slot);
            setSelectedEndSlot(slot);
            const hours = 1;
            const price = hours * parseFloat(selectedRoom.price_per_hour);
            setEstimatedPrice(price);
        } else if (slot.isAfter(selectedStartSlot)) {
            const intermediateHours = slot.diff(selectedStartSlot, "hour") + 1;

            let isValidRange = true;
            for (let i = 0; i < intermediateHours; i++) {
                const blockStart = selectedStartSlot.add(i, "hour");
                const blockEnd = blockStart.add(1, "hour");
                if (isSlotBooked(roomBookings, blockStart, blockEnd)) {
                    isValidRange = false;
                    break;
                }
            }

            if (isValidRange) {
                setSelectedEndSlot(slot);
                const hours = intermediateHours;
                const price = hours * parseFloat(selectedRoom.price_per_hour);
                setEstimatedPrice(price);
            } else {
                setSelectedStartSlot(slot);
                setSelectedEndSlot(slot);
                const hours = 1;
                const price = hours * parseFloat(selectedRoom.price_per_hour);
                setEstimatedPrice(price);
            }
        } else {
            setSelectedStartSlot(slot);
            setSelectedEndSlot(slot);
            const hours = 1;
            const price = hours * parseFloat(selectedRoom.price_per_hour);
            setEstimatedPrice(price);
        }
    };

    const handleItemQuantityChange = (itemId, quantity) => {
        setSelectedItems((prev) => {
            let updated;
            if (quantity === 0) {
                updated = prev.filter((it) => it.item !== itemId);
            } else {
                const exists = prev.find((it) => it.item === itemId);
                if (exists) {
                    updated = prev.map((it) => it.item === itemId ? { ...it, quantity } : it);
                } else {
                    updated = [...prev, { item: itemId, quantity }];
                }
            }

            let newItemsTotal = 0;
            for (const item of updated) {
                const menuItem = menuItems.find((mi) => mi.id === item.item);
                if (menuItem) {
                    newItemsTotal += Number(menuItem.price) * item.quantity;
                }
            }
            setItemsTotalPrice(newItemsTotal);
            return updated;
        });
    };

    const createManualBooking = async () => {
        if (!selectedStartSlot || !selectedEndSlot || !selectedRoom) {
            toast.error("Выберите время и комнату");
            return;
        }

        if (!bookingName.trim()) {
            toast.error("Введите имя клиента");
            return;
        }

        if (!bookingPhone.trim()) {
            toast.error("Введите телефон клиента");
            return;
        }

        try {
            setCreateBookingLoading(true);
            const hours = selectedEndSlot.diff(selectedStartSlot, "hour") + 1;
            const startDateTime = selectedBookingDate
                .hour(selectedStartSlot.hour())
                .minute(0)
                .second(0);

            const res = await api.post(API_URLS.bookings, {
                name: bookingName.trim(),
                phone: bookingPhone.trim(),
                bathhouse: selectedBathhouse.id,
                room: selectedRoom.id,
                start_time: startDateTime.toISOString(),
                hours,
                extra_items_data: selectedItems,
                skip_sms: true,
                admin_created: true
            });

            // Confirm the booking immediately
            await api.post(`${API_URLS.bookings}${res.data.id}/confirm-booking-admin/`);

            toast.success("Бронирование создано и подтверждено");
            setShowCreateBookingModal(false);
            fetchBookings(selectedBathhouse.id);
            resetBookingForm();
        } catch (err) {
            console.error(err);
            toast.error("Не удалось создать бронирование:\n" + err.response.data.non_field_errors[0]);
        } finally {
            setCreateBookingLoading(false);
        }
    };

    const isInRange = (slot) => {
        if (!selectedStartSlot || !selectedEndSlot) return false;
        return (slot.isAfter(selectedStartSlot) && slot.isBefore(selectedEndSlot)) ||
            slot.isSame(selectedStartSlot) ||
            slot.isSame(selectedEndSlot);
    };

    const generateBookingTimeSlots = () => {
        if (!selectedBathhouse) return [];

        const slots = [];

        // Handle 24/7 case - check the is_24_hours flag
        console.log("Selected Bathhouse:", selectedBathhouse);
        if (selectedBathhouse.is_24_hours) {
            for (let hour = 0; hour < 24; hour++) {
                const slotDateTime = selectedBookingDate.hour(hour).minute(0).second(0);
                slots.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    hour,
                    slotIndex: hour,
                    dateTime: slotDateTime
                });
            }
        } else {
            // Regular hours logic (your existing code)
            const startTime = dayjs(`2000-01-01 ${selectedBathhouse.start_of_work}`);
            const endTime = dayjs(`2000-01-01 ${selectedBathhouse.end_of_work}`);
            const isOvernight = endTime.isBefore(startTime);

            let currentSlot = startTime;
            let slotIndex = 0;

            while (true) {
                if (!currentSlot.isValid()) break;

                const hour = currentSlot.hour();
                const slotDateTime = selectedBookingDate.hour(hour).minute(0).second(0);

                slots.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    hour,
                    slotIndex,
                    dateTime: slotDateTime
                });

                currentSlot = currentSlot.add(1, 'hour');
                slotIndex++;

                if (isOvernight) {
                    if (currentSlot.hour() === endTime.hour() && slotIndex > 1) break;
                    if (slotIndex >= 24) break;
                } else {
                    if (currentSlot.hour() === endTime.hour()) break;
                    if (slotIndex >= 24) break;
                }
            }
        }

        // Filter for today - keep only slots from the next whole hour and later
        const now = dayjs();
        if (selectedBookingDate.isSame(now, 'day')) {
            const cutoff = now.add(1, 'hour').startOf('hour');
            return slots.filter(s => !s.dateTime.isBefore(cutoff));
        }

        return slots;
    };


    const bookingTimeSlots = generateBookingTimeSlots();
    const totalPrice = estimatedPrice + itemsTotalPrice;
    const fmt = (n) => Number(n).toLocaleString();

    // Group items by category for the modal
    const groupedItems = categories.reduce((acc, category) => {
        acc[category.id] = {
            name: category.name,
            items: menuItems.filter((item) => item.category === category.id)
        };
        return acc;
    }, {});

    const uncategorizedItems = menuItems.filter(item => item.category === null);
    if (uncategorizedItems.length > 0) {
        groupedItems['uncategorized'] = {
            name: 'Без категории',
            items: uncategorizedItems,
        };
    }

    // Rest of the original component logic...
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

    const getCurrentTimeLinePosition = () => {
        if (!selectedBathhouse) return null;

        const now = currentTime;
        const currentHour = now.hour();
        const currentMinutes = now.minute();

        if (!currentDate.isSame(dayjs(), 'day')) {
            return null;
        }

        const startTime = dayjs(`2000-01-01 ${selectedBathhouse.start_of_work}`);
        const endTime = dayjs(`2000-01-01 ${selectedBathhouse.end_of_work}`);
        const isOvernight = endTime.isBefore(startTime) || endTime.isSame(startTime);

        let isWithinWorkingHours = false;
        let slotPosition = 0;

        if (isOvernight) {
            if (currentHour >= startTime.hour() || currentHour < endTime.hour()) {
                isWithinWorkingHours = true;
                if (currentHour >= startTime.hour()) {
                    slotPosition = currentHour - startTime.hour();
                } else {
                    slotPosition = (24 - startTime.hour()) + currentHour;
                }
            }
        } else {
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
                                onClick={openCreateBookingModal}
                                className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-white bg-green-600 hover:bg-green-700 transition"
                                disabled={loading}
                            >
                                <Plus className="w-4 h-4" />
                                Добавить бронирование
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

                    {/* Rest of the original component remains the same... */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {viewMode === "timetable" ? (
                                <div className="relative border rounded overflow-hidden bg-white shadow mt-4">
                                    <div className="flex">
                                        <div className="w-20 border-r bg-gray-50 flex-shrink-0 sticky left-0 z-10">
                                            <div className="border-b text-xs text-gray-500 flex items-center justify-end pr-2" style={{ height: `${slotHeight}px` }}>Время</div>
                                            {timeSlots.map(slot => (
                                                <div key={slot.time} className="border-b text-xs text-gray-500 flex items-center justify-end pr-2" style={{ height: `${slotHeight}px` }}>{slot.time}</div>
                                            ))}
                                        </div>

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

                    {/* Create Booking Modal */}
                    {showCreateBookingModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateBookingModal(false)} />
                            <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
                                <button
                                    onClick={() => setShowCreateBookingModal(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Создать бронирование</h3>

                                <div className="space-y-6">
                                    {/* Client Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User className="w-4 h-4 inline mr-1" />
                                                Имя клиента *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookingName}
                                                onChange={(e) => setBookingName(e.target.value)}
                                                placeholder="Введите имя"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Phone className="w-4 h-4 inline mr-1" />
                                                Телефон *
                                            </label>
                                            <input
                                                type="tel"
                                                value={bookingPhone}
                                                onChange={(e) => setBookingPhone(e.target.value)}
                                                placeholder="+7..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Дата бронирования
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedBookingDate.format('YYYY-MM-DD')}
                                            onChange={(e) => {
                                                setSelectedBookingDate(dayjs(e.target.value));
                                                if (selectedRoom) {
                                                    fetchRoomBookings(selectedRoom.id, dayjs(e.target.value));
                                                }
                                            }}
                                            min={dayjs().format('YYYY-MM-DD')}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Room Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Выберите комнату</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {rooms.map((room) => (
                                                <div
                                                    key={room.id}
                                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedRoom?.id === room.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => handleRoomSelect(room)}
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {room.is_sauna ? "Сауна" : room.is_bathhouse ? "Баня" : "Комната"} #{room.room_number}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mb-2">{room.capacity} чел.</div>
                                                    <div className="text-lg font-bold text-blue-600">
                                                        {parseInt(room.price_per_hour).toLocaleString()} ₸/час
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-2 text-xs">
                                                        {room.has_pool && <span className="bg-blue-100 px-2 py-1 rounded">Бассейн</span>}
                                                        {room.has_recreation_area && <span className="bg-blue-100 px-2 py-1 rounded">Отдых</span>}
                                                        {room.has_steam_room && <span className="bg-blue-100 px-2 py-1 rounded">Парная</span>}
                                                        {room.heated_by_wood && <span className="bg-green-100 px-2 py-1 rounded">Дрова</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    {selectedRoom && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Выберите время (нажмите начало, затем конец)
                                            </label>
                                            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                                                {bookingTimeSlots.map((slot) => {
                                                    const slotStart = slot.dateTime;
                                                    const slotEnd = slotStart.add(1, "hour");
                                                    const booked = isSlotBooked(roomBookings, slotStart, slotEnd);

                                                    const isSelectedStart = selectedStartSlot && slotStart.isSame(selectedStartSlot);
                                                    const isSelectedEnd = selectedEndSlot && slotStart.isSame(selectedEndSlot);
                                                    const inRange = isInRange(slotStart);

                                                    let buttonClass = "w-full text-xs py-2 rounded font-medium transition ";

                                                    if (booked) {
                                                        buttonClass += "bg-red-100 text-red-800 cursor-not-allowed";
                                                    } else if (isSelectedStart) {
                                                        buttonClass += "bg-green-500 text-white";
                                                    } else if (isSelectedEnd) {
                                                        buttonClass += "bg-blue-500 text-white";
                                                    } else if (inRange) {
                                                        buttonClass += "bg-yellow-200 text-yellow-800";
                                                    } else {
                                                        buttonClass += "bg-green-100 text-green-800 hover:bg-green-200";
                                                    }

                                                    return (
                                                        <button
                                                            key={slot.time}
                                                            disabled={booked}
                                                            onClick={() => handleSlotClick(slotStart)}
                                                            className={buttonClass}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {selectedStartSlot && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg space-y-2">
                                                    {selectedEndSlot && (
                                                        <>
                                                            <div className="text-sm text-blue-800">
                                                                <strong>Выбранное время:</strong> {selectedStartSlot.format("HH:mm")} - {selectedEndSlot.add(1, 'hour').format("HH:mm")}
                                                                ({selectedEndSlot.diff(selectedStartSlot, "hour") + 1} ч.)
                                                            </div>
                                                            <div className="text-sm text-blue-800">
                                                                <strong>Стоимость комнаты:</strong> {fmt(estimatedPrice)} ₸
                                                            </div>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={resetSelectedSlots}
                                                        className="mt-2 px-3 py-1 text-sm border rounded text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                                                    >
                                                        Сбросить выбор
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    )}

                                    {/* Additional Services */}
                                    {Object.keys(groupedItems).length > 0 && selectedRoom && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Дополнительные услуги</h4>
                                            <div className="space-y-4 max-h-60 overflow-y-auto">
                                                {Object.entries(groupedItems).map(([categoryId, categoryData]) => (
                                                    <div key={categoryId}>
                                                        <h5 className="text-base font-medium text-gray-800 mb-2">
                                                            {categoryData.name}
                                                        </h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {categoryData.items.map((item) => {
                                                                const selected = selectedItems.find(it => it.item === item.id)?.quantity || 0;
                                                                return (
                                                                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex-1 min-w-0">
                                                                                <h6 className="font-medium text-gray-900 text-sm truncate">{item.name}</h6>
                                                                                <p className="text-xs text-gray-500">{Number(item.price).toLocaleString()} ₸</p>
                                                                            </div>
                                                                            <div className="flex items-center space-x-2 ml-3">
                                                                                {selected > 0 && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() => handleItemQuantityChange(item.id, Math.max(selected - 1, 0))}
                                                                                            className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors text-xs"
                                                                                        >
                                                                                            −
                                                                                        </button>
                                                                                        <span className="w-4 text-center text-xs font-medium">{selected}</span>
                                                                                    </>
                                                                                )}
                                                                                <button
                                                                                    onClick={() => handleItemQuantityChange(item.id, selected + 1)}
                                                                                    className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors text-xs"
                                                                                >
                                                                                    +
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Total Price */}
                                    {selectedRoom && selectedStartSlot && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Комната:</span>
                                                    <span>{fmt(estimatedPrice)} ₸</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Дополнительные услуги:</span>
                                                    <span>{fmt(itemsTotalPrice)} ₸</span>
                                                </div>
                                                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                                    <span>Итого:</span>
                                                    <span className="text-blue-600">{fmt(totalPrice)} ₸</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setShowCreateBookingModal(false)}
                                            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            onClick={createManualBooking}
                                            disabled={createBookingLoading || !selectedStartSlot || !selectedRoom || !bookingName.trim() || !bookingPhone.trim()}
                                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
                                        >
                                            {createBookingLoading ? "Создание..." : "Создать бронирование"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking details modal - keeping the original */}
                    {selectedBooking && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative transition-all">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedBooking.name}</h3>
                                <p className="text-gray-500 mb-4">{selectedBooking.phone}</p>

                                <div className="border-t border-gray-200 my-4"></div>

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

                                <div className="mt-6">
                                    {selectedBooking.confirmed ? (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.delete(`${API_URLS.bookings}${selectedBooking.id}/`);
                                                    toast.success("Бронирование отменено");
                                                    setSelectedBooking(null);
                                                    fetchBookings(selectedBathhouse.id);
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
                                                    fetchBookings(selectedBathhouse.id);
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