import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ This is correct
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from "./components/UserContext";


const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

// Optional: still include reportWebVitals if you use it
reportWebVitals();
