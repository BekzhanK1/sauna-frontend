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
    const [isBirthday, setIsBirthday] = useState(false);
    const [selectedDay, setSelectedDay] = useState(0);
    const [quickDuration, setQuickDuration] = useState(null);

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
    const [bonusBalance, setBonusBalance] = useState("0");

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

    const checkAndShowPromotions = (startSlot, endSlot, room) => {
        // This function is now simplified - promotions are shown in the preview panel
        // No need for toast notifications or complex logic here
    };

    const handleSlotClick = (slot, room) => {
        if (!selectedStartSlot) {
            setSelectedStartSlot(slot);
            setSelectedEndSlot(slot);
            setCurrentRoom(room);
            setQuickDuration(null);

            const hours = 1;
            const price = hours * parseFloat(room.price_per_hour);
            setEstimatedPrice(price);

            // Check for promotions
            checkAndShowPromotions(slot, slot, room);
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
                setQuickDuration(null);
                const hours = intermediateHours;
                const price = hours * parseFloat(room.price_per_hour);
                setEstimatedPrice(price);

                // Check for promotions
                checkAndShowPromotions(selectedStartSlot, slot, room);
            } else {
                setSelectedStartSlot(slot);
                setSelectedEndSlot(slot);
                setCurrentRoom(room);
                setQuickDuration(null);

                const hours = 1;
                const price = hours * parseFloat(room.price_per_hour);
                setEstimatedPrice(price);

                // Check for promotions
                checkAndShowPromotions(slot, slot, room);
            }
        } else {
            setSelectedStartSlot(slot);
            setSelectedEndSlot(slot);
            setCurrentRoom(room);
            setQuickDuration(null);

            const hours = 1;
            const price = hours * parseFloat(room.price_per_hour);
            setEstimatedPrice(price);

            // Check for promotions
            checkAndShowPromotions(slot, slot, room);
        }
    };

    const handleQuickDuration = (hours) => {
        if (!selectedStartSlot || !currentRoom) return;

        setQuickDuration(hours);
        const endSlot = selectedStartSlot.add(hours - 1, "hour");

        // Check if the range is valid
        let isValidRange = true;
        for (let i = 0; i < hours; i++) {
            const blockStart = selectedStartSlot.add(i, "hour");
            const blockEnd = blockStart.add(1, "hour");

            const booked = isSlotBooked(currentRoomBookings, blockStart, blockEnd);

            if (booked) {
                isValidRange = false;
                break;
            }
        }

        if (isValidRange) {
            setSelectedEndSlot(endSlot);
            const price = hours * parseFloat(currentRoom.price_per_hour);
            setEstimatedPrice(price);
        } else {
            toast.error("Выбранное время занято");
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
                is_birthday: isBirthday,
            });

            setConfirmedBookingDetails(res.data);
            setCountdown(570);

            toast.success("Бронирование создано без подтверждения SMS");
            setShowConfirmPhoneModal(false);
            resetSelections();

            // Fetch bonus balance for the phone number after reset
            try {
                const bonusRes = await unauthenticatedApi.get(API_URLS.bonusSystemBalance, {
                    params: {
                        bathhouse_id: currentRoom.bathhouse,
                        phone: phone.trim(),
                    }
                });
                console.log("result: ", bonusRes);
                setBonusBalance(bonusRes.data.balance);
                console.log("Setting balance to: ", bonusRes.data.balance);
            } catch (err) {
                console.error('Failed to fetch bonus balance:', err);
                setBonusBalance("0");
            }
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
                is_birthday: isBirthday,
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
        setBonusBalance("0");
        setQuickDuration(null);
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
                                        onClick={() => window.location.href = "https://vparu.kz"}
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

                                        {/* Promotion banners */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {bathhouse.happy_hours_enabled && (
                                                <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg text-xs font-medium border border-orange-200">
                                                    <div className="flex items-center gap-1">
                                                        <span>🎉</span>
                                                        <span className="font-bold">Счастливые часы</span>
                                                    </div>
                                                    <div className="text-xs mt-1">
                                                        {bathhouse.happy_hours_discount_percentage}% скидка с {bathhouse.happy_hours_start_time} до {bathhouse.happy_hours_end_time}
                                                    </div>
                                                </div>
                                            )}
                                            {bathhouse.birthday_discount_enabled && (
                                                <div className="bg-pink-100 text-pink-800 px-3 py-2 rounded-lg text-xs font-medium border border-pink-200">
                                                    <div className="flex items-center gap-1">
                                                        <span>🎂</span>
                                                        <span className="font-bold">День рождения</span>
                                                    </div>
                                                    <div className="text-xs mt-1">
                                                        {bathhouse.birthday_discount_percentage}% скидка в день рождения
                                                    </div>
                                                </div>
                                            )}
                                            {bathhouse.bonus_hour_enabled && (
                                                <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-xs font-medium border border-green-200">
                                                    <div className="flex items-center gap-1">
                                                        <span>⏰</span>
                                                        <span className="font-bold">Час в подарок</span>
                                                    </div>
                                                    <div className="text-xs mt-1">
                                                        +{bathhouse.bonus_hours_awarded}ч бесплатно при бронировании от {bathhouse.min_hours_for_bonus}ч
                                                    </div>
                                                </div>
                                            )}
                                            {bathhouse.bonus_accrual_enabled && (
                                                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-xs font-medium border border-blue-200">
                                                    <div className="flex items-center gap-1">
                                                        <span>💰</span>
                                                        <span className="font-bold">Бонусная программа</span>
                                                    </div>
                                                    <div className="text-xs mt-1">
                                                        {bathhouse.lower_bonus_percentage}% до {bathhouse.bonus_threshold_amount}₸, {bathhouse.higher_bonus_percentage}% свыше
                                                    </div>
                                                </div>
                                            )}
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

                                                                {/* Time selection summary */}
                                                                {selectedStartSlot && (
                                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <div>
                                                                                <h4 className="font-semibold text-blue-900 mb-1">Выбранное время</h4>
                                                                                <div className="text-sm text-blue-700">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Clock className="w-4 h-4" />
                                                                                        <span>
                                                                                            {selectedStartSlot.format("DD.MM.YYYY HH:mm")} - {selectedEndSlot.add(1, 'hour').format("HH:mm")}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="mt-1">
                                                                                        <span className="font-medium">
                                                                                            {selectedEndSlot.diff(selectedStartSlot, "hour") + 1} ч.
                                                                                        </span>
                                                                                        <span className="text-blue-600 ml-2">
                                                                                            {parseInt(room.price_per_hour).toLocaleString()} ₸/час
                                                                                        </span>
                                                                                    </div>
                                                                                    {/* Promo messages */}
                                                                                    {(() => {
                                                                                        const bath = bathhouse;
                                                                                        const pct = Number(bath?.happy_hours_discount_percentage || 0);
                                                                                        const startStr = bath?.happy_hours_start_time;
                                                                                        const endStr = bath?.happy_hours_end_time;
                                                                                        const hhDays = Array.isArray(bath?.happy_hours_days) ? bath.happy_hours_days : [];
                                                                                        const hhEnabled = bath?.happy_hours_enabled;
                                                                                        let happy = false;
                                                                                        if (hhEnabled && pct && startStr && endStr && selectedStartSlot.isSame(selectedEndSlot, 'day')) {
                                                                                            const startWin = dayjs(`1970-01-01T${startStr}`);
                                                                                            const endWin = dayjs(`1970-01-01T${endStr}`);
                                                                                            const inStart = selectedStartSlot.hour() >= startWin.hour();
                                                                                            const inEnd = selectedEndSlot.add(1, 'hour').hour() <= endWin.hour();
                                                                                            const weekdayStr = selectedStartSlot.format('dddd').toUpperCase();
                                                                                            const dayOk = hhDays.length === 0 || hhDays.includes(weekdayStr);
                                                                                            happy = inStart && inEnd && dayOk;
                                                                                        }
                                                                                        if (happy) {
                                                                                            return (
                                                                                                <div className="mt-2 text-green-700">
                                                                                                    Вы получили скидку Happy Hours — {pct}%!
                                                                                                </div>
                                                                                            );
                                                                                        }
                                                                                        const bonusEnabled = bath?.bonus_hour_enabled;
                                                                                        const minHours = Number(bath?.min_hours_for_bonus || 0);
                                                                                        const days = Array.isArray(bath?.bonus_hour_days) ? bath.bonus_hour_days : [];
                                                                                        const award = Number(bath?.bonus_hours_awarded || 0);
                                                                                        const hours = selectedEndSlot.diff(selectedStartSlot, 'hour') + 1;
                                                                                        const weekdayStr2 = selectedStartSlot.format('dddd').toUpperCase();
                                                                                        const bonus = bonusEnabled && award > 0 && hours >= minHours && days.includes(weekdayStr2);
                                                                                        if (bonus) {
                                                                                            return (
                                                                                                <div className="mt-2 text-green-700">
                                                                                                    Вы получили +1 час по акции «Бонусный час»!
                                                                                                </div>
                                                                                            );
                                                                                        }
                                                                                        return null;
                                                                                    })()}
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedStartSlot(null);
                                                                                    setSelectedEndSlot(null);
                                                                                    setCurrentRoom(null);
                                                                                    setQuickDuration(null);
                                                                                    setEstimatedPrice(0);
                                                                                }}
                                                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                                            >
                                                                                <X className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Quick duration buttons */}
                                                                {selectedStartSlot && !selectedEndSlot && (
                                                                    <div className="mb-4">
                                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Быстрый выбор продолжительности:</h4>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {[1, 2, 3, 4, 6, 8].map((hours) => (
                                                                                <button
                                                                                    key={hours}
                                                                                    onClick={() => handleQuickDuration(hours)}
                                                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${quickDuration === hours
                                                                                        ? 'bg-blue-600 text-white'
                                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                                        }`}
                                                                                >
                                                                                    {hours} ч.
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Time slots */}
                                                                <div className="mb-2">
                                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                                        {selectedStartSlot ? "Выберите время окончания:" : "Выберите время начала:"}
                                                                    </h4>
                                                                    {/* Time slot legend */}
                                                                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                                                                        {/* <div className="flex items-center gap-1">
                                                                            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                                                                            <span>Happy Hours</span>
                                                                        </div> */}
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                                                                            <span>Начало</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                                                            <span>Конец</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                                                                            <span>Диапазон</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                                                                            <span>Занято</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                                                                    {generateHourBlocks(bathhouse, days[selectedDay].date).map((hour) => {
                                                                        const slotStart = days[selectedDay].date.hour(hour).minute(0).second(0);
                                                                        const slotEnd = slotStart.add(1, "hour");
                                                                        const booked = isSlotBooked(currentRoomBookings, slotStart, slotEnd);

                                                                        const isSelectedStart = selectedStartSlot && slotStart.isSame(selectedStartSlot);
                                                                        const isSelectedEnd = selectedEndSlot && slotStart.isSame(selectedEndSlot);
                                                                        const inRange = isInRange(slotStart);

                                                                        // Check if this slot is in Happy Hours
                                                                        const isHappyHours = (() => {
                                                                            if (!bathhouse.happy_hours_enabled || !bathhouse.happy_hours_start_time || !bathhouse.happy_hours_end_time) {
                                                                                return false;
                                                                            }

                                                                            const hhStart = dayjs(`1970-01-01T${bathhouse.happy_hours_start_time}`);
                                                                            const hhEnd = dayjs(`1970-01-01T${bathhouse.happy_hours_end_time}`);
                                                                            const hhDays = Array.isArray(bathhouse.happy_hours_days) ? bathhouse.happy_hours_days : [];
                                                                            const weekdayStr = slotStart.format('dddd').toUpperCase();
                                                                            const dayOk = hhDays.length === 0 || hhDays.includes(weekdayStr);

                                                                            // Simple time comparison - check if slot hour is within range
                                                                            const slotHour = slotStart.hour();
                                                                            const startHour = hhStart.hour();
                                                                            const endHour = hhEnd.hour();

                                                                            let timeInRange = false;
                                                                            if (endHour > startHour) {
                                                                                // Normal case: same day (e.g., 12:00 to 18:00)
                                                                                timeInRange = slotHour >= startHour && slotHour < endHour;
                                                                            } else {
                                                                                // Cross-midnight case: (e.g., 22:00 to 02:00)
                                                                                timeInRange = slotHour >= startHour || slotHour < endHour;
                                                                            }

                                                                            // Debug logging
                                                                            if (slotHour >= 12 && slotHour <= 18) {
                                                                                console.log('Happy Hours Debug:', {
                                                                                    enabled: bathhouse.happy_hours_enabled,
                                                                                    startTime: bathhouse.happy_hours_start_time,
                                                                                    endTime: bathhouse.happy_hours_end_time,
                                                                                    startHour,
                                                                                    endHour,
                                                                                    slotHour,
                                                                                    slotTime: slotStart.format('HH:mm'),
                                                                                    weekdayStr,
                                                                                    hhDays,
                                                                                    dayOk,
                                                                                    timeInRange,
                                                                                    isHappyHours: dayOk && timeInRange
                                                                                });
                                                                            }

                                                                            return dayOk && timeInRange;
                                                                        })();

                                                                        let buttonClass = "w-full text-xs py-3 px-2 rounded-lg font-medium transition-all duration-200 border-2 ";

                                                                        if (booked) {
                                                                            buttonClass += "bg-red-50 text-red-600 border-red-200 cursor-not-allowed opacity-60";
                                                                        } else if (isSelectedStart) {
                                                                            buttonClass += "bg-green-500 text-white border-green-500 shadow-lg transform scale-105";
                                                                        } else if (isSelectedEnd) {
                                                                            buttonClass += "bg-blue-500 text-white border-blue-500 shadow-lg transform scale-105";
                                                                        } else if (inRange) {
                                                                            buttonClass += "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200";
                                                                        } else if (isHappyHours) {
                                                                            buttonClass += "bg-gradient-to-br from-orange-200 to-orange-300 text-orange-900 border-orange-400 hover:from-orange-300 hover:to-orange-400 font-bold shadow-lg animate-pulse";
                                                                        } else {
                                                                            buttonClass += "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700";
                                                                        }

                                                                        return (
                                                                            <button
                                                                                key={hour}
                                                                                disabled={booked || bookingLoading}
                                                                                onClick={() => handleSlotClick(slotStart, room)}
                                                                                className={buttonClass}
                                                                                title={booked ? "Время занято" : `Выбрать ${slotStart.format("HH:mm")}${isHappyHours ? " (Happy Hours)" : ""}`}
                                                                            >
                                                                                <div className="text-center">
                                                                                    <div className="font-semibold">{slotStart.format("HH:mm")}</div>
                                                                                    {isHappyHours && !booked && (
                                                                                        <div className="text-xs opacity-75 mt-1">🎉 HH</div>
                                                                                    )}
                                                                                    {booked && (
                                                                                        <div className="text-xs opacity-75 mt-1">Занято</div>
                                                                                    )}

                                                                                </div>
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

                            {/* Applied promotions preview with animations */}
                            {(() => {
                                const bath = bathhouses.find(b => b.id === currentRoom?.bathhouse);
                                if (!bath || !selectedStartSlot || !selectedEndSlot) return null;

                                const hours = selectedEndSlot.diff(selectedStartSlot, 'hour') + 1;
                                // Convert day to English format to match backend data
                                const dayMap = {
                                    'ПОНЕДЕЛЬНИК': 'MONDAY',
                                    'ВТОРНИК': 'TUESDAY',
                                    'СРЕДА': 'WEDNESDAY',
                                    'ЧЕТВЕРГ': 'THURSDAY',
                                    'ПЯТНИЦА': 'FRIDAY',
                                    'СУББОТА': 'SATURDAY',
                                    'ВОСКРЕСЕНЬЕ': 'SUNDAY'
                                };
                                const weekdayStr = dayMap[selectedStartSlot.format('dddd').toUpperCase()] || selectedStartSlot.format('dddd').toUpperCase();

                                const promotions = [];

                                // Check if Happy Hours applies first
                                let happyHoursApplies = false;
                                if (bath.happy_hours_enabled && bath.happy_hours_discount_percentage > 0) {
                                    const hhStart = dayjs(`1970-01-01T${bath.happy_hours_start_time}`);
                                    const hhEnd = dayjs(`1970-01-01T${bath.happy_hours_end_time}`);
                                    const hhDays = Array.isArray(bath.happy_hours_days) ? bath.happy_hours_days : [];
                                    const dayOk = hhDays.length === 0 || hhDays.includes(weekdayStr);
                                    const inStart = selectedStartSlot.hour() >= hhStart.hour();
                                    const inEnd = selectedEndSlot.hour() < hhEnd.hour();

                                    if (dayOk && inStart && inEnd && selectedStartSlot.isSame(selectedEndSlot, 'day')) {
                                        happyHoursApplies = true;

                                        promotions.push({
                                            type: 'HAPPY_HOURS',
                                            text: `Счастливые часы: ${bath.happy_hours_discount_percentage}% скидка`,
                                            color: 'text-orange-600',
                                            bgColor: 'bg-orange-50',
                                            borderColor: 'border-orange-200',
                                            icon: '🎉'
                                        });
                                    }
                                }

                                // Check Bonus Hour (only if NOT Happy Hours)
                                if (!happyHoursApplies && bath.bonus_hour_enabled && bath.bonus_hours_awarded > 0) {
                                    const minHours = Number(bath.min_hours_for_bonus || 0);
                                    const days = Array.isArray(bath.bonus_hour_days) ? bath.bonus_hour_days : [];

                                    if (hours >= minHours && days.includes(weekdayStr)) {
                                        promotions.push({
                                            type: 'BONUS_HOUR',
                                            text: `Час в подарок: +${bath.bonus_hours_awarded}ч бесплатно`,
                                            color: 'text-green-600',
                                            bgColor: 'bg-green-50',
                                            borderColor: 'border-green-200',
                                            icon: '⏰'
                                        });
                                    }
                                }

                                // Check Birthday (only if NOT Happy Hours)
                                if (!happyHoursApplies && isBirthday && bath.birthday_discount_enabled && bath.birthday_discount_percentage > 0) {
                                    promotions.push({
                                        type: 'BIRTHDAY',
                                        text: `День рождения: ${bath.birthday_discount_percentage}% скидка`,
                                        color: 'text-pink-600',
                                        bgColor: 'bg-pink-50',
                                        borderColor: 'border-pink-200',
                                        icon: '🎂'
                                    });
                                }

                                if (promotions.length === 0) return null;

                                return (
                                    <div className="animate-pulse bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mt-4 border-2 border-blue-200 shadow-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                                                <span className="text-white text-sm">✨</span>
                                            </div>
                                            <h4 className="font-bold text-blue-800 text-lg">Применяемые акции</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {promotions.map((promo, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`${promo.bgColor} ${promo.borderColor} border-2 rounded-lg p-3 transform transition-all duration-300 hover:scale-105 hover:shadow-md`}
                                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl animate-pulse">{promo.icon}</div>
                                                        <div className={`${promo.color} font-bold text-sm`}>
                                                            {promo.text}
                                                        </div>
                                                        <div className="ml-auto">
                                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-ping">
                                                                <span className="text-white text-xs">✓</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Dynamic price calculation with discounts */}
                            {(() => {
                                const bath = bathhouses.find(b => b.id === currentRoom?.bathhouse);
                                if (!bath || !selectedStartSlot || !selectedEndSlot) {
                                    return (
                                        <p>
                                            <strong>Стоимость:</strong> {fmt(totalPrice)}₸
                                        </p>
                                    );
                                }

                                const hours = selectedEndSlot.diff(selectedStartSlot, 'hour') + 1;
                                // Convert day to English format to match backend data
                                const dayMap = {
                                    'ПОНЕДЕЛЬНИК': 'MONDAY',
                                    'ВТОРНИК': 'TUESDAY',
                                    'СРЕДА': 'WEDNESDAY',
                                    'ЧЕТВЕРГ': 'THURSDAY',
                                    'ПЯТНИЦА': 'FRIDAY',
                                    'СУББОТА': 'SATURDAY',
                                    'ВОСКРЕСЕНЬЕ': 'SUNDAY'
                                };
                                const weekdayStr = dayMap[selectedStartSlot.format('dddd').toUpperCase()] || selectedStartSlot.format('dddd').toUpperCase();

                                // Calculate base room price (before any discounts)
                                const roomPricePerHour = currentRoom ? parseFloat(currentRoom.price_per_hour) : 0;
                                const baseRoomPrice = hours * roomPricePerHour;
                                const extraItemsPrice = itemsTotalPrice;
                                const baseTotalPrice = baseRoomPrice + extraItemsPrice;

                                let finalPrice = baseTotalPrice;
                                let discountAmount = 0;
                                let discountText = '';
                                let hoursToCharge = hours;

                                // Check if Happy Hours applies first
                                let happyHoursApplies = false;
                                if (bath.happy_hours_enabled && bath.happy_hours_discount_percentage > 0) {
                                    const hhStart = dayjs(`1970-01-01T${bath.happy_hours_start_time}`);
                                    const hhEnd = dayjs(`1970-01-01T${bath.happy_hours_end_time}`);
                                    const hhDays = Array.isArray(bath.happy_hours_days) ? bath.happy_hours_days : [];
                                    const dayOk = hhDays.length === 0 || hhDays.includes(weekdayStr);
                                    const inStart = selectedStartSlot.hour() >= hhStart.hour();
                                    const inEnd = selectedEndSlot.hour() < hhEnd.hour();

                                    if (dayOk && inStart && inEnd && selectedStartSlot.isSame(selectedEndSlot, 'day')) {
                                        happyHoursApplies = true;
                                        discountAmount = (baseTotalPrice * bath.happy_hours_discount_percentage) / 100;
                                        finalPrice = baseTotalPrice - discountAmount;
                                        discountText = `Счастливые часы (${bath.happy_hours_discount_percentage}%)`;
                                    }
                                }

                                // Check Bonus Hour (only if NOT Happy Hours)
                                let bonusHourApplied = false;
                                if (!happyHoursApplies && bath.bonus_hour_enabled && bath.bonus_hours_awarded > 0) {
                                    const minHours = Number(bath.min_hours_for_bonus || 0);
                                    const days = Array.isArray(bath.bonus_hour_days) ? bath.bonus_hour_days : [];

                                    if (hours >= minHours && days.includes(weekdayStr)) {
                                        const awardedHours = Number(bath.bonus_hours_awarded || 0);
                                        hoursToCharge = Math.max(0, hours - awardedHours);
                                        const newRoomPrice = hoursToCharge * roomPricePerHour;
                                        finalPrice = newRoomPrice + extraItemsPrice;
                                        discountAmount = baseTotalPrice - finalPrice;
                                        discountText = `Час в подарок (+${awardedHours}ч бесплатно)`;
                                        bonusHourApplied = true;
                                    }
                                }

                                // Check Birthday (only if NOT Happy Hours) - can stack with Bonus Hour
                                if (!happyHoursApplies && isBirthday && bath.birthday_discount_enabled && bath.birthday_discount_percentage > 0) {
                                    if (bonusHourApplied) {
                                        // If Bonus Hour was applied, apply birthday discount to the current price
                                        const birthdayDiscount = (finalPrice * bath.birthday_discount_percentage) / 100;
                                        finalPrice = finalPrice - birthdayDiscount;
                                        discountAmount = baseTotalPrice - finalPrice;
                                        discountText = `Час в подарок + День рождения (${bath.birthday_discount_percentage}%)`;
                                    } else {
                                        // If no Bonus Hour, apply birthday discount to base price
                                        discountAmount = (baseTotalPrice * bath.birthday_discount_percentage) / 100;
                                        finalPrice = baseTotalPrice - discountAmount;
                                        discountText = `День рождения (${bath.birthday_discount_percentage}%)`;
                                    }
                                }

                                return (
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">Базовая стоимость:</span>
                                                <span className="text-gray-600">{fmt(baseTotalPrice)}₸</span>
                                            </div>
                                            {discountAmount > 0 && (
                                                <div className="flex justify-between items-center animate-pulse">
                                                    <span className="font-bold text-green-600">Скидка {discountText}:</span>
                                                    <span className="font-bold text-green-600">-{fmt(discountAmount)}₸</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-gray-800">Итого к оплате:</span>
                                                    <span className="text-xl font-bold text-green-600">
                                                        {fmt(finalPrice)}₸
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {(() => {
                            // Check if Happy Hours applies to hide birthday checkbox
                            const bath = bathhouses.find(b => b.id === currentRoom?.bathhouse);
                            if (!bath || !selectedStartSlot || !selectedEndSlot) return null;

                            const hours = selectedEndSlot.diff(selectedStartSlot, 'hour') + 1;
                            const dayMap = {
                                'ПОНЕДЕЛЬНИК': 'MONDAY',
                                'ВТОРНИК': 'TUESDAY',
                                'СРЕДА': 'WEDNESDAY',
                                'ЧЕТВЕРГ': 'THURSDAY',
                                'ПЯТНИЦА': 'FRIDAY',
                                'СУББОТА': 'SATURDAY',
                                'ВОСКРЕСЕНЬЕ': 'SUNDAY'
                            };
                            const weekdayStr = dayMap[selectedStartSlot.format('dddd').toUpperCase()] || selectedStartSlot.format('dddd').toUpperCase();

                            let happyHoursApplies = false;
                            if (bath.happy_hours_enabled && bath.happy_hours_discount_percentage > 0) {
                                const hhStart = dayjs(`1970-01-01T${bath.happy_hours_start_time}`);
                                const hhEnd = dayjs(`1970-01-01T${bath.happy_hours_end_time}`);
                                const hhDays = Array.isArray(bath.happy_hours_days) ? bath.happy_hours_days : [];
                                const dayOk = hhDays.length === 0 || hhDays.includes(weekdayStr);
                                const inStart = selectedStartSlot.hour() >= hhStart.hour();
                                const inEnd = selectedEndSlot.hour() < hhEnd.hour();

                                if (dayOk && inStart && inEnd && selectedStartSlot.isSame(selectedEndSlot, 'day')) {
                                    happyHoursApplies = true;
                                }
                            }

                            // Hide birthday checkbox if Happy Hours applies
                            if (happyHoursApplies) return null;

                            return (
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        id="birthday"
                                        type="checkbox"
                                        checked={isBirthday}
                                        onChange={(e) => setIsBirthday(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="birthday" className="text-sm text-gray-700">
                                        Это мой день рождения
                                    </label>
                                </div>
                            );
                        })()}

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
                            {Array.isArray(confirmedBookingDetails.promotions_applied) && confirmedBookingDetails.promotions_applied.length > 0 && (
                                <div className="mt-2">
                                    {confirmedBookingDetails.promotions_applied.map((p, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-gray-700">
                                            {p.type === 'HAPPY_HOURS' && (
                                                <>
                                                    <span>Скидка «Happy Hours» ({p.percent}%)</span>
                                                    <span>-{fmt(p.amount)}₸</span>
                                                </>
                                            )}
                                            {p.type === 'BIRTHDAY' && (
                                                <>
                                                    <span>Скидка «День рождения» ({p.percent}%)</span>
                                                    <span>-{fmt(p.amount)}₸</span>
                                                </>
                                            )}
                                            {p.type === 'BONUS_HOUR' && (
                                                <>
                                                    <span>Акция «Бонусный час»</span>
                                                    <span>+{p.hours_awarded} ч.</span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-blue-600 font-bold">Бонусы на счету:</span>
                                <span className="text-blue-600 font-bold">{bonusBalance}₸</span>
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