import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import API_URLS from "../api/config";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import 'dayjs/locale/ru';
import { X, Plus, Clock, User, Phone, Calendar, RefreshCw, Eye, EyeOff, ChevronLeft, ChevronRight, Home, Play, Pause } from "lucide-react";
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
    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentBonusBalance, setPaymentBonusBalance] = useState(null);
    const [paymentRedeemInput, setPaymentRedeemInput] = useState('0');

    // Auto-refresh states
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);

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

    // Auto-refresh effect
    useEffect(() => {
        if (autoRefreshEnabled && selectedBathhouse) {
            const interval = setInterval(async () => {
                try {
                    await fetchBookings(selectedBathhouse.id);
                    toast.success("Данные обновлены автоматически", {
                        duration: 2000,
                        position: "top-right",
                        style: {
                            background: '#10B981',
                            color: '#fff',
                        },
                    });
                } catch (err) {
                    toast.error("Ошибка автообновления", {
                        duration: 3000,
                        position: "top-right",
                    });
                }
            }, 20000); // 20 seconds
            setRefreshInterval(interval);

            return () => {
                clearInterval(interval);
                setRefreshInterval(null);
            };
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                setRefreshInterval(null);
            }
        }
    }, [autoRefreshEnabled, selectedBathhouse]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);


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

    const canCancelConfirmation = (booking) => {
        if (!booking) return false;
        const end = dayjs(booking.start_time).add(booking.hours, 'hour');
        return dayjs().isBefore(end);
    };

    const openPaymentModal = async (booking) => {
        if (!booking || !selectedBathhouse) return;
        try {
            setPaymentLoading(true);
            setShowPaymentModal(true);
            setPaymentRedeemInput('');
            setPaymentBonusBalance(null);
            const res = await api.get(API_URLS.bonusSystemBalance, {
                params: {
                    bathhouse_id: selectedBathhouse.id,
                    phone: booking.phone,
                }
            });
            const bal = Number(res?.data?.balance || 0);
            setPaymentBonusBalance(bal);
        } catch (err) {
            console.error(err);
            toast.error('Не удалось получить баланс бонусов');
        } finally {
            setPaymentLoading(false);
        }
    };

    const parseAmount = (val) => {
        if (val === null || val === undefined) return 0;
        const normalized = String(val).replace(',', '.').trim();
        const num = parseFloat(normalized);
        return Number.isFinite(num) ? num : 0;
    };

    const handleAcceptPayment = async () => {
        if (!selectedBooking || !selectedBathhouse) return;
        try {
            setPaymentLoading(true);
            const finalPriceNum = Number(selectedBooking.final_price || 0);
            const requested = parseAmount(paymentRedeemInput);
            const redeem = Math.max(0, Math.min(requested, Number(paymentBonusBalance || 0), finalPriceNum));

            const res = await api.post(`${API_URLS.bookings}${selectedBooking.id}/process-payment/`, {
                amount: redeem,
            }, {
                params: {
                    bathhouse_id: selectedBathhouse.id,
                    phone: selectedBooking.phone,
                }
            });

            if (res?.data?.is_paid) {
                toast.success('Оплата принята');
            } else {
                toast.success('Платеж обработан');
            }
            setShowPaymentModal(false);
            setSelectedBooking(null);
            fetchBookings(selectedBathhouse.id);
        } catch (err) {
            console.error(err);
            toast.error('Не удалось принять оплату');
        } finally {
            setPaymentLoading(false);
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
                    ё
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

        // Handle 24/7 case
        if (selectedBathhouse.is_24_hours) {
            const topOffset = (currentHour * slotHeight) + (currentMinutes / 60) * slotHeight;
            return topOffset;
        }

        // Regular working hours
        const startTime = dayjs(`2000-01-01 ${selectedBathhouse.start_of_work}`);
        const endTime = dayjs(`2000-01-01 ${selectedBathhouse.end_of_work}`);
        const isOvernight = endTime.isBefore(startTime);

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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Загрузка саун...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Бронирования</h1>
                            <p className="text-gray-600 mt-1">Управление бронированиями саун и бань</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Онлайн</span>
                            </div>
                            {autoRefreshEnabled && selectedBathhouse && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-blue-600 font-medium">Автообновление каждые 20с</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bathhouse Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Home className="w-4 h-4 inline mr-2" />
                        Выберите сауну
                    </label>
                    <select
                        value={selectedBathhouse?.id || ""}
                        onChange={(e) => {
                            const bathhouse = bathhouses.find(b => b.id === parseInt(e.target.value));
                            handleBathhouseChange(bathhouse);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    >
                        <option value="">Выберите сауну</option>
                        {bathhouses.map((bathhouse) => (
                            <option key={bathhouse.id} value={bathhouse.id}>{bathhouse.name}</option>
                        ))}
                    </select>
                </div>

                {selectedBathhouse && (
                    <>
                        {/* Date Navigation */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button
                                    onClick={goToPreviousDay}
                                    className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 w-full sm:w-auto justify-center"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Предыдущий</span>
                                    <span className="sm:hidden">←</span>
                                </button>

                                <div className="text-center flex-1">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{formatDateHeader()}</h3>
                                    <button
                                        onClick={goToToday}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 font-medium rounded-lg hover:bg-blue-50 hover:border-blue-600 transition-all duration-200"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Сегодня
                                    </button>
                                </div>

                                <button
                                    onClick={goToNextDay}
                                    className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 w-full sm:w-auto justify-center"
                                >
                                    <span className="hidden sm:inline">Следующий</span>
                                    <span className="sm:hidden">→</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* View Controls and Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                                {/* View Mode Toggle */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode("timetable")}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === "timetable"
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            <Clock className="w-4 h-4" />
                                            <span className="hidden sm:inline">Таблица времени</span>
                                            <span className="sm:hidden">Время</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode("table")}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === "table"
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="hidden sm:inline">Классическая таблица</span>
                                            <span className="sm:hidden">Таблица</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={() => {
                                            setAutoRefreshEnabled(!autoRefreshEnabled);
                                            if (!autoRefreshEnabled) {
                                                toast.success("Автообновление включено", {
                                                    duration: 2000,
                                                    position: "top-right",
                                                });
                                            } else {
                                                toast.info("Автообновление отключено", {
                                                    duration: 2000,
                                                    position: "top-right",
                                                });
                                            }
                                        }}
                                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${autoRefreshEnabled
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                            }`}
                                    >
                                        {autoRefreshEnabled ? (
                                            <>
                                                <Pause className="w-4 h-4" />
                                                <span className="hidden sm:inline">Остановить автообновление</span>
                                                <span className="sm:hidden">Пауза</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" />
                                                <span className="hidden sm:inline">Включить автообновление</span>
                                                <span className="sm:hidden">Авто</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={openCreateBookingModal}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Добавить бронирование</span>
                                        <span className="sm:hidden">Добавить</span>
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
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        <span className="hidden sm:inline">Обновить</span>
                                        <span className="sm:hidden">↻</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        {loading ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                                    <p className="text-gray-600 text-lg">Загрузка бронирований...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {viewMode === "timetable" ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="flex">
                                            {/* Time Column */}
                                            <div className="w-16 sm:w-20 border-r bg-gray-50 flex-shrink-0 sticky left-0 z-10">
                                                <div className="border-b text-xs text-gray-500 flex items-center justify-end pr-2 font-medium" style={{ height: `${slotHeight}px` }}>
                                                    Время
                                                </div>
                                                {timeSlots.map(slot => (
                                                    <div key={slot.time} className="border-b text-xs text-gray-500 flex items-center justify-end pr-2" style={{ height: `${slotHeight}px` }}>
                                                        {slot.time}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Rooms Grid */}
                                            <div className="flex-1 overflow-x-auto">
                                                <div className="flex relative" style={{ minWidth: `${rooms.length * 200}px` }}>
                                                    {rooms.map(room => (
                                                        <div key={room.id} className="w-48 border-r relative flex-shrink-0">
                                                            {/* Room Header */}
                                                            <div className="text-center p-3 border-b bg-gray-50" style={{ height: `${headerHeight}px` }}>
                                                                <div className="font-semibold text-sm text-gray-900">
                                                                    {room.is_sauna ? "Сауна" : room.is_bathhouse ? "Баня" : "Комната"} #{room.room_number}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">{room.capacity} чел.</div>
                                                            </div>

                                                            {/* Bookings */}
                                                            <div className="relative" style={{ height: `${timeSlots.length * slotHeight}px` }}>
                                                                {bookingsForCurrentDate
                                                                    .filter(b => b.room.id === room.id)
                                                                    .map(booking => {
                                                                        const start = dayjs(booking.start_time);
                                                                        const startHour = start.hour();
                                                                        const startMinutes = start.minute();

                                                                        let slotPosition = 0;

                                                                        // Handle 24/7 case
                                                                        if (selectedBathhouse.is_24_hours) {
                                                                            slotPosition = startHour;
                                                                        } else {
                                                                            // Regular working hours
                                                                            const bathhouseStart = dayjs(`2000-01-01 ${selectedBathhouse.start_of_work}`);
                                                                            const bathhouseEnd = dayjs(`2000-01-01 ${selectedBathhouse.end_of_work}`);
                                                                            const isOvernight = bathhouseEnd.isBefore(bathhouseStart);

                                                                            if (isOvernight) {
                                                                                if (startHour >= bathhouseStart.hour()) {
                                                                                    slotPosition = startHour - bathhouseStart.hour();
                                                                                } else {
                                                                                    slotPosition = (24 - bathhouseStart.hour()) + startHour;
                                                                                }
                                                                            } else {
                                                                                slotPosition = startHour - bathhouseStart.hour();
                                                                            }
                                                                        }

                                                                        const topOffset = (slotPosition * slotHeight) + (startMinutes / 60) * slotHeight;
                                                                        const height = booking.hours * slotHeight;

                                                                        return (
                                                                            <div
                                                                                key={booking.id}
                                                                                className="absolute left-1 right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md p-2 text-xs cursor-pointer hover:scale-[1.02] transition-all duration-200 hover:shadow-lg"
                                                                                style={{ top: `${topOffset}px`, height: `${height}px` }}
                                                                                onClick={() => setSelectedBooking(booking)}
                                                                            >
                                                                                <div className="font-semibold truncate">{booking.name}</div>
                                                                                <div className="truncate text-blue-100">{booking.phone}</div>
                                                                                <div className="truncate text-blue-100">
                                                                                    {dayjs(booking.start_time).format("HH:mm")} - {dayjs(booking.start_time).add(booking.hours, 'hour').format("HH:mm")}
                                                                                </div>
                                                                                <div className="font-medium">
                                                                                    {booking.hours} ч • {parseInt(booking.final_price).toLocaleString('ru-RU')} ₸
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Current Time Line */}
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

                                        {/* Current Time Label */}
                                        {getCurrentTimeLinePosition() !== null && (
                                            <div
                                                className="absolute left-0 z-20 pointer-events-none"
                                                style={{ top: `${headerHeight + getCurrentTimeLinePosition()}px` }}
                                            >
                                                <div className="w-16 sm:w-20 flex justify-end pr-2">
                                                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg shadow-md font-medium">
                                                        {currentTime.format("HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Клиент</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Телефон</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Комната</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Дата</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Время</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Часы</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Цена</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Оплата</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {bookingsForCurrentDate.map(booking => (
                                                        <tr key={booking.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedBooking(booking)}>
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium text-gray-900">{booking.name}</div>
                                                                <div className="text-sm text-gray-500 sm:hidden">{booking.phone}</div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 hidden sm:table-cell">{booking.phone}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    #{booking.room.room_number}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 hidden md:table-cell">
                                                                {dayjs(booking.start_time).format("DD.MM.YYYY")}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {dayjs(booking.start_time).format("HH:mm")}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                    {booking.hours} ч
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                {parseInt(booking.final_price).toLocaleString('ru-RU')} ₸
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {booking.is_paid ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                                                                        Оплачено
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
                                                                        Не оплачено
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {booking.confirmed ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                                                                        Подтверждено
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
                                                                        Ожидает
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {bookingsForCurrentDate.length === 0 && (
                                            <div className="text-center py-12">
                                                <div className="text-gray-400 mb-4">
                                                    <Calendar className="w-12 h-12 mx-auto" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет бронирований</h3>
                                                <p className="text-gray-500">На выбранную дату бронирований не найдено</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Summary Statistics */}
                        {bookingsForCurrentDate.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-6">Сводка на {currentDate.format("DD MMMM YYYY")}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">{bookingsForCurrentDate.length}</div>
                                        <div className="text-sm font-medium text-blue-800">Всего бронирований</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200">
                                        <div className="text-3xl font-bold text-green-600 mb-2">{bookingsForCurrentDate.reduce((sum, b) => sum + b.hours, 0)}</div>
                                        <div className="text-sm font-medium text-green-800">Часов забронировано</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border border-purple-200 sm:col-span-2 lg:col-span-1">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">{bookingsForCurrentDate.reduce((sum, b) => sum + parseInt(b.final_price), 0).toLocaleString('ru-RU')} ₸</div>
                                        <div className="text-sm font-medium text-purple-800">Общая выручка</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create Booking Modal */}
                        {showCreateBookingModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateBookingModal(false)} />
                                <div className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl">
                                    {/* Modal Header */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold text-gray-900">Создать бронирование</h3>
                                            <button
                                                onClick={() => setShowCreateBookingModal(false)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="p-6">
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-4">Выберите комнату</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {rooms.map((room) => (
                                                        <div
                                                            key={room.id}
                                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${selectedRoom?.id === room.id
                                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                                }`}
                                                            onClick={() => handleRoomSelect(room)}
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="font-semibold text-gray-900 text-sm">
                                                                    {room.is_sauna ? "Сауна" : room.is_bathhouse ? "Баня" : "Комната"} #{room.room_number}
                                                                </div>
                                                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                                    {room.capacity} чел.
                                                                </div>
                                                            </div>

                                                            <div className="text-lg font-bold text-blue-600 mb-3">
                                                                {parseInt(room.price_per_hour).toLocaleString()} ₸/час
                                                            </div>

                                                            <div className="flex flex-wrap gap-1 text-xs">
                                                                {room.has_pool && (
                                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                                                        Бассейн
                                                                    </span>
                                                                )}
                                                                {room.has_recreation_area && (
                                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                                                        Отдых
                                                                    </span>
                                                                )}
                                                                {room.has_steam_room && (
                                                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                                                                        Парная
                                                                    </span>
                                                                )}
                                                                {room.heated_by_wood && (
                                                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                                                                        Дрова
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Time Selection */}
                                            {selectedRoom && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                        <Clock className="w-4 h-4 inline mr-2" />
                                                        Выберите время (нажмите начало, затем конец)
                                                    </label>
                                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-80 overflow-y-auto p-4 border border-gray-200 rounded-xl bg-gray-50">
                                                        {bookingTimeSlots.map((slot) => {
                                                            const slotStart = slot.dateTime;
                                                            const slotEnd = slotStart.add(1, "hour");
                                                            const booked = isSlotBooked(roomBookings, slotStart, slotEnd);

                                                            const isSelectedStart = selectedStartSlot && slotStart.isSame(selectedStartSlot);
                                                            const isSelectedEnd = selectedEndSlot && slotStart.isSame(selectedEndSlot);
                                                            const inRange = isInRange(slotStart);

                                                            let buttonClass = "w-full text-xs py-3 px-2 rounded-lg font-medium transition-all duration-200 ";

                                                            if (booked) {
                                                                buttonClass += "bg-red-100 text-red-800 cursor-not-allowed border border-red-200";
                                                            } else if (isSelectedStart) {
                                                                buttonClass += "bg-green-500 text-white shadow-md transform scale-105";
                                                            } else if (isSelectedEnd) {
                                                                buttonClass += "bg-blue-500 text-white shadow-md transform scale-105";
                                                            } else if (inRange) {
                                                                buttonClass += "bg-yellow-200 text-yellow-800 border border-yellow-300";
                                                            } else {
                                                                buttonClass += "bg-white text-gray-700 hover:bg-green-100 hover:text-green-800 border border-gray-200 hover:border-green-300";
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
                                                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 space-y-3">
                                                            {selectedEndSlot && (
                                                                <>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="text-sm font-medium text-blue-900">
                                                                            <strong>Выбранное время:</strong> {selectedStartSlot.format("HH:mm")} - {selectedEndSlot.add(1, 'hour').format("HH:mm")}
                                                                        </div>
                                                                        <div className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                                                            {selectedEndSlot.diff(selectedStartSlot, "hour") + 1} ч.
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm font-medium text-blue-800">
                                                                        <strong>Стоимость комнаты:</strong> {fmt(estimatedPrice)} ₸
                                                                    </div>
                                                                </>
                                                            )}

                                                            <button
                                                                onClick={resetSelectedSlots}
                                                                className="px-4 py-2 text-sm border border-red-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors font-medium"
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
                                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                                <button
                                                    onClick={() => setShowCreateBookingModal(false)}
                                                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                                >
                                                    Отмена
                                                </button>
                                                <button
                                                    onClick={createManualBooking}
                                                    disabled={createBookingLoading || !selectedStartSlot || !selectedRoom || !bookingName.trim() || !bookingPhone.trim()}
                                                    className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    {createBookingLoading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                            Создание...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-4 h-4" />
                                                            Создать бронирование
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Booking Details Modal */}
                        {selectedBooking && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                                    {/* Modal Header */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">{selectedBooking.name}</h3>
                                                <p className="text-gray-600 mt-1">{selectedBooking.phone}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedBooking?.is_paid === true ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                        Оплачено
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => openPaymentModal(selectedBooking)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                                    >
                                                        Принять оплату
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedBooking(null)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Booking Details */}
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Детали бронирования</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-gray-600 font-medium">Комната</span>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                            #{selectedBooking.room.room_number}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-gray-600 font-medium">Начало</span>
                                                        <span className="font-medium text-gray-900">{dayjs(selectedBooking.start_time).format("DD MMMM YYYY HH:mm")}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-gray-600 font-medium">Конец</span>
                                                        <span className="font-medium text-gray-900">{dayjs(selectedBooking.start_time).add(selectedBooking.hours, 'hour').format("DD MMMM YYYY HH:mm")}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-gray-600 font-medium">Длительность</span>
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800">
                                                            {selectedBooking.hours} ч
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-gray-600 font-medium">Итого к оплате</span>
                                                        <span className="text-lg font-bold text-gray-900">{parseInt(selectedBooking.final_price).toLocaleString('ru-RU')} ₸</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2">
                                                        <span className="text-gray-600 font-medium">Оплата</span>
                                                        {selectedBooking?.is_paid ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                                Оплачено
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                                Не оплачено
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center py-2">
                                                        <span className="text-gray-600 font-medium">Статус</span>
                                                        {selectedBooking.confirmed ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                                                                Подтверждено
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
                                                                Ожидает
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Extra Items */}
                                            {Array.isArray(selectedBooking.extra_items) && selectedBooking.extra_items.length > 0 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Дополнительные услуги</h4>
                                                    <div className="space-y-2">
                                                        {selectedBooking.extra_items.map((ex) => (
                                                            <div key={ex.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                                                <span className="text-gray-900 font-medium">{ex.item?.name || "—"}</span>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-gray-600">×{ex.quantity}</span>
                                                                    <span className="font-semibold text-gray-900">{parseInt(ex.price_sum).toLocaleString('ru-RU')} ₸</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                                            {selectedBooking.confirmed && canCancelConfirmation(selectedBooking) && (
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
                                                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    Отменить подтверждение
                                                </button>
                                            )}

                                            {!selectedBooking.confirmed && (
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
                                                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    Подтвердить бронирование
                                                </button>
                                            )}

                                            {!selectedBooking.is_paid && (
                                                <button
                                                    onClick={() => openPaymentModal(selectedBooking)}
                                                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                                >
                                                    Принять оплату
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Modal */}
                        {showPaymentModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                                <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
                                    <div className="px-6 py-4 border-b border-gray-200 rounded-t-2xl flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-gray-900">Принять оплату</h3>
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="text-sm text-gray-700">
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">Итого к оплате</span>
                                                <span className="font-semibold">{parseInt(selectedBooking?.final_price || 0).toLocaleString('ru-RU')} ₸</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">Бонусный баланс</span>
                                                <span className="font-semibold">{Number(paymentBonusBalance || 0).toLocaleString('ru-RU')} ₸</span>
                                            </div>
                                        </div>

                                        <div>
                                            {Number(paymentBonusBalance || 0) > 0 ? (
                                                <>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Списать бонусов (₸)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={paymentRedeemInput}
                                                        onChange={(e) => setPaymentRedeemInput(e.target.value)}
                                                        placeholder="Введите сумму бонусов"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">Не больше доступного баланса и суммы к оплате.</p>
                                                </>
                                            ) : (
                                                <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    Бонусов пока нет для списания.
                                                </div>
                                            )}
                                        </div>

                                        {paymentLoading && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
                                                Обработка...
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                            disabled={paymentLoading}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            onClick={handleAcceptPayment}
                                            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                            disabled={paymentLoading}
                                        >
                                            Принять
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}