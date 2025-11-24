import Navbar from "./components/Navbar";
import TickerTape from "./components/TickerTape"; // Import Ticker
import Home from "./pages/HomePage";
import WelcomePage from "./pages/WelcomePage";
import { Routes, Route } from "react-router-dom";
import WealthJourney from "./pages/WealthJourney";
import WealthProjector from "./pages/WealthProjector";
import { useAuth } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import MarketOverview from "./pages/MarketOverview";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CompanyDashboard from "./pages/CompanyDashboard";
import PortfolioSummary from "./pages/PortfolioSummary";
import Footer from "./components/Footer";

function App() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (authModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [authModalOpen]);

  return (
    <>
      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}

      <Navbar openAuth={() => setAuthModalOpen(true)} />
      
      {/* Ticker Tape appears on all pages if user is logged in (or always, based on your pref) */}
      {/* Assuming you want it visible always, but maybe only data loads if auth? */}
      {/* Let's show it always for the cool factor */}
      <TickerTape />

      <div className="pt-10"> {/* Add padding-top wrapper to push content down below Ticker */}
        {!user ? (
          <WelcomePage openAuth={() => setAuthModalOpen(true)} />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wealth-journey" element={<WealthJourney />} />
            <Route path="/wealth-projector" element={<WealthProjector />} />
            <Route path="/company/:symbol" element={<CompanyDashboard />} />
            <Route path="/market-overview" element={<MarketOverview />} />
            <Route path="/portfolio-summary" element={<PortfolioSummary />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          
          </Routes>
        )}
      </div>
      <Footer />
    </>
  );
}

export default App;