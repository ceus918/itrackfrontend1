import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    axios
      .get("https://itrack-web-backend.onrender.com/api/checkAuth", { withCredentials: true })
      .then(res => {
        setUser(res.data.authenticated ? res.data.user : null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [location.pathname]);

  if (loading) return <div>Loading...</div>;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/" />;

  // 🚨 If role is Driver → always redirect to /driver-dashboard
  if (user.role === "Driver") {
    return <Navigate to="/" replace />;
  }

  // Role not allowed for this route → redirect to dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
