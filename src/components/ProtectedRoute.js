import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>; // 👈 prevents redirect before user is restored
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
