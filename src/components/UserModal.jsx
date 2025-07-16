import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function UserModal({ isUserModalOpen, setIsUserModalOpen, userDetails, setUserDetails, createUser }) {
    return (
        <Dialog open={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 relative">
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all">
                    <DialogTitle className="text-xl font-semibold mb-4 text-gray-900">
                        Создать нового пользователя
                    </DialogTitle>

                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={userDetails.username}
                        onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={userDetails.password}
                        onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full mb-5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <button
                        onClick={createUser}
                        className="bg-green-500 text-white py-2 px-4 rounded-md w-full hover:bg-green-600 transition"
                    >
                        Создать
                    </button>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
