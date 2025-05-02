import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.is_admin !== 1) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
