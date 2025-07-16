import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

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
        <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 relative">
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all max-h-screen overflow-y-auto">
                    <DialogTitle className="text-xl font-semibold mb-4 text-gray-900">
                        {isUpdate ? "Обновить позицию меню" : "Создать позицию меню"}
                    </DialogTitle>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                    <select
                        value={menuDetails.category || ''}
                        onChange={(e) => setMenuDetails({ ...menuDetails, category: e.target.value ? parseInt(e.target.value) : null })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Без категории</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                    <input
                        type="text"
                        value={menuDetails.name}
                        onChange={(e) => setMenuDetails({ ...menuDetails, name: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Введите название позиции"
                    />

                    <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                    <textarea
                        value={menuDetails.description}
                        onChange={(e) => setMenuDetails({ ...menuDetails, description: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
                        placeholder="Введите описание позиции"
                    />

                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₸)</label>
                    <input
                        type="number"
                        value={menuDetails.price}
                        onChange={(e) => setMenuDetails({ ...menuDetails, price: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                        min="0"
                        step="0.01"
                    />

                    <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Image Preview */}
                    {(imagePreview || (isUpdate && menuDetails.image && typeof menuDetails.image === 'string')) && (
                        <div className="mb-3">
                            <img
                                src={imagePreview || menuDetails.image}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-md border"
                            />
                        </div>
                    )}

                    <label className="flex items-center mb-5 text-gray-700">
                        <input
                            type="checkbox"
                            checked={menuDetails.is_available}
                            onChange={(e) => setMenuDetails({ ...menuDetails, is_available: e.target.checked })}
                            className="mr-2 rounded"
                        />
                        Доступно для заказа
                    </label>

                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white py-2 px-4 rounded-md w-full hover:bg-green-600 transition mb-2"
                    >
                        {isUpdate ? "Обновить" : "Создать"}
                    </button>

                    {isUpdate && onDelete && (
                        <button
                            onClick={() => {
                                onDelete(menuDetails.id);
                                handleClose();
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