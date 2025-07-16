import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-6 text-center">
            <h1 className="text-6xl font-extrabold text-green-500 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Страница не найдена 😢</h2>
            <p className="max-w-md text-gray-600 mb-6">
                Извините, страница, которую вы ищете, не существует или была перемещена. Давайте направим вас в безопасное место!
            </p>

            <button
                onClick={() => navigate("/")}
                className="bg-green-500 text-white px-6 py-3 rounded-md font-medium hover:bg-green-600 transition"
            >
                Перейти на главную
            </button>

            {/* Декоративное изображение */}
            <div className="mt-10">
                <img
                    src="https://images.unsplash.com/photo-1712659604528-b179a3634560?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Иллюстрация расслабляющей сауны"
                    className="rounded-lg shadow-lg max-w-xs sm:max-w-sm"
                />
            </div>
        </div>
    );
}
