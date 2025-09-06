import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { X, Image, Tag, DollarSign, FileText, CheckCircle, Plus } from "lucide-react";

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

    const handleDelete = () => {
        onDelete(menuDetails.id);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Plus className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                                {isUpdate ? "Обновить позицию меню" : "Создать позицию меню"}
                            </DialogTitle>
                        </div>
                        <button
                            onClick={handleClose}
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

                            {/* Category selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Tag className="h-4 w-4" />
                                    <span>Категория</span>
                                </label>
                                <select
                                    value={menuDetails.category || ''}
                                    onChange={(e) => setMenuDetails({ ...menuDetails, category: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Название позиции</label>
                                <input
                                    type="text"
                                    value={menuDetails.name}
                                    onChange={(e) => setMenuDetails({ ...menuDetails, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Введите название позиции"
                                />
                            </div>

                            {/* Description input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Описание</span>
                                </label>
                                <textarea
                                    value={menuDetails.description}
                                    onChange={(e) => setMenuDetails({ ...menuDetails, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-24 resize-none transition-all"
                                    placeholder="Опишите позицию меню"
                                />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                                <DollarSign className="h-5 w-5" />
                                <span>Ценообразование</span>
                            </h3>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Цена (₸)</label>
                                <input
                                    type="number"
                                    value={menuDetails.price}
                                    onChange={(e) => setMenuDetails({ ...menuDetails, price: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                                <Image className="h-5 w-5" />
                                <span>Изображение</span>
                            </h3>

                            {/* Image upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Загрузить изображение</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                </div>
                            </div>

                            {/* Image Preview */}
                            {(imagePreview || (isUpdate && menuDetails.image && typeof menuDetails.image === 'string')) && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Предварительный просмотр</label>
                                    <div className="relative group">
                                        <img
                                            src={imagePreview || menuDetails.image}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-200" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Availability Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Настройки доступности</h3>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="is_available"
                                    checked={menuDetails.is_available}
                                    onChange={(e) => setMenuDetails({ ...menuDetails, is_available: e.target.checked })}
                                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_available" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Доступно для заказа</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {isUpdate ? "Обновить позицию" : "Создать позицию"}
                        </button>

                        {isUpdate && onDelete && (
                            <button
                                onClick={handleDelete}
                                className="w-full bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                                Удалить позицию
                            </button>
                        )}

                        <button
                            onClick={handleClose}
                            className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            Отмена
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}