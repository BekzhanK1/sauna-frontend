export default function BathhouseList({
    bathhouses,
    onCreate,
    onUpdate,
    onDelete,
    onEditRooms,
    onEditMenu,
    userRole,
}) {
    return (
        <>
            {userRole === "superadmin" && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={onCreate}
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
                    >
                        Создать баню
                    </button>
                </div>
            )}
            <ul className="space-y-4">
                {bathhouses.map((b) => (
                    <li
                        key={b.id}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{b.name}</h3>
                            <p className="text-gray-600">Адрес: {b.address}</p>
                            <p className="text-gray-600">
                                ID владельца: {b.owner?.id || "Нет"}
                            </p>
                            <p className="text-gray-600">
                                Имя пользователя владельца: {b.owner?.username || "Неизвестно"}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => onUpdate(b)}
                                className="bg-yellow-400 text-white py-1.5 px-4 rounded-md hover:bg-yellow-500 transition"
                            >
                                Обновить
                            </button>
                            {userRole === "superadmin" && (
                                <button
                                    onClick={() => onDelete(b)}
                                    className="bg-red-500 text-white py-1.5 px-4 rounded-md hover:bg-red-600 transition"
                                >
                                    Удалить
                                </button>
                            )}
                            <button
                                onClick={() => onEditRooms(b.id)}
                                className="bg-green-500 text-white py-1.5 px-4 rounded-md hover:bg-green-600 transition"
                            >
                                Сауны/Бани
                            </button>
                            <button
                                onClick={() => onEditMenu(b.id)}
                                className="bg-blue-500 text-white py-1.5 px-4 rounded-md hover:bg-blue-600 transition"
                            >
                                Товары и сервис
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
