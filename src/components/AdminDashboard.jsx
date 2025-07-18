import { use, useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import API_URLS from "../api/config";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import Sidebar from "./Sidebar";
import UserList from "./UserList";
import BathhouseList from "./BathhouseList";
import UserModal from "./UserModal.jsx";
import BathhouseModal from "./BathhouseModal.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import BookingList from "./BookingList.jsx";
import Analytics from "./Analytics.jsx";

export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [bathhouses, setBathhouses] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = user?.role === "superadmin" ? "users" : "bathhouses";
    const currentTab = searchParams.get("tab") || defaultTab;
    const [activeTab, setActiveTab] = useState(currentTab);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    const askConfirm = ({ title, message, onConfirm }) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm,
        });
    };

    const [isUpdate, setIsUpdate] = useState(false);
    // Modals
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isBathModalOpen, setIsBathModalOpen] = useState(false);

    // Form states
    const [query, setQuery] = useState("");
    const [userDetails, setUserDetails] = useState({
        username: "",
        password: "",
        role: "bath_admin",
    });
    const [bathhouseDetails, setBathhouseDetails] = useState({
        id: null,
        name: "",
        description: "",
        address: "",
        phone: "",
        is_24_hours: false,
        start_of_work: "",
        end_of_work: "",
        owner: "",
    });

    const filteredUsers = query === "" ? users : users.filter((u) => u.username.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        if (user?.role === "superadmin") {
            fetchUsers();
            fetchBathhouses();
        } else if (user?.role === "bath_admin") {
            fetchBathhouses();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await api.get(API_URLS.users);
            setUsers(res.data);
        } catch (err) {
            console.error("Не удалось загрузить пользователей:", err);
            toast.error("Не удалось загрузить пользователей");
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab }); // updates ?tab= in URL
    };

    const prepareBathhouseData = () => {
        return {
            name: bathhouseDetails.name,
            address: bathhouseDetails.address,
            description: bathhouseDetails.description,
            phone: bathhouseDetails.phone,
            is_24_hours: bathhouseDetails.is_24_hours,
            start_of_work: bathhouseDetails.is_24_hours ? null : (bathhouseDetails.start_of_work || null),
            end_of_work: bathhouseDetails.is_24_hours ? null : (bathhouseDetails.end_of_work || null),
            owner: bathhouseDetails.owner,
        };
    };

    const nullifyBathhouseDetails = () => {
        setBathhouseDetails({
            name: "",
            address: "",
            owner: "",
            description: "",
            phone: "",
            is_24_hours: false,
            start_of_work: "",
            end_of_work: "",
            id: null,
        })
    };

    const fetchBathhouses = async () => {
        try {
            const res = await api.get(API_URLS.bathhouses);
            setBathhouses(res.data);
        } catch (err) {
            console.error("Не удалось загрузить сауны:", err);
            toast.error("Не удалось загрузить сауны");
        }
    };

    const createUser = async () => {
        try {
            await api.post(API_URLS.users, {
                username: userDetails.username,
                password: userDetails.password,
                role: userDetails.role,
            });
            setUserDetails({
                username: "",
                password: "",
                role: "bath_admin",
            });
            setIsUserModalOpen(false);
            fetchUsers();
            toast.success("Пользователь создан!");
        } catch (err) {
            console.error(err);
            toast.error("Не удалось создать пользователя");
        }
    };

    const createBathhouse = async () => {
        try {
            await api.post(API_URLS.bathhouses, prepareBathhouseData());
            nullifyBathhouseDetails();
            setIsBathModalOpen(false);
            fetchBathhouses();
            toast.success("Сауна создана!");
        } catch (err) {
            console.error(err);
            toast.error("Не удалось создать сауну");
        }
    };

    const handleUpdateBathhouse = (bathhouse) => {
        console.log("Обновить сауну:", bathhouse);
        setBathhouseDetails({
            id: bathhouse.id,
            name: bathhouse.name,
            address: bathhouse.address,
            owner: bathhouse.owner?.id,
            description: bathhouse.description,
            phone: bathhouse.phone,
            is_24_hours: bathhouse.is_24_hours,
            start_of_work: bathhouse.start_of_work,
            end_of_work: bathhouse.end_of_work,
        });
        setIsUpdate(true);
        setIsBathModalOpen(true);
    };

    const updateBathhouse = async () => {
        try {
            await api.patch(`${API_URLS.bathhouses}${bathhouseDetails.id}/`, prepareBathhouseData());
            nullifyBathhouseDetails();
            setIsBathModalOpen(false);
            setIsUpdate(false);
            fetchBathhouses();
            toast.success("Сауна обновлена!");
        } catch (err) {
            console.error(err);
            toast.error("Не удалось обновить сауну");
        }
    };

    const handleDeleteBathhouse = async (bathhouse) => {
        askConfirm({
            title: "Удалить сауну",
            message: `Вы уверены, что хотите удалить "${bathhouse.name}"?`,
            onConfirm: async () => {
                try {
                    await api.delete(`${API_URLS.bathhouses}${bathhouse.id}/`);
                    toast.success("Сауна удалена!");
                    fetchBathhouses();
                } catch (err) {
                    console.error(err);
                    toast.error("Не удалось удалить сауну");
                }
            },
        });
    };

    const handleEditRooms = (bathhouseId) => {
        console.log("Редактировать комнаты для сауны ID:", bathhouseId);
        navigate(`rooms?bathhouse_id=${bathhouseId}`);
    };

    const handleEditMenu = (bathhouseId) => {
        console.log("Редактировать меню для сауны ID:", bathhouseId);
        navigate(`menu?bathhouse_id=${bathhouseId}`);
    };

    if (!user) return <p>Загрузка...</p>;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                logout={logout}
                user={user}
                navigate={navigate}
            />

            <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50 pb-20 md:pb-8">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">
                    Добро пожаловать, {user.username}
                </h1>

                {activeTab === "users" && user.role === "superadmin" && (
                    <UserList
                        users={users}
                        onRefresh={fetchUsers}
                        onOpenModal={() => setIsUserModalOpen(true)}
                    />
                )}

                {activeTab === "bathhouses" && (
                    <BathhouseList
                        bathhouses={bathhouses}
                        onCreate={() => setIsBathModalOpen(true)}
                        onUpdate={handleUpdateBathhouse}
                        onDelete={handleDeleteBathhouse}
                        onEditRooms={handleEditRooms}
                        onEditMenu={handleEditMenu}
                        userRole={user.role}
                    />
                )}

                {activeTab === "bookings" && (
                    <BookingList />
                )}

                {activeTab === "analytics" && (
                    <Analytics />
                )}
            </div>

            <UserModal
                isUserModalOpen={isUserModalOpen}
                setIsUserModalOpen={setIsUserModalOpen}
                userDetails={userDetails}
                setUserDetails={setUserDetails}
                createUser={createUser}
            />

            <BathhouseModal
                isBathModalOpen={isBathModalOpen}
                setIsBathModalOpen={setIsBathModalOpen}
                bathhouseDetails={bathhouseDetails}
                setBathhouseDetails={setBathhouseDetails}
                users={users}
                filteredUsers={filteredUsers}
                setQuery={setQuery}
                createBathhouse={createBathhouse}
                is_Update={isUpdate}
                updateBathhouse={updateBathhouse}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
}