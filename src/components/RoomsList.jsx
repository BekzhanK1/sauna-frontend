import { CheckCircle, XCircle, Plus, Users, Clock, Calendar, Waves, Armchair, Flame, Zap, Droplets, TreePine, Mountain } from 'lucide-react';

export default function RoomsList({ rooms, OnCreate, OnUpdate, OnDelete }) {
    const getRoomTypeIcon = (room) => {
        if (room.is_sauna) return <Flame className="w-6 h-6 text-orange-500" />;
        return <Droplets className="w-6 h-6 text-blue-500" />;
    };

    const getRoomTypeColor = (room) => {
        if (room.is_sauna) return 'from-orange-50 to-red-50 border-orange-100';
        return 'from-blue-50 to-cyan-50 border-blue-100';
    };

    const getFeatureIcon = (feature) => {
        const icons = {
            pool: <Waves className="w-4 h-4" />,
            recreation: <Armchair className="w-4 h-4" />,
            steam: <Flame className="w-4 h-4" />,
            washing: <Droplets className="w-4 h-4" />,
            wood: <TreePine className="w-4 h-4" />,
            coal: <Mountain className="w-4 h-4" />
        };
        return icons[feature] || null;
    };

    const features = [
        { key: 'has_pool', label: 'Бассейн', icon: 'pool' },
        { key: 'has_recreation_area', label: 'Зона отдыха', icon: 'recreation' },
        { key: 'has_steam_room', label: 'Парная', icon: 'steam' },
        { key: 'has_washing_area', label: 'Мойка', icon: 'washing' },
        { key: 'heated_by_wood', label: 'Дрова', icon: 'wood' },
        { key: 'heated_by_coal', label: 'Уголь', icon: 'coal' }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Список помещений</h1>
                    <p className="text-gray-600 mt-1">Управляйте саунами и банями вашего заведения</p>
                </div>
                <button
                    onClick={OnCreate}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium text-sm rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Создать помещение
                </button>
            </div>

            {rooms.length === 0 ? (
                <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Droplets className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Помещения не найдены</h3>
                    <p className="text-gray-500 mb-6">Создайте свое первое помещение для начала работы</p>
                    <button
                        onClick={OnCreate}
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Создать помещение
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className={`relative bg-gradient-to-br ${getRoomTypeColor(room)} rounded-2xl shadow-sm border hover:shadow-xl transition-all duration-300 overflow-hidden group`}
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${room.is_available
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                    {room.is_available ? (
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                        <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {room.is_available ? 'Доступна' : 'Недоступна'}
                                </div>
                            </div>

                            {/* Header */}
                            <div className="p-6 pb-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            {getRoomTypeIcon(room)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                                            №{room.room_number}
                                        </h2>
                                        <p className="text-sm font-medium text-gray-600">
                                            {room.is_sauna ? 'Сауна' : room.is_bathhouse ? 'Баня' : 'Баня'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Capacity and Pricing */}
                            <div className="px-6 pb-4">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 text-gray-500 mr-2" />
                                            <span className="text-sm font-medium text-gray-700">Вместимость</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{room.capacity} чел.</span>
                                    </div>

                                    <div className="bg-white/60 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                                <span className="text-sm font-medium text-gray-700">Обычная цена</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">
                                                {Number(room.price_per_hour).toLocaleString()} ₸/час
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                                <span className="text-sm font-medium text-gray-700">Праздники</span>
                                            </div>
                                            <span className="text-sm font-bold text-orange-600">
                                                {Number(room.holiday_price_per_hour).toLocaleString()} ₸/час
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="px-6 pb-4">
                                <div className="bg-white/60 rounded-lg p-3">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Удобства</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {features.map(({ key, label, icon }) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${room[key]
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {room[key] ? (
                                                        getFeatureIcon(icon)
                                                    ) : (
                                                        <XCircle className="w-3 h-3" />
                                                    )}
                                                </div>
                                                <span className={`text-xs font-medium ${room[key] ? 'text-gray-700' : 'text-gray-400'
                                                    }`}>
                                                    {label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 pt-0">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => OnUpdate(room)}
                                        className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200"
                                    >
                                        Управлять
                                    </button>
                                    {OnDelete && (
                                        <button
                                            onClick={() => OnDelete(room.id)}
                                            className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}