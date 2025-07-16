import { useContext } from "react";
import { AuthContext } from "./auth/AuthContext";
import LoginPage from "./auth/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import RoomsPage from "./components/RoomsPage";
import MenuPage from "./components/MenuPage";
import HomePage from "./components/HomePage";
import NotFoundPage from "./components/NotFoundPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import BookingPage from "./components/BookingPage";
import BookingBathhousePage from "./components/BookingBathhousePage";

import { Routes, Route } from "react-router-dom";

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Qbooking</h1>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/bathhouse/:id" element={<BookingBathhousePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["superadmin", "bath_admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/rooms"
          element={
            <ProtectedRoute allowedRoles={["superadmin", "bath_admin"]}>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/menu"
          element={
            <ProtectedRoute allowedRoles={["superadmin", "bath_admin"]}>
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
