import Navbar from './components/Navbar'
import Home from './pages/HomePage.jsx'
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import WealthJourney from './pages/WealthJourney.jsx';
import WealthProjector from './pages/WealthProjector.jsx';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wealth-journey" element={<WealthJourney />} />
        <Route path="/wealth-projector" element={<WealthProjector />} />
      </Routes>
    </>
  );
}
export default App;
