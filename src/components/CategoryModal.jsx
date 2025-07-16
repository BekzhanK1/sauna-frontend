import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

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

    return (
        <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 relative">
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all">
                    <DialogTitle className="text-xl font-semibold mb-4 text-gray-900">
                        {isUpdate ? "Обновить категорию" : "Создать категорию"}
                    </DialogTitle>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Название категории</label>
                    <input
                        type="text"
                        value={categoryDetails.name}
                        onChange={(e) => setCategoryDetails({ ...categoryDetails, name: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-5 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Введите название категории"
                    />

                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white py-2 px-4 rounded-md w-full hover:bg-green-600 transition mb-2"
                    >
                        {isUpdate ? "Обновить" : "Создать"}
                    </button>

                    {isUpdate && onDelete && (
                        <button
                            onClick={() => {
                                onDelete(categoryDetails.id);
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