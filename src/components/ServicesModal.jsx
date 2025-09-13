import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState, useMemo } from "react";
import { X, Search, Plus, Minus, ShoppingCart, Tag, Image as ImageIcon, ChevronDown, ChevronRight } from "lucide-react";

export default function ServicesModal({
    isOpen,
    setIsOpen,
    menuItems,
    categories,
    selectedItems,
    onItemQuantityChange,
    onConfirm
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [collapsedCategories, setCollapsedCategories] = useState({});

    // Filter items based on search and category
    const filteredItems = useMemo(() => {
        let filtered = menuItems;

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== "all") {
            const categoryId = selectedCategory === "uncategorized" ? null : parseInt(selectedCategory);
            filtered = filtered.filter(item => item.category === categoryId);
        }

        return filtered;
    }, [menuItems, searchQuery, selectedCategory]);

    // Group filtered items by category
    const groupedFilteredItems = useMemo(() => {
        const groups = {};

        filteredItems.forEach(item => {
            const categoryId = item.category || 'uncategorized';
            const categoryName = item.category
                ? categories.find(cat => cat.id === item.category)?.name || 'Неизвестная категория'
                : 'Без категории';

            if (!groups[categoryId]) {
                groups[categoryId] = {
                    name: categoryName,
                    items: []
                };
            }
            groups[categoryId].items.push(item);
        });

        return groups;
    }, [filteredItems, categories]);

    // Get all available categories for filter buttons
    const availableCategories = useMemo(() => {
        const cats = [
            { id: 'all', name: 'Все', count: menuItems.length }
        ];

        categories.forEach(cat => {
            const count = menuItems.filter(item => item.category === cat.id).length;
            if (count > 0) {
                cats.push({ id: cat.id, name: cat.name, count });
            }
        });

        const uncategorizedCount = menuItems.filter(item => item.category === null).length;
        if (uncategorizedCount > 0) {
            cats.push({ id: 'uncategorized', name: 'Без категории', count: uncategorizedCount });
        }

        return cats;
    }, [categories, menuItems]);

    const getSelectedQuantity = (itemId) => {
        return selectedItems.find(item => item.item === itemId)?.quantity || 0;
    };

    const getTotalSelectedItems = () => {
        return selectedItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return selectedItems.reduce((total, item) => {
            const menuItem = menuItems.find(mi => mi.id === item.item);
            return total + (menuItem ? menuItem.price * item.quantity : 0);
        }, 0);
    };

    const toggleCategory = (categoryId) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const isCategoryCollapsed = (categoryId) => {
        return collapsedCategories[categoryId] || false;
    };

    const handleClose = () => {
        setIsOpen(false);
        setSearchQuery("");
        setSelectedCategory("all");
    };

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <ShoppingCart className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                                    Дополнительные услуги
                                </DialogTitle>
                                <p className="text-blue-100 text-sm">
                                    {getTotalSelectedItems()} позиций выбрано • {getTotalPrice().toLocaleString()} ₸
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Поиск услуг..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Category Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.id
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                        }`}
                                >
                                    {category.name}
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${selectedCategory === category.id
                                            ? 'bg-blue-400 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {category.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {Object.keys(groupedFilteredItems).length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Услуги не найдены</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {searchQuery ? "Попробуйте изменить поисковый запрос" : "Нет доступных услуг"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(groupedFilteredItems).map(([categoryId, categoryData]) => {
                                    const isCollapsed = isCategoryCollapsed(categoryId);
                                    const selectedInCategory = categoryData.items.reduce((total, item) => {
                                        return total + getSelectedQuantity(item.id);
                                    }, 0);

                                    return (
                                        <div key={categoryId} className="space-y-4">
                                            {/* Collapsible Category Header */}
                                            <button
                                                onClick={() => toggleCategory(categoryId)}
                                                className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Tag className="h-5 w-5 text-gray-600" />
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {categoryData.name}
                                                    </h3>
                                                    <span className="text-sm text-gray-500">
                                                        ({categoryData.items.length})
                                                    </span>
                                                    {selectedInCategory > 0 && (
                                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                            {selectedInCategory} выбрано
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {isCollapsed ? (
                                                        <ChevronRight className="h-5 w-5 text-gray-500" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Collapsible Items Grid */}
                                            {!isCollapsed && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                                                    {categoryData.items.map((item) => {
                                                        const selected = getSelectedQuantity(item.id);
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${selected > 0
                                                                        ? 'border-blue-500 bg-blue-50'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start space-x-3">
                                                                    {/* Image */}
                                                                    <div className="flex-shrink-0">
                                                                        {item.image ? (
                                                                            <img
                                                                                src={item.image}
                                                                                alt={item.name}
                                                                                className="w-16 h-16 object-cover rounded-lg"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                                <ImageIcon className="w-6 h-6 text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                                                                            {item.name}
                                                                        </h4>
                                                                        {item.description && (
                                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                                                {item.description}
                                                                            </p>
                                                                        )}
                                                                        <p className="text-sm font-semibold text-green-600 mt-2">
                                                                            {Number(item.price).toLocaleString()} ₸
                                                                        </p>

                                                                        {/* Quantity Controls */}
                                                                        <div className="flex items-center justify-between mt-3">
                                                                            <div className="flex items-center space-x-2">
                                                                                {selected > 0 && (
                                                                                    <button
                                                                                        onClick={() => onItemQuantityChange(item.id, Math.max(selected - 1, 0))}
                                                                                        className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                                                                                    >
                                                                                        <Minus className="w-3 h-3" />
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    onClick={() => onItemQuantityChange(item.id, selected + 1)}
                                                                                    className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                                                                                >
                                                                                    <Plus className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                            {selected > 0 && (
                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                    {selected} шт.
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleConfirm}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                                Подтвердить выбор ({getTotalSelectedItems()} позиций)
                            </button>
                            <button
                                onClick={handleClose}
                                className="sm:w-32 bg-gray-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
