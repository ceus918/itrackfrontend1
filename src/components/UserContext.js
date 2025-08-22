import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData) => setUser(userData);
  const logout = async () => {
    try {
      await axios.post(
        'https://itrack-web-backend.onrender.com/api/logout',
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Check session on mount
  useEffect(() => {
    axios
      .get('https://itrack-web-backend.onrender.com/api/session', { withCredentials: true })
      .then((res) => {
        if (res.data.user) setUser(res.data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
