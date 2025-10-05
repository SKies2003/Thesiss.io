import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import 'flowbite';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import '@fontsource/montserrat/700.css'; // for headlines

// import { AuthProvider } from './contexts/AuthContext.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* <AuthProvider> */}
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      {/* </AuthProvider> */}
    </BrowserRouter>
  </StrictMode>
);
