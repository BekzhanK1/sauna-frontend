import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import api from '../api/axios';
import API_URLS from '../api/config';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';

export default function BonusSystem() {
    const [searchParams] = useSearchParams();
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const bathhouseId = searchParams.get('bathhouse_id');
    const [loading, setLoading] = useState(true);
    const handleBack = () => {
        navigate('/dashboard');
    };


    if (!bathhouseId) {
        return (
            <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center max-w-md w-full">
                    <h1 className="text-lg sm:text-2xl font-bold text-red-600 mb-4">Отсутствует ID банного комплекса</h1>
                    <p className="mb-4 text-gray-600 text-sm sm:text-base">Пожалуйста, укажите <code className="bg-gray-100 px-1 rounded">bathhouse_id</code> в параметрах запроса, чтобы просмотреть меню.</p>
                    <button
                        onClick={handleBack}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition w-full sm:w-auto"
                    >
                        Вернуться на панель управления
                    </button>
                </div>
            </div>
        );
    }

    return (

        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            <div className="lg:block">
                <Sidebar activeTab={"bonus-system"} user={user} logout={logout} bathhouseID={bathhouseId} navigate={navigate} />
            </div>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-4">Бонусная система</h1>
                    <p className="mb-4 text-gray-600">Здесь вы можете управлять бонусной системой для вашего банного комплекса.</p>
                    {/* Content for managing the bonus system goes here */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400">
                        <p>Функционал бонусной системы в разработке.</p>
                    </div>
                </div>
            </main>

        </div>
    );
};
