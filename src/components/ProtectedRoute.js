import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>; // wait until user is loaded
  }

  return user ? children : <Navigate to="/" replace />; // redirect to login if no user
};

export default ProtectedRoute;
