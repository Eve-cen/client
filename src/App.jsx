import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./PrivateRoute";
import Homepage from "./pages/Homepage";
import Navbar from "./components/Navbar";
import PropertyDetails from "./pages/PropertyDetails";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

function AppContent() {
  const location = useLocation();

  // ✅ Hide navbar only on homepage
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/settings/*" element={<Settings />} />
          <Route path="/profile/*" element={<Profile />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/" element={<Homepage />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
