import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { unauthenticatedApi } from "../api/axios";
import API_URLS from "../api/config";
import toast from "react-hot-toast";
import BookingPage from "./BookingPage";

export default function BookingBathhousePage() {
    const { id } = useParams();
    const [bathhouse, setBathhouse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBathhouse = async () => {
            try {
                const res = await unauthenticatedApi.get(`${API_URLS.bathhouses}${id}/`);
                setBathhouse(res.data);
            } catch (err) {
                toast.error("Не удалось загрузить баню");
            } finally {
                setLoading(false);
            }
        };

        fetchBathhouse();
    }, [id]);

    if (loading) {
        return <div className="text-center py-20">Загрузка...</div>;
    }

    if (!bathhouse) {
        return <div className="text-center py-20 text-red-500">Баня не найдена</div>;
    }

    return (
        <BookingPage bathhouse={bathhouse} />
    );
}
