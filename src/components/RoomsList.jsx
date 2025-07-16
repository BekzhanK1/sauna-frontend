import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

export default function RoomsList({ rooms, OnCreate, OnUpdate, OnDelete }) {
    return (
        <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Список помещений</h1>

            <button
                className="mb-6 bg-green-500 text-white py-2 px-5 rounded-md font-medium hover:bg-green-600 transition"
                onClick={OnCreate}
            >
                Создать помещение
            </button>

            {rooms.length === 0 ? (
                <p className="text-gray-500">Сауны/Бани не найдены</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="bg-white rounded-lg shadow p-5 hover:shadow-md transition flex flex-col justify-between"
                        >
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    №{room.room_number} {room.is_sauna ? 'Сауна' : room.is_bathhouse ? 'Баня' : 'Баня'}
                                </h2>
                                <p className="text-gray-700 mb-1">
                                    Вместимость: <span className="font-medium">{room.capacity} человек</span>
                                </p>
                                <p className="text-gray-700 mb-1">
                                    Цена: <span className="font-medium">{Number(room.price_per_hour).toLocaleString()} ₸/час</span>
                                </p>
                                <p className="text-gray-700 mb-1">
                                    Цена в праздники и выходные: <span className="font-medium">{Number(room.holiday_price_per_hour).toLocaleString()} ₸/час</span>
                                </p>
                                <p className="flex items-center mb-1 text-gray-700">
                                    {room.is_available ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                                            Доступна
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                                            Недоступна
                                        </>
                                    )}
                                </p>
                                <p className="flex items-center text-gray-700">
                                    {room.has_pool ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                                            Есть бассейн
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                                            Нет бассейна
                                        </>
                                    )}
                                </p>
                                <p className="flex items-center text-gray-700">
                                    {room.has_recreation_area ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                                            Есть зона отдыха
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                                            Нет зоны отдыха
                                        </>
                                    )}
                                </p>
                                <p className="flex items-center text-gray-700">
                                    {room.has_steam_room ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                                            Есть парная
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                                            Нет парной
                                        </>
                                    )}
                                </p>
                                <p className="flex items-center text-gray-700">
                                    {room.has_washing_area ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                                            Есть мойка
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                                            Нет мойки
                                        </>
                                    )}
                                </p>
                                <p className="flex items-center text-gray-700">
                                    {room.heated_by_wood ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                                            Отопление дровами
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                                            Не дровами
                                        </>
                                    )}
                                </p>
                                <p className="flex items-center text-gray-700">
                                    {room.heated_by_coal ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                                            Отопление углем
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                                            Не углем
                                        </>
                                    )}
                                </p>
                            </div>

                            <button
                                className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md font-medium hover:bg-green-600 transition"
                                onClick={() => OnUpdate(room)}
                            >
                                Управлять
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}


