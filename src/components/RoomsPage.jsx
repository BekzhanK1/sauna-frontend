import { useSearchParams, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { AuthContext } from '../auth/AuthContext';
import api from '../api/axios';
import API_URLS from '../api/config';
import toast from 'react-hot-toast';
import RoomsList from './RoomsList';
import RoomModal from './RoomModal';

export default function RoomsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const bathhouseId = searchParams.get('bathhouse_id');
    const [isUpdate, setIsUpdate] = useState(false);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [roomDetails, setRoomDetails] = useState({
        id: null,
        room_number: "",
        capacity: "1",
        price_per_hour: "",
        holiday_price_per_hour: "",
        is_bathhouse: false,
        is_sauna: false,
        is_available: true,
        has_pool: false,
        has_recreation_area: false,
        has_steam_room: false,
        has_washing_area: false,
        heated_by_wood: false,
        heated_by_coal: false,
        bathhouse: bathhouseId
    });

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleBack = () => {
        navigate('/dashboard');
    };

    const nullifyRoomDetails = () => {
        setRoomDetails({
            id: null,
            room_number: "",
            capacity: "1",
            price_per_hour: "",
            holiday_price_per_hour: "",
            is_bathhouse: false,
            is_sauna: false,
            is_available: true,
            has_pool: false,
            has_recreation_area: false,
            has_steam_room: false,
            has_washing_area: false,
            heated_by_wood: false,
            heated_by_coal: false,
            bathhouse: bathhouseId
        });
    };

    const handleEditRoom = (room) => {
        setRoomDetails({
            id: room.id,
            room_number: room.room_number,
            capacity: room.capacity,
            price_per_hour: room.price_per_hour,
            holiday_price_per_hour: room.holiday_price_per_hour,
            is_bathhouse: room.is_bathhouse,
            is_sauna: room.is_sauna,
            is_available: room.is_available,
            has_pool: room.has_pool,
            has_recreation_area: room.has_recreation_area,
            has_steam_room: room.has_steam_room,
            has_washing_area: room.has_washing_area,
            heated_by_wood: room.heated_by_wood,
            heated_by_coal: room.heated_by_coal,
            bathhouse: room.bathhouse
        });
        setIsUpdate(true);
        setIsRoomModalOpen(true);
    };

    const handleCreateRoom = () => {
        nullifyRoomDetails();
        setIsUpdate(false);
        setIsRoomModalOpen(true);
    };

    const updateRoom = async (roomData) => {
        setLoading(true);
        try {
            const res = await api.patch(`${API_URLS.rooms}${roomData.id}/`, roomData);
            setRooms(rooms.map(room => room.id === res.data.id ? res.data : room));
            toast.success("Комната успешно обновлена");
        } catch (err) {
            console.error("Не удалось обновить комнату:", err);
            toast.error("Не удалось обновить комнату");
        } finally {
            nullifyRoomDetails();
            setLoading(false);
            setIsUpdate(false);
            setIsRoomModalOpen(false);
        }
    };

    const createRoom = async (roomData) => {
        setLoading(true);
        try {
            const res = await api.post(API_URLS.rooms, roomData);
            setRooms([...rooms, res.data]);
            toast.success("Комната успешно создана");
        } catch (err) {
            console.error("Не удалось создать комнату:", err);
            toast.error("Не удалось создать комнату");
        } finally {
            nullifyRoomDetails();
            setLoading(false);
            setIsRoomModalOpen(false);
        }
    };

    const deleteRoom = async (roomId) => {
        setLoading(true);
        try {
            await api.delete(`${API_URLS.rooms}${roomId}/`);
            setRooms(rooms.filter(room => room.id !== roomId));
            toast.success("Комната успешно удалена");
        } catch (err) {
            console.error("Не удалось удалить комнату:", err);
            toast.error("Не удалось удалить комнату");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!bathhouseId) return;

        const fetchRooms = async () => {
            setLoading(true);
            try {
                const res = await api.get(`${API_URLS.rooms}?bathhouse_id=${bathhouseId}`);
                setRooms(res.data);
            } catch (err) {
                console.error("Не удалось загрузить комнаты:", err);
                toast.error("Не удалось загрузить комнаты");
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [bathhouseId]);

    if (!bathhouseId) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Отсутствует ID банного комплекса</h1>
                    <p className="mb-4 text-gray-600">Пожалуйста, укажите <code>bathhouse_id</code> в параметрах запроса, чтобы просмотреть комнаты.</p>
                    <button
                        onClick={handleBack}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                    >
                        Вернуться на панель управления
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activeTab={"rooms"} user={user} logout={logout} bathhouseID={bathhouseId} navigate={navigate} />
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Помещения для банного комплекса ID: {bathhouseId}</h1>

                {loading ? (
                    <p className="text-gray-700">Загрузка помещений...</p>
                ) : (
                    <RoomsList
                        rooms={rooms}
                        OnUpdate={handleEditRoom}
                        OnCreate={handleCreateRoom}
                        OnDelete={deleteRoom}
                    />
                )}
            </main>
            <RoomModal
                isOpen={isRoomModalOpen}
                setIsOpen={setIsRoomModalOpen}
                roomDetails={roomDetails}
                setRoomDetails={setRoomDetails}
                onSubmit={isUpdate ? updateRoom : createRoom}
                isUpdate={isUpdate}
                onDelete={deleteRoom}
            />
        </div>
    );
}
