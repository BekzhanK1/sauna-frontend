import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { X, Building2, MapPin, Phone, Clock, User, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BathhouseModal({
    isBathModalOpen,
    setIsBathModalOpen,
    bathhouseDetails,
    setBathhouseDetails,
    users,
    filteredUsers,
    setQuery,
    is_Update = false,
    createBathhouse,
    updateBathhouse,
}) {
    const onClose = () => {
        setIsBathModalOpen(false);
        setBathhouseDetails({
            id: null,
            name: "",
            address: "",
            owner: "",
            description: "",
            phone: "",
            is_24_hours: false,
            bonus_threshold_amount: null,
            lower_bonus_percentage: null,
            higher_bonus_percentage: null,
            bonus_accrual_enabled: true,
            happy_hours_enabled: false,
            birthday_discount_enabled: false,
            bonus_hour_enabled: false,
            happy_hours_start_time: "",
            happy_hours_end_time: "",
            happy_hours_discount_percentage: null,
            happy_hours_days: [],
            birthday_discount_percentage: null,
            min_hours_for_bonus: null,
            bonus_hour_days: [],
            bonus_hours_awarded: null,
            start_of_work: "",
            end_of_work: "",
        });
    }

    const handlePhoneChange = (value) => {
        setBathhouseDetails({ ...bathhouseDetails, phone: value });
    };

    const handleSubmit = () => {
        if (!bathhouseDetails.phone.startsWith("+7")) {
            toast.error("Номер телефона должен начинаться с +7");
            return;
        }

        if (is_Update) {
            updateBathhouse();
        } else {
            createBathhouse();
        }
    };

    return (
        <Dialog open={isBathModalOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                                {is_Update ? "Обновить баню" : "Создать новую баню"}
                            </DialogTitle>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                        {/* Basic Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Основная информация</h3>

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Building2 className="h-4 w-4" />
                                    <span>Название</span>
                                </label>
                                <input
                                    type="text"
                                    value={bathhouseDetails.name}
                                    onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Введите название бани"
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>Адрес</span>
                                </label>
                                <input
                                    type="text"
                                    value={bathhouseDetails.address}
                                    onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Введите адрес"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Описание</label>
                                <textarea
                                    value={bathhouseDetails.description}
                                    onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                    rows={3}
                                    placeholder="Опишите особенности бани"
                                />
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Контактная информация</h3>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Phone className="h-4 w-4" />
                                    <span>Телефон</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+7 (___) ___-__-__"
                                    value={bathhouseDetails.phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Owner */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>Владелец</span>
                                </label>
                                <Combobox value={bathhouseDetails.owner} onChange={(value) => setBathhouseDetails({ ...bathhouseDetails, owner: value })}>
                                    <div className="relative">
                                        <ComboboxInput
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="Найти владельца..."
                                            onChange={(e) => setQuery(e.target.value)}
                                            displayValue={(ownerId) => users.find((u) => u.id === ownerId)?.username || ""}
                                        />
                                        <ComboboxOptions className="absolute mt-2 max-h-60 w-full overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                            {filteredUsers.length === 0 && (
                                                <div className="p-4 text-gray-500 text-center">Пользователи не найдены</div>
                                            )}
                                            {filteredUsers.map((user) => (
                                                <ComboboxOption
                                                    key={user.id}
                                                    value={user.id}
                                                    className={({ active }) =>
                                                        `px-4 py-3 cursor-pointer transition-colors ${active ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"
                                                        }`
                                                    }
                                                >
                                                    {user.username}
                                                </ComboboxOption>
                                            ))}
                                        </ComboboxOptions>
                                    </div>
                                </Combobox>
                            </div>
                        </div>

                        {/* Business Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Бизнес информация</h3>

                            {/* Enable/Disable Toggles */}
                            <div className="space-y-3">
                                <h4 className="text-md font-medium text-gray-800">Включить функции</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="bonus_accrual_enabled"
                                            checked={bathhouseDetails.bonus_accrual_enabled}
                                            onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, bonus_accrual_enabled: e.target.checked })}
                                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="bonus_accrual_enabled" className="text-sm font-medium text-gray-700">
                                            Начисление бонусов
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="happy_hours_enabled"
                                            checked={bathhouseDetails.happy_hours_enabled}
                                            onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, happy_hours_enabled: e.target.checked })}
                                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="happy_hours_enabled" className="text-sm font-medium text-gray-700">
                                            Happy Hours
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="birthday_discount_enabled"
                                            checked={bathhouseDetails.birthday_discount_enabled}
                                            onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, birthday_discount_enabled: e.target.checked })}
                                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="birthday_discount_enabled" className="text-sm font-medium text-gray-700">
                                            Скидка на день рождения
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="bonus_hour_enabled"
                                            checked={bathhouseDetails.bonus_hour_enabled}
                                            onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, bonus_hour_enabled: e.target.checked })}
                                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="bonus_hour_enabled" className="text-sm font-medium text-gray-700">
                                            Бонусный час
                                        </label>
                                    </div>
                                </div>
                            </div>


                            {/* Loyalty Tier Settings */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Порог суммы (₸)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={bathhouseDetails.bonus_threshold_amount || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, bonus_threshold_amount: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="Напр., 100000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">%</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={bathhouseDetails.lower_bonus_percentage || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, lower_bonus_percentage: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="Ниже порога, %"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">%</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={bathhouseDetails.higher_bonus_percentage || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, higher_bonus_percentage: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="От порога и выше, %"
                                    />
                                </div>
                            </div>

                            {/* Happy Hours Days selector */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Дни недели для «Happy Hours»</label>
                                <div className="flex flex-wrap gap-2">
                                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((d) => {
                                        const active = Array.isArray(bathhouseDetails.happy_hours_days) && bathhouseDetails.happy_hours_days.includes(d);
                                        return (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => {
                                                    const days = new Set(bathhouseDetails.happy_hours_days || []);
                                                    if (days.has(d)) days.delete(d); else days.add(d);
                                                    setBathhouseDetails({ ...bathhouseDetails, happy_hours_days: Array.from(days) })
                                                }}
                                                className={`px-3 py-1 rounded-lg border ${active ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}
                                            >
                                                {d}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Promotions Settings */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Happy Hours начало</label>
                                    <input
                                        type="time"
                                        value={bathhouseDetails.happy_hours_start_time || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, happy_hours_start_time: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Happy Hours конец</label>
                                    <input
                                        type="time"
                                        value={bathhouseDetails.happy_hours_end_time || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, happy_hours_end_time: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Скидка Happy Hours, %</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={bathhouseDetails.happy_hours_discount_percentage || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, happy_hours_discount_percentage: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Скидка «День рождения», %</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={bathhouseDetails.birthday_discount_percentage || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, birthday_discount_percentage: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Бонусный час: мин. часы</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={bathhouseDetails.min_hours_for_bonus || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, min_hours_for_bonus: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Бонусный час: +часы</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={bathhouseDetails.bonus_hours_awarded || ""}
                                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, bonus_hours_awarded: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Weekday selector for Bonus Hour */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Дни недели для «Бонусного часа»</label>
                                <div className="flex flex-wrap gap-2">
                                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((d) => {
                                        const active = Array.isArray(bathhouseDetails.bonus_hour_days) && bathhouseDetails.bonus_hour_days.includes(d);
                                        return (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => {
                                                    const days = new Set(bathhouseDetails.bonus_hour_days || []);
                                                    if (days.has(d)) days.delete(d); else days.add(d);
                                                    setBathhouseDetails({ ...bathhouseDetails, bonus_hour_days: Array.from(days) })
                                                }}
                                                className={`px-3 py-1 rounded-lg border ${active ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}
                                            >
                                                {d}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 24/7 Checkbox */}
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="is_24_hours"
                                    checked={bathhouseDetails.is_24_hours}
                                    onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, is_24_hours: e.target.checked })}
                                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_24_hours" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Работает круглосуточно</span>
                                </label>
                            </div>

                            {/* Start/End of Work */}
                            {!bathhouseDetails.is_24_hours && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Начало работы</label>
                                        <input
                                            type="time"
                                            value={bathhouseDetails.start_of_work}
                                            onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, start_of_work: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Конец работы</label>
                                        <input
                                            type="time"
                                            value={bathhouseDetails.end_of_work}
                                            onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, end_of_work: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {is_Update ? "Обновить баню" : "Создать баню"}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
