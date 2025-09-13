import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { X, Tag, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";

export default function BulkAddModal({
    isOpen,
    setIsOpen,
    categories,
    onSubmit,
    bathhouseId
}) {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [bulkText, setBulkText] = useState('');
    const [parsedItems, setParsedItems] = useState([]);
    const [parseError, setParseError] = useState('');

    const parseBulkText = () => {
        if (!bulkText.trim()) {
            setParseError('Введите данные для парсинга');
            return;
        }

        if (!selectedCategory) {
            setParseError('Выберите категорию');
            return;
        }

        const lines = bulkText.trim().split('\n').filter(line => line.trim());
        const items = [];
        const errors = [];

        lines.forEach((line, index) => {
            const parts = line.split('|').map(part => part.trim());

            if (parts.length < 2) {
                errors.push(`Строка ${index + 1}: Недостаточно данных. Формат: название | цена | описание`);
                return;
            }

            const name = parts[0];
            const price = parts[1];
            const description = parts[2] || '';

            if (!name) {
                errors.push(`Строка ${index + 1}: Название не может быть пустым`);
                return;
            }

            if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
                errors.push(`Строка ${index + 1}: Неверная цена`);
                return;
            }

            items.push({
                name,
                price: parseFloat(price),
                description,
                is_available: true,
                category: parseInt(selectedCategory),
                bathhouse: bathhouseId
            });
        });

        if (errors.length > 0) {
            setParseError(errors.join('\n'));
            setParsedItems([]);
        } else {
            setParseError('');
            setParsedItems(items);
        }
    };

    const handleSubmit = () => {
        if (parsedItems.length === 0) {
            setParseError('Нет валидных позиций для добавления');
            return;
        }

        onSubmit(parsedItems);
        handleClose();
    };

    const handleClose = () => {
        setIsOpen(false);
        setBulkText('');
        setParsedItems([]);
        setParseError('');
        setSelectedCategory('');
    };

    const exampleText = `Пиво "Жигулевское" | 500 | Светлое пиво 0.5л
Чай черный | 300 | Классический черный чай
Кофе американо | 400 | 
Вода минеральная | 200 | Боржоми 0.5л
Сок апельсиновый | 350 | Свежевыжатый сок`;

    return (
        <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                <DialogPanel className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Upload className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                                Массовое добавление позиций
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
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                        {/* Category Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                                <Tag className="h-5 w-5" />
                                <span>Выберите категорию</span>
                            </h3>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bulk Text Input */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Данные для парсинга</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setBulkText(exampleText)}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                    Загрузить пример
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Введите данные в формате: название | цена | описание
                                </label>
                                <textarea
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-48 resize-none transition-all font-mono text-sm"
                                    placeholder={`Пиво "Жигулевское" | 500 | Светлое пиво 0.5л
Чай черный | 300 | Классический черный чай
Кофе американо | 400 | 
Вода минеральная | 200 | Боржоми 0.5л`}
                                />
                                <p className="text-xs text-gray-500">
                                    Каждая строка = одна позиция. Разделитель: | (вертикальная черта)
                                </p>
                            </div>

                            <button
                                onClick={parseBulkText}
                                className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                                Парсить данные
                            </button>
                        </div>

                        {/* Parse Error */}
                        {parseError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-red-800">Ошибки парсинга:</h4>
                                        <pre className="text-xs text-red-700 mt-1 whitespace-pre-wrap">{parseError}</pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Parsed Items Preview */}
                        {parsedItems.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>Предварительный просмотр ({parsedItems.length} позиций)</span>
                                </h3>

                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {parsedItems.map((item, index) => (
                                            <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                        {item.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <p className="font-semibold text-green-600">
                                                            {item.price.toLocaleString()} ₸
                                                        </p>
                                                        <p className="text-xs text-gray-500">Доступно</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={parsedItems.length === 0}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Добавить {parsedItems.length} позиций
                        </button>

                        <button
                            onClick={handleClose}
                            className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            Отмена
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

