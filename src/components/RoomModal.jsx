import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function RoomModal({
    isOpen,
    setIsOpen,
    roomDetails,
    setRoomDetails,
    onSubmit,
    isUpdate = false,
    onDelete
}) {
    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 relative">
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all">
                    <DialogTitle className="text-xl font-semibold mb-4 text-gray-900">
                        {isUpdate ? "Обновить" : "Создать"}
                    </DialogTitle>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Тип помещения</label>
                    <div className="flex items-center mb-3">
                        <label className="flex items-center mr-4">
                            <input
                                type="radio"
                                name="roomType"
                                value="sauna"
                                checked={roomDetails.is_sauna}
                                onChange={() => setRoomDetails({ ...roomDetails, is_sauna: true, is_bathhouse: false })}
                                className="mr-2"
                            />
                            Сауна
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="roomType"
                                value="bathhouse"
                                checked={roomDetails.is_bathhouse}
                                onChange={() => setRoomDetails({ ...roomDetails, is_sauna: false, is_bathhouse: true })}
                                className="mr-2"
                            />
                            Баня
                        </label>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Номер</label>
                    <input
                        type="text"
                        value={roomDetails.room_number}
                        onChange={(e) => setRoomDetails({ ...roomDetails, room_number: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <label className="block text-sm font-medium text-gray-700 mb-1">Вместимость</label>
                    <input
                        type="text"
                        value={roomDetails.capacity}
                        onChange={(e) => setRoomDetails({ ...roomDetails, capacity: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена за час (₸)</label>
                    <input
                        type="number"
                        value={roomDetails.price_per_hour}
                        onChange={(e) => setRoomDetails({ ...roomDetails, price_per_hour: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена в праздники и выходные (₸)</label>
                    <input
                        type="number"
                        value={roomDetails.holiday_price_per_hour}
                        onChange={(e) => setRoomDetails({ ...roomDetails, holiday_price_per_hour: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />



                    <label className="flex items-center mb-3 text-gray-700">
                        <input
                            type="checkbox"
                            checked={roomDetails.is_available}
                            onChange={(e) => setRoomDetails({ ...roomDetails, is_available: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Доступно
                    </label>

                    <label className="flex items-center mb-5 text-gray-700">
                        <input
                            type="checkbox"
                            checked={roomDetails.has_pool}
                            onChange={(e) => setRoomDetails({ ...roomDetails, has_pool: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Есть бассейн
                    </label>

                    <label className="flex items-center mb-5 text-gray-700">
                        <input
                            type="checkbox"
                            checked={roomDetails.has_recreation_area}
                            onChange={(e) => setRoomDetails({ ...roomDetails, has_recreation_area: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Есть зона отдыха
                    </label>

                    <label className="flex items-center mb-5 text-gray-700">
                        <input
                            type="checkbox"
                            checked={roomDetails.has_steam_room}
                            onChange={(e) => setRoomDetails({ ...roomDetails, has_steam_room: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Есть парная
                    </label>

                    <label className="flex items-center mb-5 text-gray-700">
                        <input
                            type="checkbox"
                            checked={roomDetails.has_washing_area}
                            onChange={(e) => setRoomDetails({ ...roomDetails, has_washing_area: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Есть мойка
                    </label>

                    <label className="flex items-center mb-5 text-gray-700">
                        <input
                            type="checkbox"
                            checked={roomDetails.heated_by_wood}
                            onChange={(e) => setRoomDetails({ ...roomDetails, heated_by_wood: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Отопление дровами
                    </label>

                    <label className="flex items-center mb-5 text-gray-700">
                        <input
                            type="checkbox"
                            checked={roomDetails.heated_by_coal}
                            onChange={(e) => setRoomDetails({ ...roomDetails, heated_by_coal: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Отопление углем
                    </label>

                    <button
                        onClick={() => {
                            onSubmit(roomDetails);
                            setIsOpen(false);
                        }}
                        className="bg-green-500 text-white py-2 px-4 rounded-md w-full hover:bg-green-600 transition mb-2"
                    >
                        {isUpdate ? "Обновить" : "Создать"}
                    </button>

                    {isUpdate && onDelete && (
                        <button
                            onClick={() => {
                                onDelete(roomDetails.id);
                                setIsOpen(false);
                            }}
                            className="bg-red-500 text-white py-2 px-4 rounded-md w-full hover:bg-red-600 transition"
                        >
                            Удалить
                        </button>
                    )}
                </DialogPanel>
            </div>
        </Dialog>
    );
}
