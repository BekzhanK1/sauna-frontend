import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, Tag, Plus, Trash2 } from "lucide-react";

export default function CategoryModal({
    isOpen,
    setIsOpen,
    categoryDetails,
    setCategoryDetails,
    onSubmit,
    isUpdate = false,
    onDelete
}) {
    const handleSubmit = () => {
        onSubmit(categoryDetails);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleDelete = () => {
        onDelete(categoryDetails.id);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Tag className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                                {isUpdate ? "Обновить категорию" : "Создать категорию"}
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
                        {/* Category Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Информация о категории</h3>

                            {/* Category Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Tag className="h-4 w-4" />
                                    <span>Название категории</span>
                                </label>
                                <input
                                    type="text"
                                    value={categoryDetails.name}
                                    onChange={(e) => setCategoryDetails({ ...categoryDetails, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Введите название категории"
                                />
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <Tag className="h-5 w-5 text-teal-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-teal-800">О категориях</h4>
                                    <p className="text-sm text-teal-700 mt-1">
                                        Категории помогают организовать позиции меню по типам. Например: "Напитки", "Закуски", "Основные блюда".
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {isUpdate ? "Обновить категорию" : "Создать категорию"}
                        </button>

                        {isUpdate && onDelete && (
                            <button
                                onClick={handleDelete}
                                className="w-full bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Удалить категорию</span>
                            </button>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}