import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
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
            bonus_percentage: null,
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
            <div className="flex items-center justify-center min-h-screen p-4 relative">
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all">
                    <DialogTitle className="text-xl font-semibold mb-4 text-gray-900">
                        {is_Update ? "Обновить баню" : "Создать новую баню"}
                    </DialogTitle>

                    {/* Name */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                    <input
                        type="text"
                        value={bathhouseDetails.name}
                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, name: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Address */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                    <input
                        type="text"
                        value={bathhouseDetails.address}
                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, address: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Description */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                    <textarea
                        value={bathhouseDetails.description}
                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, description: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={2}
                    />

                    {/* Phone */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон (+7...)</label>
                    <input
                        type="tel"
                        placeholder="+7..."
                        value={bathhouseDetails.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Bonus System percentage */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Процент бонусной системы</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={bathhouseDetails.bonus_percentage || ""}
                        onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, bonus_percentage: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* 24/7 Checkbox */}
                    <label className="flex items-center mb-3 text-gray-700">
                        <input
                            type="checkbox"
                            checked={bathhouseDetails.is_24_hours}
                            onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, is_24_hours: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Работает круглосуточно
                    </label>

                    {/* Start/End of Work */}
                    {!bathhouseDetails.is_24_hours && (
                        <>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Начало работы</label>
                            <input
                                type="time"
                                value={bathhouseDetails.start_of_work}
                                onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, start_of_work: e.target.value })}
                                className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />

                            <label className="block text-sm font-medium text-gray-700 mb-1">Конец работы</label>
                            <input
                                type="time"
                                value={bathhouseDetails.end_of_work}
                                onChange={(e) => setBathhouseDetails({ ...bathhouseDetails, end_of_work: e.target.value })}
                                className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </>
                    )}

                    {/* Owner */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Владелец</label>
                    <Combobox value={bathhouseDetails.owner} onChange={(value) => setBathhouseDetails({ ...bathhouseDetails, owner: value })}>
                        <div className="relative mb-4">
                            <ComboboxInput
                                className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Найти владельца..."
                                onChange={(e) => setQuery(e.target.value)}
                                displayValue={(ownerId) => users.find((u) => u.id === ownerId)?.username || ""}
                            />
                            <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto bg-white border rounded shadow z-10">
                                {filteredUsers.length === 0 && (
                                    <div className="p-2 text-gray-500">Пользователи не найдены.</div>
                                )}
                                {filteredUsers.map((user) => (
                                    <ComboboxOption
                                        key={user.id}
                                        value={user.id}
                                        className={({ active }) =>
                                            `p-2 cursor-pointer ${active ? "bg-green-500 text-white" : "text-gray-700"}`
                                        }
                                    >
                                        {user.username}
                                    </ComboboxOption>
                                ))}
                            </ComboboxOptions>
                        </div>
                    </Combobox>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white py-2 px-4 rounded-md w-full hover:bg-green-600 transition"
                    >
                        {is_Update ? "Обновить" : "Создать"}
                    </button>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
