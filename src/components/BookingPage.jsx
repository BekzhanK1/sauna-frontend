import { useEffect, useState } from "react";
import { unauthenticatedApi } from "../api/axios";
import {
    Calendar, Clock, MapPin, Star, Plus, Minus, ShoppingCart,
    User, Phone, Mail, CreditCard,
    ShieldCheck, KeyRound, CheckCircle2, X, RotateCcw, Search
} from "lucide-react";

import { Waves, Sofa, Flame, ShowerHead, TreePine } from "lucide-react";
import API_URLS from "../api/config";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);

export default function BookingPage({ bathhouse: singleBathhouse }) {
    const [bathhouses, setBathhouses] = useState([]);
    const [expandedBathhouseId, setExpandedBathhouseId] = useState(null);
    const [selectedRoomBookings, setSelectedRoomBookings] = useState({});
    const [selectedStartSlot, setSelectedStartSlot] = useState(null);
    const [selectedEndSlot, setSelectedEndSlot] = useState(null);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedDay, setSelectedDay] = useState(0);

    const [showConfirmPhoneModal, setShowConfirmPhoneModal] = useState(false);
    const [showSmsCodeModal, setShowSmsCodeModal] = useState(false);
    const [smsCode, setSmsCode] = useState("");
    const [bookingId, setBookingId] = useState(null);
    const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemsTotalPrice, setItemsTotalPrice] = useState(0);
    const [openedRoomId, setOpenedRoomId] = useState(null);
    const [currentRoomBookings, setCurrentRoomBookings] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [query, setQuery] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBathhouses = async () => {
            if (singleBathhouse) {
                setBathhouses([singleBathhouse]);
                setExpandedBathhouseId(singleBathhouse.id);
                fetchMenuItems(singleBathhouse.id);
                return;
            }
            try {
                const res = await unauthenticatedApi.get(API_URLS.bathhouses);
                setBathhouses(res.data);
            } catch {
                toast.error("Не удалось загрузить бани");
            }
        };

        fetchBathhouses();
    }, [singleBathhouse]);

    const fetchMenuItems = async (bathhouseId) => {
        try {
            const [itemsRes, categoriesRes] = await Promise.all([
                unauthenticatedApi.get(`${API_URLS.bathhouseItems}?bathhouse_id=${bathhouseId}`),
                unauthenticatedApi.get(`${API_URLS.menuCategories}?bathhouse_id=${bathhouseId}`),
            ]);
            setMenuItems(itemsRes.data);
            setCategories(categoriesRes.data);
        } catch {
            toast.error("Не удалось загрузить меню");
        }
    };

    const toggleBathhouse = (id) => {
        if (!singleBathhouse) {
            navigate(`/booking/bathhouse/${id}`);
            return
        }
        setExpandedBathhouseId(expandedBathhouseId === id ? null : id);
        resetSelections();
    };

    const fetchRoomBookings = async (roomId) => {
        try {
            if (openedRoomId === roomId) {
                setOpenedRoomId(null);
                setCurrentRoomBookings([]);
                return;
            }

            const res = await unauthenticatedApi.get(`${API_URLS.bookings}room-bookings/`, {
                params: { room_id: roomId },
            });
            setOpenedRoomId(roomId);
            setCurrentRoomBookings(res.data);
        } catch {
            toast.error("Не удалось загрузить бронирования");
        }
    };

    const isSlotBooked = (bookings, slotStart, slotEnd) => {
        return bookings.some((booking) => {
            const bookingStart = dayjs(booking.start_time);
            const bookingEnd = bookingStart.add(booking.hours, "hour");
            return slotStart.isBefore(bookingEnd) && bookingStart.isBefore(slotEnd);
        });
    };

    const handleSlotClick = (slot, room) => {
        if (!selectedStartSlot) {
            setSelectedStartSlot(slot);
            setSelectedEndSlot(slot);
            setCurrentRoom(room);

            const hours = 1;
            const price = hours * parseFloat(room.price_per_hour);
            setEstimatedPrice(price);
        } else if (slot.isAfter(selectedStartSlot)) {
            const intermediateHours = slot.diff(selectedStartSlot, "hour") + 1;

            let isValidRange = true;
            for (let i = 0; i < intermediateHours; i++) {
                const blockStart = selectedStartSlot.add(i, "hour");
                const blockEnd = blockStart.add(1, "hour");

                const booked = isSlotBooked(currentRoomBookings, blockStart, blockEnd);

                if (booked) {
                    isValidRange = false;
                    break;
                }
            }

            if (isValidRange) {
                setSelectedEndSlot(slot);
                const hours = intermediateHours;
                const price = hours * parseFloat(room.price_per_hour);
                setEstimatedPrice(price);
            } else {
                setSelectedStartSlot(slot);
                setSelectedEndSlot(slot);
                setCurrentRoom(room);

                const hours = 1;
                const price = hours * parseFloat(room.price_per_hour);
                setEstimatedPrice(price);
            }
        } else {
            setSelectedStartSlot(slot);
            setSelectedEndSlot(slot);
            setCurrentRoom(room);

            const hours = 1;
            const price = hours * parseFloat(room.price_per_hour);
            setEstimatedPrice(price);
        }
    };

    const handleBook = () => {
        setShowConfirmPhoneModal(true);
    };

    const bookWithoutSms = async () => {
        if (!selectedStartSlot || !selectedEndSlot || !currentRoom) return;

        if (!name.trim()) {
            toast.error("Пожалуйста, введите имя");
            return;
        }
        if (!phone.trim().startsWith("+7")) {
            toast.error("Телефон должен начинаться с +7");
            return;
        }

        const hours = selectedEndSlot.diff(selectedStartSlot, "hour") + 1;
        if (hours <= 0) {
            toast.error("Некорректная продолжительность");
            return;
        }

        try {
            setBookingLoading(true);
            const startUTC = selectedStartSlot.toISOString();

            const res = await unauthenticatedApi.post(API_URLS.bookings, {
                name: name.trim(),
                phone: phone.trim(),
                bathhouse: currentRoom.bathhouse,
                room: currentRoom.id,
                start_time: startUTC,
                hours,
                extra_items_data: selectedItems,
                skip_sms: true,
            });

            setConfirmedBookingDetails(res.data);
            setCountdown(570);

            toast.success("Бронирование создано без подтверждения SMS");
            setShowConfirmPhoneModal(false);
            resetSelections();
        } catch {
            toast.error("Не удалось создать бронирование");
        } finally {
            setBookingLoading(false);
        }
    };

    const confirmPhoneAndBook = async () => {
        if (!selectedStartSlot || !selectedEndSlot || !currentRoom) return;

        if (!name.trim()) {
            toast.error("Пожалуйста, введите имя");
            return;
        }
        if (!phone.trim().startsWith("+7")) {
            toast.error("Телефон должен начинаться с +7");
            return;
        }

        const hours = selectedEndSlot.diff(selectedStartSlot, "hour") + 1;
        if (hours <= 0) {
            toast.error("Некорректная продолжительность");
            return;
        }

        try {
            setBookingLoading(true);
            const startUTC = selectedStartSlot.toISOString();

            const res = await unauthenticatedApi.post(API_URLS.bookings, {
                name: name.trim(),
                phone: phone.trim(),
                bathhouse: currentRoom.bathhouse,
                room: currentRoom.id,
                start_time: startUTC,
                hours,
                extra_items_data: selectedItems,
            });

            setBookingId(res.data.id);
            setConfirmedBookingDetails(res.data);
            setShowConfirmPhoneModal(false);
            setShowSmsCodeModal(true);

            toast.success("Бронирование создано! Введите SMS код для подтверждения.");
        } catch {
            toast.error("Не удалось создать бронирование");
        } finally {
            setBookingLoading(false);
        }
    };

    const confirmSmsCode = async () => {
        if (!smsCode.match(/^\d{4}$/)) {
            toast.error("Введите корректный 4-значный код");
            return;
        }

        try {
            setBookingLoading(true);

            await unauthenticatedApi.post(
                `${API_URLS.bookings}${bookingId}/confirm-booking-sms/?sms_code=${smsCode}`
            );

            toast.success("Бронирование подтверждено!");
            resetSelections();
            setShowSmsCodeModal(false);
        } catch {
            toast.error("Неверный код или ошибка подтверждения");
        } finally {
            setBookingLoading(false);
        }
    };

    const resetSelections = () => {
        setSelectedStartSlot(null);
        setSelectedEndSlot(null);
        setCurrentRoom(null);
        setEstimatedPrice(0);
        setName("");
        setPhone("");
        setBookingId(null);
        setSmsCode("");
        setSelectedItems([]);
        setItemsTotalPrice(0);
    };

    const getDays = () => {
        const today = dayjs().startOf("day");
        return Array.from({ length: 14 }, (_, i) => {
            const date = today.add(i, "day");
            const label = i === 0
                ? "Сегодня"
                : i === 1
                    ? "Завтра"
                    : i === 2
                        ? "Послезавтра"
                        : date.format("DD.MM");
            return { date, label };
        });
    };

    const generateHourBlocks = (bathhouse, day) => {
        const now = dayjs();
        let startHour = 0;
        let endHour = 23;

        if (!bathhouse.is_24_hours && bathhouse.start_of_work && bathhouse.end_of_work) {
            startHour = dayjs(`1970-01-01T${bathhouse.start_of_work}`).hour();
            endHour = dayjs(`1970-01-01T${bathhouse.end_of_work}`).hour();

            if (endHour < startHour) {
                endHour += 24;
            }
        }

        if (day.isSame(now, "day")) {
            startHour = Math.max(startHour, now.hour() + 1);
        }

        return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    };

    const isInRange = (slot) => {
        if (!selectedStartSlot || !selectedEndSlot) return false;
        return (slot.isAfter(selectedStartSlot) && slot.isBefore(selectedEndSlot)) ||
            slot.isSame(selectedStartSlot) ||
            slot.isSame(selectedEndSlot);
    };

    const days = getDays();
    const filteredBathhouses = bathhouses.filter((b) =>
        (b.name || "").toLowerCase().includes(query.trim().toLowerCase())
    );

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

    const totalPrice = estimatedPrice + itemsTotalPrice;
    const fmt = (n) => Number(n).toLocaleString();

    // Group items by category
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

    const selectedItemsDetailed = selectedItems
        .map(si => {
            const mi = menuItems.find(m => m.id === si.item);
            if (!mi) return null;
            return {
                id: si.item,
                name: mi.name,
                price: Number(mi.price),
                quantity: si.quantity,
                sum: Number(mi.price) * si.quantity,
                image: mi.image,
            };
        })
        .filter(Boolean);

    useEffect(() => {
        if (countdown === null || countdown <= 0) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [countdown]);

    // Check if time is selected
    const isTimeSelected = selectedStartSlot && selectedEndSlot && currentRoom;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {!singleBathhouse && (
                    <div className="flex items-center justify-between gap-4">

                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Поиск по названию…"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                )}

                {singleBathhouse && (
                    <div className="bg-white shadow-sm sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto py-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigate("/booking")}
                                        className="bg-green-500 text-white px-6 py-3 rounded-md font-medium hover:bg-green-600 transition"
                                    >
                                        Назад
                                    </button>
                                    {isTimeSelected && (
                                        <button
                                            onClick={resetSelections}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Сбросить
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                                    <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                        <span className="text-blue-700 font-medium text-sm sm:text-base">
                                            Итого: {totalPrice.toLocaleString()} ₸
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleBook}
                                        className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                                        disabled={bookingLoading || !selectedStartSlot}
                                    >
                                        Забронировать
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`space-y-6 mt-6 ${!singleBathhouse ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" : ""}`}>
                    {filteredBathhouses.map((bathhouse) => (
                        <div key={bathhouse.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                            <button
                                onClick={() => toggleBathhouse(bathhouse.id)}
                                className="w-full text-left p-4 sm:p-6 hover:bg-gray-50 transition-colors flex-1 flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{bathhouse.name}</h2>
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">{bathhouse.address}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">
                                                {bathhouse.is_24_hours ? "Круглосуточно" :
                                                    `${dayjs(`1970-01-01T${bathhouse.start_of_work}`).format("HH:mm")} - ${dayjs(`1970-01-01T${bathhouse.end_of_work}`).format("HH:mm")}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-indigo-600 font-medium text-sm sm:text-base ml-4">
                                        {singleBathhouse ?
                                            (expandedBathhouseId === bathhouse.id ? "Скрыть комнаты" : "Посмотреть комнаты") :
                                            (expandedBathhouseId === bathhouse.id ? "Скрыть" : "Посмотреть")
                                        }
                                    </div>
                                </div>
                            </button>

                            {expandedBathhouseId === bathhouse.id && bathhouse.rooms && (
                                <div className="p-4 sm:p-6 pt-0">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        {bathhouse.rooms.map((room) => {
                                            // Hide other rooms if time is selected and this isn't the selected room
                                            if (isTimeSelected && currentRoom && currentRoom.id !== room.id) {
                                                return null;
                                            }

                                            return (
                                                <div key={room.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                                                    <div className="p-4 sm:p-6 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                                                    {room.is_sauna
                                                                        ? `Сауна ${room.room_number}`
                                                                        : room.is_bathhouse
                                                                            ? `Баня ${room.room_number}`
                                                                            : `Комната ${room.room_number}`}
                                                                </h3>
                                                                <p className="text-gray-500 text-sm sm:text-base">{room.capacity} чел.</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg sm:text-xl font-bold text-blue-600">
                                                                    {parseInt(room.price_per_hour).toLocaleString()} ₸
                                                                </div>
                                                                <div className="text-xs sm:text-sm text-gray-500">в час</div>
                                                            </div>
                                                        </div>

                                                        {/* Amenities */}
                                                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                                                            {room.has_pool && <span className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full">Бассейн</span>}
                                                            {room.has_recreation_area && <span className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full">Зона отдыха</span>}
                                                            {room.has_steam_room && <span className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full">Парная</span>}
                                                            {room.has_washing_area && <span className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full">Мойка</span>}
                                                            {room.heated_by_wood && <span className="bg-green-50 px-2 sm:px-3 py-1 rounded-full">На дровах</span>}
                                                            {room.heated_by_coal && <span className="bg-gray-50 px-2 sm:px-3 py-1 rounded-full">На углях</span>}
                                                        </div>

                                                        <button
                                                            onClick={() => fetchRoomBookings(room.id)}
                                                            className="w-full bg-indigo-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
                                                        >
                                                            {openedRoomId === room.id ? 'Закрыть' : 'Проверить доступность'}
                                                        </button>

                                                        {openedRoomId === room.id && (
                                                            <>
                                                                {/* Day selection */}
                                                                <div className="overflow-x-auto my-4">
                                                                    <div className="flex space-x-2 w-max">
                                                                        {days.map((day, index) => (
                                                                            <button
                                                                                key={index}
                                                                                onClick={() => setSelectedDay(index)}
                                                                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${selectedDay === index
                                                                                    ? 'bg-indigo-600 text-white'
                                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                                    }`}
                                                                            >
                                                                                {day.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Time slots */}
                                                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                                                    {generateHourBlocks(bathhouse, days[selectedDay].date).map((hour) => {
                                                                        const slotStart = days[selectedDay].date.hour(hour).minute(0).second(0);
                                                                        const slotEnd = slotStart.add(1, "hour");
                                                                        const booked = isSlotBooked(currentRoomBookings, slotStart, slotEnd);

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
                                                                                key={hour}
                                                                                disabled={booked || bookingLoading}
                                                                                onClick={() => handleSlotClick(slotStart, room)}
                                                                                className={buttonClass}
                                                                            >
                                                                                {slotStart.format("HH:mm")}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {/* Additional services */}
                                                                {Object.keys(groupedItems).length > 0 && (
                                                                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mt-6">
                                                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Дополнительные услуги</h3>
                                                                        <div className="space-y-6">
                                                                            {Object.entries(groupedItems).map(([categoryId, categoryData]) => (
                                                                                <div key={categoryId}>
                                                                                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                                                                                        {categoryData.name}
                                                                                    </h4>
                                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                                                        {categoryData.items.map((item) => {
                                                                                            const selected = selectedItems.find(it => it.item === item.id)?.quantity || 0;
                                                                                            return (
                                                                                                <div key={item.id} className="bg-gray-50 rounded-xl p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                                                                                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                                                                                        {item.image && (
                                                                                                            <div className="relative flex-shrink-0">
                                                                                                                <img
                                                                                                                    src={item.image}
                                                                                                                    alt={item.name}
                                                                                                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                                                                                                                />
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <div className="flex-1 min-w-0">
                                                                                                            <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h5>
                                                                                                            <p className="text-sm text-gray-500 mb-2">{Number(item.price).toLocaleString()} ₸</p>
                                                                                                            <div className="flex items-center space-x-2">
                                                                                                                {selected > 0 && (
                                                                                                                    <>
                                                                                                                        <button
                                                                                                                            onClick={() => handleItemQuantityChange(item.id, Math.max(selected - 1, 0))}
                                                                                                                            className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors text-sm"
                                                                                                                        >
                                                                                                                            −
                                                                                                                        </button>
                                                                                                                        <span className="w-6 text-center font-medium">{selected}</span>
                                                                                                                    </>
                                                                                                                )}
                                                                                                                <button
                                                                                                                    onClick={() => handleItemQuantityChange(item.id, selected + 1)}
                                                                                                                    className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors text-sm"
                                                                                                                >
                                                                                                                    +
                                                                                                                </button>
                                                                                                            </div>
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
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Phone confirmation modal */}
            {showConfirmPhoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmPhoneModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-[fadeIn_.15s_ease-out]">
                        <button
                            onClick={() => setShowConfirmPhoneModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ваше имя"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+7..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                            {currentRoom && (
                                <p>
                                    <strong>Комната:</strong> {currentRoom.room_number}
                                </p>
                            )}
                            {selectedStartSlot && (
                                <p>
                                    <strong>Начало:</strong> {selectedStartSlot.format("DD.MM.YYYY HH:mm")}
                                </p>
                            )}
                            {selectedStartSlot && selectedEndSlot && (
                                <p>
                                    <strong>Длительность:</strong>{" "}
                                    {selectedEndSlot.diff(selectedStartSlot, "hour") + 1} ч.
                                </p>
                            )}
                            <p>
                                <strong>Стоимость:</strong> {fmt(totalPrice)}₸
                            </p>
                        </div>

                        {selectedItemsDetailed.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-2">Дополнительные услуги:</h4>
                                <div className="max-h-32 overflow-y-auto pr-1 space-y-1">
                                    {selectedItemsDetailed.map((it) => (
                                        <div key={it.id} className="flex justify-between text-sm">
                                            <span>{it.name} × {it.quantity}</span>
                                            <span>{fmt(it.sum)}₸</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mt-6">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmPhoneModal(false)}
                                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Отмена
                                </button>
                                {/* <button
                                    onClick={confirmPhoneAndBook}
                                    disabled={bookingLoading}
                                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                                >
                                    {bookingLoading ? "Отправка..." : "Подтвердить по SMS"}
                                </button> */}
                            </div>
                            {/* <button
                                onClick={bookWithoutSms}
                                disabled={bookingLoading}
                                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 disabled:bg-gray-100 transition"
                            >
                                Продолжить без SMS
                            </button> */}
                            <button
                                onClick={bookWithoutSms}
                                disabled={bookingLoading}
                                className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                            >
                                Забронировать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SMS code modal */}
            {showSmsCodeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowSmsCodeModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                        <button
                            onClick={() => setShowSmsCodeModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-4">
                            <KeyRound className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                            <h3 className="text-xl font-bold text-gray-900">Введите SMS-код</h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Код отправлен на {phone}.
                            </p>
                        </div>

                        <input
                            type="text"
                            value={smsCode}
                            onChange={(e) => {
                                if (/^\d{0,4}$/.test(e.target.value)) {
                                    setSmsCode(e.target.value);
                                }
                            }}
                            placeholder="____"
                            inputMode="numeric"
                            maxLength={4}
                            className="w-full tracking-widest text-center text-2xl py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                        />

                        <button
                            onClick={() => {
                                setShowSmsCodeModal(false);
                                toast.success("Бронирование создано, но не подтверждено. Обратитесь к администратору.");
                                setCountdown(570);
                            }}
                            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition mb-3"
                        >
                            Без SMS
                        </button>

                        <button
                            onClick={confirmSmsCode}
                            disabled={smsCode.length !== 4 || bookingLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                        >
                            {bookingLoading ? "Проверка..." : "Подтвердить"}
                        </button>
                    </div>
                </div>
            )}

            {/* Booking confirmation modal */}
            {confirmedBookingDetails && !showSmsCodeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => {
                        setConfirmedBookingDetails(null);
                        if (currentRoom?.id) fetchRoomBookings(currentRoom.id);
                        resetSelections();
                    }} />

                    <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                        <button
                            onClick={() => {
                                setConfirmedBookingDetails(null);
                                if (currentRoom?.id) fetchRoomBookings(currentRoom.id);
                                resetSelections();
                            }}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-4">
                            {/* {countdown !== null ? (
                                <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded p-3 mb-4 text-sm text-center">
                                    <Clock className="w-6 h-6 inline-block text-yellow-800 mr-2" />
                                    Мы ожидаем подтверждение. Пожалуйста, позвоните по номеру <strong>{bathhouses[0]?.phone}</strong> для подтверждения брони.<br />
                                    <span className="font-semibold">
                                        Осталось времени: {Math.floor(countdown / 60)} мин. {(countdown % 60)} сек.
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                                    <h3 className="text-xl font-bold text-gray-900">Бронирование подтверждено!</h3>
                                </>
                            )} */}
                            <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                            <h3 className="text-xl font-bold text-gray-900">Бронирование подтверждено!</h3>

                            <p className="text-sm text-gray-600 mt-1">
                                Сделайте скриншот данных — покажите при визите.
                            </p>
                        </div>

                        <div className="space-y-2 text-sm text-gray-800 mb-4">
                            <p><strong>Имя:</strong> {confirmedBookingDetails.name}</p>
                            <p><strong>Телефон:</strong> {confirmedBookingDetails.phone}</p>
                            <p><strong>Сауна:</strong> {confirmedBookingDetails.bathhouse?.name}</p>
                            <p><strong>Комната:</strong> {confirmedBookingDetails.room?.room_number} (до {confirmedBookingDetails.room?.capacity} чел.)</p>
                            <p><strong>Начало:</strong> {dayjs(confirmedBookingDetails.start_time).format("DD.MM.YYYY HH:mm")}</p>
                            <p><strong>Длительность:</strong> {confirmedBookingDetails.hours} ч.</p>
                        </div>

                        {Array.isArray(confirmedBookingDetails.extra_items) && confirmedBookingDetails.extra_items.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-2">Дополнительные позиции:</h4>
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
                                            {confirmedBookingDetails.extra_items.map((ex) => (
                                                <tr key={ex.id} className="bg-white">
                                                    <td className="px-3 py-2">
                                                        {ex.item?.name || "—"}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">{ex.quantity}</td>
                                                    <td className="px-3 py-2 text-right">{fmt(ex.price_sum)}₸</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between text-sm">
                                <span>Комната:</span>
                                <span>{fmt(confirmedBookingDetails.room_full_price)}₸</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span>Доп. услуги:</span>
                                <span>
                                    {fmt(
                                        (confirmedBookingDetails.final_price || 0) -
                                        (confirmedBookingDetails.room_full_price || 0)
                                    )}₸
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-bold mt-2">
                                <span>Итого:</span>
                                <span className="text-green-600">{fmt(confirmedBookingDetails.final_price)}₸</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setConfirmedBookingDetails(null);
                                if (currentRoom?.id) fetchRoomBookings(currentRoom.id);
                                resetSelections();
                                window.location.reload();
                            }}
                            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                            Готово
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}