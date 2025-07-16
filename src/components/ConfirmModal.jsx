import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Вы уверены?",
    message = "Это действие нельзя отменить.",
    confirmText = "Подтвердить",
    cancelText = "Отмена",
}) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 relative">
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all">
                    <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">{title}</DialogTitle>
                    <p className="text-gray-700 mb-6">{message}</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                        >
                            {confirmText}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
