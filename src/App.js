
import './App.css';

import AppController from './components/AppController';
import React, { useState } from 'react';
import { UserContext } from './components/UserContext';

function App() {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
    <div className="App">
      <AppController/>
    </div>
    </UserContext.Provider>
  );
}

export default App;
