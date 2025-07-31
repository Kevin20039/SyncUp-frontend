import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import { AuthContext } from "./context/AuthContext";
import Messenger from "./pages/messenger/Messenger"; // --- ADD THIS IMPORT ---

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Register />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to="/login" />} />
        
        {/* --- ADD THIS NEW ROUTE FOR THE CHAT PAGE --- */}
        <Route path="/messenger" element={!user ? <Navigate to="/" /> : <Messenger />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;