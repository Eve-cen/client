import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import PrivateRoute from "./PrivateRoute";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage";
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
import ChatPage from "./pages/ChatPage";
import Conversation from "./pages/Conversation";
import FAQ from "./pages/FAQ";
import TermsAndConditions from "./pages/TermsAndCondition";
import HelpSupport from "./pages/HelpSupport";
import PropertyAvailability from "./pages/PropertyAvailability";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";

// QueryClient lives OUTSIDE the component tree — never recreated on re-render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ToastContainer position="top-right" autoClose={4000} />
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/host/:id" element={<HostProfile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/help-support" element={<HelpSupport />} />

        {/* Auth required */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/*"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/*"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <PrivateRoute>
              <Conversation />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />

        {/* Host required */}
        <Route
          path="/create-space"
          element={
            <PrivateRoute requireHost>
              <CreateSpace />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <PrivateRoute requireHost>
              <MyListings />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/bookings"
          element={
            <PrivateRoute requireHost>
              <HostBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/property-availability"
          element={
            <PrivateRoute requireHost>
              <PropertyAvailability />
            </PrivateRoute>
          }
        />
        <Route
          path="/availability/:id/availability"
          element={
            <PrivateRoute requireHost>
              <PropertyAvailability />
            </PrivateRoute>
          }
        />

        {/* Admin required */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requireAdmin>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
