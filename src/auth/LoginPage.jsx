import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            toast.success("Вход выполнен успешно!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            toast.error("Ошибка входа. Пожалуйста, проверьте свои учетные данные.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
            >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Вход для администратора</h2>
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition"
                >
                    Войти
                </button>
            </form>
        </div>
    );
}
