import Navbar from "./components/Navbar";
import Home from "./pages/HomePage";
import WelcomePage from "./pages/WelcomePage";
import { Routes, Route } from "react-router-dom";
import WealthJourney from "./pages/WealthJourney";
import WealthProjector from "./pages/WealthProjector";
import { useAuth } from "./contexts/AuthContext";
import { useState } from "react";
import AuthModal from "./components/AuthModal";
import CompanyDashboard from './pages/CompanyDashboard.jsx';   // ⬅️ new

function App() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}

      <Navbar />
      
      {!user ? (
        <WelcomePage openAuth={() => setAuthModalOpen(true)} />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wealth-journey" element={<WealthJourney />} />
          <Route path="/wealth-projector" element={<WealthProjector />} />
          <Route path="/company/:symbol" element={<CompanyDashboard />} />
        </Routes>
      )}
    </>
  );
}

export default App;
