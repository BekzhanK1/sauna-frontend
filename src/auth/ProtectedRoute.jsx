import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useContext(AuthContext);

    if (!user) {
        // Not logged in
        console.log("User not logged in, redirecting to login page");
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Role not allowed
        return <Navigate to="/" replace />;
    }

    return children;
}
