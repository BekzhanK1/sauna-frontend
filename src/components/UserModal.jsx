import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, User, Lock, UserPlus } from "lucide-react";

export default function UserModal({ isUserModalOpen, setIsUserModalOpen, userDetails, setUserDetails, createUser }) {
    const handleClose = () => {
        setIsUserModalOpen(false);
    };

    const handleSubmit = () => {
        createUser();
    };

    return (
        <Dialog open={isUserModalOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <UserPlus className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                                Создать пользователя
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
                        {/* User Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Информация о пользователе</h3>

                            {/* Username */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>Имя пользователя</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Введите имя пользователя"
                                    value={userDetails.username}
                                    onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Lock className="h-4 w-4" />
                                    <span>Пароль</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Введите пароль"
                                    value={userDetails.password}
                                    onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <Lock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800">Безопасность</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Убедитесь, что пароль содержит минимум 8 символов и включает буквы и цифры.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            Создать пользователя
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
