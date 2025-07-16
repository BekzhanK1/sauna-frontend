export default function UserList({ users, onRefresh, onOpenModal }) {
    return (
        <>
            <div className="flex justify-end mb-4 space-x-2">
                <button
                    onClick={onRefresh}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                >
                    Обновить
                </button>
                <button
                    onClick={onOpenModal}
                    className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
                >
                    Создать пользователя
                </button>
            </div>
            <ul className="space-y-3">
                {users.map((u) => (
                    <li
                        key={u.id}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center justify-between"
                    >
                        <div>
                            <p className="text-gray-900 font-medium">{u.username}</p>
                            <p className="text-gray-500 text-sm">
                                {u.role === 'superadmin' ? 'Суперадмин' : u.role === 'bath_admin' ? 'Администратор банного комплекса' : u.role}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}

