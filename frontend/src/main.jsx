import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import 'flowbite';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import '@fontsource/montserrat/700.css';

import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer        // ← THIS MUST BE HERE
          position="top-right"
          autoClose={2500}
          theme="dark"
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
