import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import api from '../api/axios';
import API_URLS from '../api/config';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import MenuItemsList from './MenuItemsList';
import MenuModal from './MenuModal';
import CategoryModal from './CategoryModal';

export default function MenuPage() {
    const [searchParams] = useSearchParams();
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const bathhouseId = searchParams.get('bathhouse_id');

    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCategoryUpdate, setIsCategoryUpdate] = useState(false);
    const [menuDetails, setMenuDetails] = useState({
        id: null,
        bathhouse: bathhouseId,
        name: '',
        description: '',
        price: '',
        is_available: true,
        image: null,
        category: null,
    });
    const [categoryDetails, setCategoryDetails] = useState({
        id: null,
        name: '',
        bathhouse: bathhouseId,
    });

    const handleBack = () => {
        navigate('/dashboard');
    };

    useEffect(() => {
        if (!bathhouseId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [menuResponse, categoriesResponse] = await Promise.all([
                    api.get(`${API_URLS.bathhouseItems}?bathhouse_id=${bathhouseId}`),
                    api.get(`${API_URLS.menuCategories}?bathhouse_id=${bathhouseId}`)
                ]);

                setMenuItems(menuResponse.data);
                setCategories(categoriesResponse.data);
                console.log("Menu items fetched:", menuResponse.data);
                console.log("Categories fetched:", categoriesResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Ошибка при загрузке данных");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [bathhouseId]);

    const nullifyMenuDetails = () => {
        setMenuDetails({
            id: null,
            bathhouse: bathhouseId,
            name: '',
            description: '',
            price: '',
            is_available: true,
            image: null,
            category: null,
        });
    };

    const nullifyCategoryDetails = () => {
        setCategoryDetails({
            id: null,
            name: '',
            bathhouse: bathhouseId,
        });
    };

    const handleEditMenuItem = (item) => {
        setMenuDetails({
            id: item.id,
            bathhouse: item.bathhouse,
            name: item.name,
            description: item.description,
            price: item.price,
            is_available: item.is_available,
            image: item.image,
            category: item.category,
        });
        setIsUpdate(true);
        setIsMenuModalOpen(true);
    };

    const handleCreateMenuItem = () => {
        nullifyMenuDetails();
        setIsUpdate(false);
        setIsMenuModalOpen(true);
    };

    const handleEditCategory = (category) => {
        setCategoryDetails({
            id: category.id,
            name: category.name,
            bathhouse: category.bathhouse,
        });
        setIsCategoryUpdate(true);
        setIsCategoryModalOpen(true);
    };

    const handleCreateCategory = () => {
        nullifyCategoryDetails();
        setIsCategoryUpdate(false);
        setIsCategoryModalOpen(true);
    };

    const updateMenuItem = async (itemData) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(itemData).forEach(key => {
                if (key === 'image' && itemData[key] instanceof File) {
                    formData.append(key, itemData[key]);
                } else if (itemData[key] !== null) {
                    formData.append(key, itemData[key]);
                }
            });

            const res = await api.patch(`${API_URLS.bathhouseItems}${itemData.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMenuItems(menuItems.map(item => item.id === res.data.id ? res.data : item));
            toast.success("Позиция меню успешно обновлена");
        } catch (err) {
            console.error("Не удалось обновить позицию меню:", err);
            toast.error("Не удалось обновить позицию меню");
        } finally {
            nullifyMenuDetails();
            setLoading(false);
            setIsUpdate(false);
            setIsMenuModalOpen(false);
        }
    };

    const createMenuItem = async (itemData) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(itemData).forEach(key => {
                if (key === 'image' && itemData[key] instanceof File) {
                    formData.append(key, itemData[key]);
                } else if (itemData[key] !== null) {
                    formData.append(key, itemData[key]);
                }
            });

            const res = await api.post(API_URLS.bathhouseItems, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMenuItems([...menuItems, res.data]);
            toast.success("Позиция меню успешно создана");
        } catch (err) {
            console.error("Не удалось создать позицию меню:", err);
            toast.error("Не удалось создать позицию меню");
        } finally {
            nullifyMenuDetails();
            setLoading(false);
            setIsMenuModalOpen(false);
        }
    };

    const deleteMenuItem = async (itemId) => {
        setLoading(true);
        try {
            await api.delete(`${API_URLS.bathhouseItems}${itemId}/`);
            setMenuItems(menuItems.filter(item => item.id !== itemId));
            toast.success("Позиция меню успешно удалена");
        } catch (err) {
            console.error("Не удалось удалить позицию меню:", err);
            toast.error("Не удалось удалить позицию меню");
        } finally {
            setLoading(false);
        }
    };

    const updateCategory = async (categoryData) => {
        setLoading(true);
        try {
            const res = await api.patch(`${API_URLS.menuCategories}${categoryData.id}/`, categoryData);
            setCategories(categories.map(cat => cat.id === res.data.id ? res.data : cat));
            toast.success("Категория успешно обновлена");
        } catch (err) {
            console.error("Не удалось обновить категорию:", err);
            toast.error("Не удалось обновить категорию");
        } finally {
            nullifyCategoryDetails();
            setLoading(false);
            setIsCategoryUpdate(false);
            setIsCategoryModalOpen(false);
        }
    };

    const createCategory = async (categoryData) => {
        setLoading(true);
        try {
            const res = await api.post(API_URLS.menuCategories, categoryData);
            setCategories([...categories, res.data]);
            toast.success("Категория успешно создана");
        } catch (err) {
            console.error("Не удалось создать категорию:", err);
            toast.error("Не удалось создать категорию");
        } finally {
            nullifyCategoryDetails();
            setLoading(false);
            setIsCategoryModalOpen(false);
        }
    };

    const deleteCategory = async (categoryId) => {
        setLoading(true);
        try {
            await api.delete(`${API_URLS.menuCategories}${categoryId}/`);
            setCategories(categories.filter(cat => cat.id !== categoryId));
            // Update menu items that had this category
            setMenuItems(menuItems.map(item =>
                item.category === categoryId ? { ...item, category: null } : item
            ));
            toast.success("Категория успешно удалена");
        } catch (err) {
            console.error("Не удалось удалить категорию:", err);
            toast.error("Не удалось удалить категорию");
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
            {/* Mobile-first sidebar - hidden on mobile by default */}
            <div className="lg:block">
                <Sidebar activeTab={"menu"} user={user} logout={logout} bathhouseID={bathhouseId} navigate={navigate} />
            </div>

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 break-words">
                    Меню для банного комплекса ID: {bathhouseId}
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        <p className="ml-3 text-gray-700">Загрузка меню...</p>
                    </div>
                ) : (
                    <MenuItemsList
                        menuItems={menuItems}
                        categories={categories}
                        OnUpdate={handleEditMenuItem}
                        OnCreate={handleCreateMenuItem}
                        OnDelete={deleteMenuItem}
                        OnEditCategory={handleEditCategory}
                        OnCreateCategory={handleCreateCategory}
                        OnDeleteCategory={deleteCategory}
                    />
                )}
            </main>

            <MenuModal
                isOpen={isMenuModalOpen}
                setIsOpen={setIsMenuModalOpen}
                menuDetails={menuDetails}
                setMenuDetails={setMenuDetails}
                categories={categories}
                onSubmit={isUpdate ? updateMenuItem : createMenuItem}
                isUpdate={isUpdate}
                onDelete={deleteMenuItem}
            />
            <CategoryModal
                isOpen={isCategoryModalOpen}
                setIsOpen={setIsCategoryModalOpen}
                categoryDetails={categoryDetails}
                setCategoryDetails={setCategoryDetails}
                onSubmit={isCategoryUpdate ? updateCategory : createCategory}
                isUpdate={isCategoryUpdate}
                onDelete={deleteCategory}
            />
        </div>
    );
}