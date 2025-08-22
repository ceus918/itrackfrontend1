import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { UserProvider } from "./UserContext";


export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from backend using token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user); // expects {id, name, role, ...}
      } catch (err) {
        console.error("Invalid/expired token", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
