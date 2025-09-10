import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, Home, DollarSign, CheckCircle, XCircle, Flame, Wrench, Sun, Sparkles, Droplets, Settings, Upload, Image, Star, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function RoomModal({
    isOpen,
    setIsOpen,
    roomDetails,
    setRoomDetails,
    onSubmit,
    isUpdate = false,
    onDelete,
    onUploadPhoto,
    onDeletePhoto,
    onSetPrimaryPhoto
}) {
    const [photos, setPhotos] = useState(roomDetails.photos || []);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Update photos when roomDetails change
    useEffect(() => {
        if (roomDetails.photos) {
            setPhotos(roomDetails.photos);
        } else {
            setPhotos([]);
        }
    }, [roomDetails.photos]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSubmit = () => {
        onSubmit(roomDetails);
        setIsOpen(false);
    };

    const handleDelete = () => {
        onDelete(roomDetails.id);
        setIsOpen(false);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                handleUploadPhoto(file);
            }
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadPhoto = async (file) => {
        if (!roomDetails.id || !onUploadPhoto) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('caption', '');
            formData.append('is_primary', photos.length === 0 ? 'true' : 'false'); // Set as primary if it's the first photo

            const newPhoto = await onUploadPhoto(roomDetails.id, formData);
            setPhotos(prev => [...prev, newPhoto]);
        } catch (error) {
            console.error('Failed to upload photo:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!roomDetails.id || !onDeletePhoto) return;

        try {
            await onDeletePhoto(roomDetails.id, photoId);
            setPhotos(prev => prev.filter(photo => photo.id !== photoId));
        } catch (error) {
            console.error('Failed to delete photo:', error);
        }
    };

    const handleSetPrimaryPhoto = async (photoId) => {
        if (!roomDetails.id || !onSetPrimaryPhoto) return;

        try {
            await onSetPrimaryPhoto(roomDetails.id, photoId);
            setPhotos(prev => prev.map(photo => ({
                ...photo,
                is_primary: photo.id === photoId
            })));
        } catch (error) {
            console.error('Failed to set primary photo:', error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Home className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                                {isUpdate ? "Обновить помещение" : "Создать помещение"}
                            </DialogTitle>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                        {/* Room Type Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Тип помещения</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${roomDetails.is_sauna
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="roomType"
                                        value="sauna"
                                        checked={roomDetails.is_sauna}
                                        onChange={() => setRoomDetails({ ...roomDetails, is_sauna: true, is_bathhouse: false })}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <Flame className="h-8 w-8 mx-auto mb-2" />
                                        <span className="font-medium">Сауна</span>
                                    </div>
                                </label>
                                <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${roomDetails.is_bathhouse
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="roomType"
                                        value="bathhouse"
                                        checked={roomDetails.is_bathhouse}
                                        onChange={() => setRoomDetails({ ...roomDetails, is_sauna: false, is_bathhouse: true })}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <Droplets className="h-8 w-8 mx-auto mb-2" />
                                        <span className="font-medium">Баня</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Basic Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Основная информация</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Номер помещения</label>
                                    <input
                                        type="text"
                                        value={roomDetails.room_number}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, room_number: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Например: 101"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Вместимость</label>
                                    <input
                                        type="text"
                                        value={roomDetails.capacity}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, capacity: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Например: 4-6 человек"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                                <DollarSign className="h-5 w-5" />
                                <span>Ценообразование</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Цена за час (₸)</label>
                                    <input
                                        type="number"
                                        value={roomDetails.price_per_hour}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, price_per_hour: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="5000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Цена в праздники (₸)</label>
                                    <input
                                        type="number"
                                        value={roomDetails.holiday_price_per_hour}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, holiday_price_per_hour: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="7000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Особенности помещения</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Availability */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="is_available"
                                        checked={roomDetails.is_available}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, is_available: e.target.checked })}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_available" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Доступно</span>
                                    </label>
                                </div>

                                {/* Pool */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="has_pool"
                                        checked={roomDetails.has_pool}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, has_pool: e.target.checked })}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="has_pool" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <Droplets className="h-4 w-4" />
                                        <span>Есть бассейн</span>
                                    </label>
                                </div>

                                {/* Recreation Area */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="has_recreation_area"
                                        checked={roomDetails.has_recreation_area}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, has_recreation_area: e.target.checked })}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="has_recreation_area" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <Sun className="h-4 w-4" />
                                        <span>Зона отдыха</span>
                                    </label>
                                </div>

                                {/* Steam Room */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="has_steam_room"
                                        checked={roomDetails.has_steam_room}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, has_steam_room: e.target.checked })}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="has_steam_room" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Парная</span>
                                    </label>
                                </div>

                                {/* Washing Area */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="has_washing_area"
                                        checked={roomDetails.has_washing_area}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, has_washing_area: e.target.checked })}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="has_washing_area" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <Wrench className="h-4 w-4" />
                                        <span>Мойка</span>
                                    </label>
                                </div>

                                {/* Wood Heating */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="heated_by_wood"
                                        checked={roomDetails.heated_by_wood}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, heated_by_wood: e.target.checked })}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="heated_by_wood" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <Flame className="h-4 w-4" />
                                        <span>Отопление дровами</span>
                                    </label>
                                </div>

                                {/* Coal Heating */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="heated_by_coal"
                                        checked={roomDetails.heated_by_coal}
                                        onChange={(e) => setRoomDetails({ ...roomDetails, heated_by_coal: e.target.checked })}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="heated_by_coal" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <Settings className="h-4 w-4" />
                                        <span>Отопление углем</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Photos Section */}
                        {isUpdate && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                                    <Image className="h-5 w-5" />
                                    <span>Фотографии помещения</span>
                                </h3>

                                {/* Upload Section */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span>{uploading ? 'Загрузка...' : 'Добавить фотографии'}</span>
                                    </button>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Выберите одно или несколько изображений
                                    </p>
                                </div>

                                {/* Photos Grid */}
                                {photos.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {photos.map((photo) => (
                                            <div key={photo.id} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                    <img
                                                        src={photo.image_url || photo.image}
                                                        alt={photo.caption || 'Room photo'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Primary Badge */}
                                                {photo.is_primary && (
                                                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                                        <Star className="h-3 w-3" />
                                                        <span>Главная</span>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <div className="flex space-x-2">
                                                        {!photo.is_primary && (
                                                            <button
                                                                onClick={() => handleSetPrimaryPhoto(photo.id)}
                                                                className="p-2 bg-white text-yellow-600 rounded-full hover:bg-yellow-50 transition-colors"
                                                                title="Сделать главной"
                                                            >
                                                                <Star className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeletePhoto(photo.id)}
                                                            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {photos.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Image className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>Фотографии не добавлены</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {isUpdate ? "Обновить помещение" : "Создать помещение"}
                        </button>

                        {isUpdate && onDelete && (
                            <button
                                onClick={handleDelete}
                                className="w-full bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                                Удалить помещение
                            </button>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
