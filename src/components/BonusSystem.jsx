import React from 'react';
import { useContext, useMemo, useState } from 'react';
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
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const numberFormatter = useMemo(() => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), []);
    const dateTimeFormatter = useMemo(() => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }), []);
    const formattedBalance = balance !== null ? `${numberFormatter.format(Number(balance))} ₸` : '-';

    const totals = useMemo(() => {
        const initial = { accrued: 0, redeemed: 0 };
        const sum = transactions.reduce((acc, tx) => {
            const amount = Number(tx.amount || 0);
            if (tx.type === 'accrual') acc.accrued += amount;
            else if (tx.type === 'redemption') acc.redeemed += amount;
            return acc;
        }, initial);
        const net = sum.accrued - sum.redeemed;
        return {
            accrued: numberFormatter.format(sum.accrued),
            redeemed: numberFormatter.format(sum.redeemed),
            net: numberFormatter.format(net),
            count: transactions.length,
        };
    }, [transactions, numberFormatter]);
    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone) {
            toast.error('Введите номер телефона');
            return;
        }
        if (!bathhouseId) {
            toast.error('Отсутствует bathhouse_id');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setBalance(null);
        setTransactions([]);

        try {
            const [balanceRes, txRes] = await Promise.all([
                api.get(API_URLS.bonusSystemBalance, {
                    params: { bathhouse_id: bathhouseId, phone },
                }),
                api.get(API_URLS.bonusSystemTransactions, {
                    params: { bathhouse_id: bathhouseId, phone },
                }),
            ]);

            setBalance(balanceRes?.data?.balance ?? '0.00');
            setTransactions(txRes?.data?.transactions ?? []);
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.error || 'Не удалось получить данные';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
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
                    <p className="mb-6 text-gray-600">Проверьте баланс и транзакции клиента по номеру телефона.</p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Номер телефона"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-500 disabled:opacity-60 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                        >
                            {loading ? 'Загрузка...' : 'Проверить'}
                        </button>
                    </form>

                    {errorMessage && (
                        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
                            {errorMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="border rounded-lg p-4">
                                <h2 className="text-lg font-semibold mb-2">Текущий баланс</h2>
                                <div className="text-3xl font-bold text-green-600">
                                    {formattedBalance}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">Банный комплекс ID: {bathhouseId}</div>
                                {phone && <div className="text-sm text-gray-500">Телефон: {phone}</div>}
                            </div>

                            <div className="border rounded-lg p-4 mt-6">
                                <h3 className="text-md font-semibold mb-3">Сводка по транзакциям</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-600">Всего записей</span><span className="font-medium">{totals.count}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Начислено</span><span className="font-medium text-green-600">+{totals.accrued} ₸</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Списано</span><span className="font-medium text-red-600">-{totals.redeemed} ₸</span></div>
                                    <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-700">Итог</span><span className="font-semibold">{totals.net} ₸</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="border rounded-lg p-4">
                                <h2 className="text-lg font-semibold mb-2">История транзакций</h2>
                                {!loading && transactions?.length === 0 && (
                                    <div className="text-gray-500">Транзакции отсутствуют</div>
                                )}

                                {loading && (
                                    <div className="text-gray-500">Загрузка транзакций...</div>
                                )}

                                {!loading && transactions?.length > 0 && (
                                    <ul className="divide-y divide-gray-200">
                                        {transactions.map((tx, idx) => {
                                            const isRedemption = tx.type === 'redemption';
                                            const label = tx.type === 'accrual' ? 'Начисление' : isRedemption ? 'Списание' : tx.type;
                                            const amountStr = `${isRedemption ? '-' : '+'}${numberFormatter.format(Number(tx.amount || 0))} ₸`;
                                            const createdAtStr = tx.created_at ? dateTimeFormatter.format(new Date(tx.created_at)) : null;
                                            return (
                                                <li key={idx} className="py-3 flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${isRedemption ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{label}</span>
                                                            {tx.booking && (
                                                                <span className="text-xs text-gray-500">Бронирование #{tx.booking}</span>
                                                            )}
                                                            {createdAtStr && (
                                                                <span className="text-xs text-gray-400">• {createdAtStr}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`font-semibold ${isRedemption ? 'text-red-600' : 'text-green-600'}`}>
                                                        {amountStr}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
};
