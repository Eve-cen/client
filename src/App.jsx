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
import CreateSpace from "./pages/CreateSpace";
import MyListings from "./pages/MyListings";
import HostProfile from "./pages/HostProfile";
import CategoryPage from "./pages/CategoryPage";
import HostBookings from "./pages/HostBookings";
import MyBookings from "./pages/MyBookings";
import BlogList from "./components/BlogList";
import BlogDetails from "./pages/BlogDetails";
import SearchPage from "./pages/SearchPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatPage from "./pages/ChatPage";
import Conversation from "./pages/Conversation";
import ScrollToTop from "./components/scrollToTop";

function AppContent() {
  const location = useLocation();
  const queryClient = new QueryClient();

  // ✅ Hide navbar only on homepage
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ToastContainer />
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/create-space" element={<CreateSpace />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/profile/*" element={<Profile />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/chat/:conversationId" element={<Conversation />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/host/:id" element={<HostProfile />} />
            <Route path="/host/bookings" element={<HostBookings />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/" element={<Homepage />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
        </div>
      </QueryClientProvider>
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
