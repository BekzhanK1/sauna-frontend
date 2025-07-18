import { CheckCircleIcon, XCircleIcon, ImageIcon, Edit2Icon, Trash2Icon, PlusIcon } from 'lucide-react';

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Список позиций меню</h1>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded-md font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                        onClick={OnCreate}
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="text-sm sm:text-base">Создать позицию</span>
                    </button>
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
                        onClick={OnCreateCategory}
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="text-sm sm:text-base">Создать категорию</span>
                    </button>
                </div>
            </div>

            {menuItems.length === 0 ? (
                <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Позиции меню не найдены</p>
                    <p className="text-gray-400 text-sm mt-2">Начните с создания первой позиции меню</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedItems).map(([categoryId, categoryData]) => (
                        <div key={categoryId} className="space-y-4">
                            {/* Category header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 border-b border-gray-200 pb-3">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    {categoryData.name}
                                </h2>
                                {categoryId !== 'uncategorized' && (
                                    <div className="flex gap-2">
                                        <button
                                            className="bg-yellow-400 text-white py-1 px-3 rounded text-sm hover:bg-yellow-500 transition flex items-center gap-1"
                                            onClick={() => OnEditCategory(categories.find(cat => cat.id.toString() === categoryId))}
                                        >
                                            <Edit2Icon className="w-3 h-3" />
                                            <span className="hidden sm:inline">Редактировать</span>
                                            <span className="sm:hidden">Ред.</span>
                                        </button>
                                        <button
                                            className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600 transition flex items-center gap-1"
                                            onClick={() => OnDeleteCategory(Number(categoryId))}
                                        >
                                            <Trash2Icon className="w-3 h-3" />
                                            <span className="hidden sm:inline">Удалить</span>
                                            <span className="sm:hidden">Уд.</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Items grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {categoryData.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg shadow hover:shadow-md transition flex flex-col"
                                    >
                                        {/* Image */}
                                        <div className="relative">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                                                </div>
                                            )}

                                            {/* Availability indicator */}
                                            <div className="absolute top-2 right-2">
                                                {item.is_available ? (
                                                    <div className="bg-green-500 text-white p-1 rounded-full">
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="bg-red-500 text-white p-1 rounded-full">
                                                        <XCircleIcon className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {item.name}
                                            </h3>

                                            {item.description && (
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-1">
                                                    {item.description}
                                                </p>
                                            )}

                                            <div className="mt-auto">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-lg font-medium text-green-600">
                                                        {Number(item.price).toLocaleString()} ₸
                                                    </p>
                                                    <div className="flex items-center text-sm">
                                                        {item.is_available ? (
                                                            <span className="text-green-600 font-medium">Доступно</span>
                                                        ) : (
                                                            <span className="text-red-600 font-medium">Недоступно</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    className="w-full bg-green-500 text-white py-2 px-4 rounded-md font-medium hover:bg-green-600 transition text-sm"
                                                    onClick={() => OnUpdate(item)}
                                                >
                                                    Управлять
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}