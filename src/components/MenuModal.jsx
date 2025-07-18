import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function MenuModal({
    isOpen,
    setIsOpen,
    menuDetails,
    setMenuDetails,
    categories,
    onSubmit,
    isUpdate = false,
    onDelete
}) {
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMenuDetails({ ...menuDetails, image: file });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        onSubmit(menuDetails);
    };

    const handleClose = () => {
        setIsOpen(false);
        setImagePreview(null);
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-hidden">
            <div className="flex items-end sm:items-center justify-center min-h-screen p-0 sm:p-4">
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-lg shadow-xl transform transition-all overflow-y-auto">
                    {/* Mobile header with close button */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                            {isUpdate ? "Обновить позицию меню" : "Создать позицию меню"}
                        </DialogTitle>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Form content */}
                    <div className="p-4 sm:p-6 space-y-4">
                        {/* Category selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                            <select
                                value={menuDetails.category || ''}
                                onChange={(e) => setMenuDetails({ ...menuDetails, category: e.target.value ? parseInt(e.target.value) : null })}
                                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Без категории</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Name input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                            <input
                                type="text"
                                value={menuDetails.name}
                                onChange={(e) => setMenuDetails({ ...menuDetails, name: e.target.value })}
                                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Введите название позиции"
                            />
                        </div>

                        {/* Description input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                            <textarea
                                value={menuDetails.description}
                                onChange={(e) => setMenuDetails({ ...menuDetails, description: e.target.value })}
                                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
                                placeholder="Введите описание позиции"
                            />
                        </div>

                        {/* Price input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₸)</label>
                            <input
                                type="number"
                                value={menuDetails.price}
                                onChange={(e) => setMenuDetails({ ...menuDetails, price: e.target.value })}
                                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* Image upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Изображение</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>

                        {/* Image Preview */}
                        {(imagePreview || (isUpdate && menuDetails.image && typeof menuDetails.image === 'string')) && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Предварительный просмотр</label>
                                <div className="relative">
                                    <img
                                        src={imagePreview || menuDetails.image}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-md border"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Availability checkbox */}
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="is_available"
                                checked={menuDetails.is_available}
                                onChange={(e) => setMenuDetails({ ...menuDetails, is_available: e.target.checked })}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                                Доступно для заказа
                            </label>
                        </div>
                    </div>

                    {/* Bottom buttons - sticky on mobile */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
                        <button
                            onClick={handleSubmit}
                            className="bg-green-500 text-white py-3 px-4 rounded-md w-full hover:bg-green-600 transition font-medium text-sm sm:text-base"
                        >
                            {isUpdate ? "Обновить" : "Создать"}
                        </button>

                        {isUpdate && onDelete && (
                            <button
                                onClick={() => {
                                    onDelete(menuDetails.id);
                                    handleClose();
                                }}
                                className="bg-red-500 text-white py-3 px-4 rounded-md w-full hover:bg-red-600 transition font-medium text-sm sm:text-base"
                            >
                                Удалить
                            </button>
                        )}

                        <button
                            onClick={handleClose}
                            className="bg-gray-500 text-white py-3 px-4 rounded-md w-full hover:bg-gray-600 transition font-medium text-sm sm:text-base"
                        >
                            Отмена
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}