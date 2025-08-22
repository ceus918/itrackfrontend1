
import './App.css';

import AppController from './components/AppController';
import React, { useState } from 'react';
import { UserContext } from './components/UserContext';

function App() {
  const [user, setUser] = useState(() => {
    // Load from localStorage if available
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Save to localStorage whenever user changes
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);
  return (
    <UserContext.Provider value={{ user, setUser }}>
    <div className="App">
      <AppController/>
    </div>
    </UserContext.Provider>
  );
}

export default App;
