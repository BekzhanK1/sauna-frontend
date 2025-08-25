import { useNavigate } from "react-router-dom";
import vparuPic from "../assets/vparu.png";


export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                Добро пожаловать в vparu.kz 🌿
            </h1>
            <p className="max-w-xl text-lg text-gray-600 mb-8 text-center">
                Откройте для себя лучший опыт управления банями и саунами. Забронируйте отдых или управляйте своими объектами — всё в одном месте.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate("/booking")}
                    className="bg-green-500 text-white px-6 py-3 rounded-md font-medium hover:bg-green-600 transition"
                >
                    Забронировать визит
                </button>
                <button
                    onClick={() => navigate("/login")}
                    className="bg-white text-green-500 border border-green-500 px-6 py-3 rounded-md font-medium hover:bg-green-50 transition"
                >
                    Вход для администратора
                </button>
            </div>

            {/* Декоративная графика внизу */}
            <div className="mt-12">
                <img
                    src={vparuPic}
                    alt="Иллюстрация сауны"
                    className="rounded-lg shadow-lg max-w-xs sm:max-w-md"
                />
            </div>
        </div>
    );
}
