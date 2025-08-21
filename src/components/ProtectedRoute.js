
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

// Example: get user from React context (set after login)
import { UserContext } from './UserContext';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(UserContext);

  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

export default ProtectedRoute;
