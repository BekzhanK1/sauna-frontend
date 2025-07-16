import { CheckCircleIcon, XCircleIcon, ImageIcon, Edit2Icon, Trash2Icon } from 'lucide-react';

export default function MenuItemsList({ menuItems, categories, OnCreate, OnUpdate, OnDelete, OnEditCategory, OnCreateCategory, OnDeleteCategory }) {
    const groupedItems = categories.reduce((acc, category) => {
        acc[category.id] = {
            name: category.name,
            items: menuItems.filter(item => item.category === category.id)
        };
        return acc;
    }, {});

    const uncategorizedItems = menuItems.filter(item => item.category === null);
    if (uncategorizedItems.length > 0) {
        groupedItems['uncategorized'] = {
            name: 'Без категории',
            items: uncategorizedItems
        };
    }

    return (
        <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Список позиций меню</h1>

            <div className="flex gap-2 mb-6">
                <button
                    className="bg-green-500 text-white py-2 px-5 rounded-md font-medium hover:bg-green-600 transition"
                    onClick={OnCreate}
                >
                    Создать позицию меню
                </button>
                <button
                    className="bg-blue-500 text-white py-2 px-5 rounded-md font-medium hover:bg-blue-600 transition"
                    onClick={OnCreateCategory}
                >
                    Создать категорию
                </button>
            </div>

            {menuItems.length === 0 ? (
                <p className="text-gray-500">Позиции меню не найдены</p>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedItems).map(([categoryId, categoryData]) => (
                        <div key={categoryId} className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center justify-between">
                                <span>{categoryData.name}</span>
                                {categoryId !== 'uncategorized' && (
                                    <span className="flex gap-2">
                                        <button
                                            className="bg-yellow-400 text-white py-1 px-3 rounded hover:bg-yellow-500 transition"
                                            onClick={() => OnEditCategory(categories.find(cat => cat.id.toString() === categoryId))}
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                                            onClick={() => OnDeleteCategory(Number(categoryId))}
                                        >
                                            Удалить
                                        </button>
                                    </span>
                                )}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryData.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg shadow p-5 hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div>
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                                </div>
                                            )}

                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {item.name}
                                            </h3>

                                            {item.description && (
                                                <p className="text-gray-600 mb-3 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            <p className="text-gray-700 mb-2">
                                                Цена: <span className="font-medium text-green-600">{Number(item.price).toLocaleString()} ₸</span>
                                            </p>

                                            <p className="flex items-center text-gray-700">
                                                {item.is_available ? (
                                                    <>
                                                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                                                        Доступно
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                                                        Недоступно
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        <button
                                            className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md font-medium hover:bg-green-600 transition"
                                            onClick={() => OnUpdate(item)}
                                        >
                                            Управлять
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
