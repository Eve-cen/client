import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ProfileSidebar from "../components/ProfileSidebar";
import Button from "../components/Button";
import { Menu, X } from "lucide-react";
import vencomeLoader from "../components/Loader";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchBookings();
    if (searchParams.get("success")) {
      alert("Payment successful! Booking confirmed.");
      window.history.replaceState({}, "", "/my-bookings");
    }
    if (searchParams.get("cancel")) {
      alert("Payment cancelled.");
      window.history.replaceState({}, "", "/my-bookings");
    }
  }, [searchParams]);

  const fetchBookings = async () => {
    try {
      const data = await apiFetch({
        endpoint: "/bookings",
        credentials: "include",
      });
      setBookings(data);
      console.log(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (bookingId) => {
    try {
      const { url } = await apiFetch({
        endpoint: "/payments/create-checkout-session",
        method: "POST",
        body: { bookingId },
        credentials: "include",
      });
      console.log(url);
      window.location.href = url;
    } catch (err) {
      alert("Failed to start payment");
    }
  };
  if (loading) return <vencomeLoader />;

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button - Fixed at top */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-18 right-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>
      {/* MOBILE OVERLAY (shows only when sidebarOpen = true) */}
      {sidebarOpen && (
        <div
          className="
      fixed inset-0 bg-black/40 backdrop-blur-sm
      z-30 lg:hidden
      transition-opacity duration-300
    "
          onClick={() => setSidebarOpen(false)} // Clicking overlay closes sidebar
        ></div>
      )}
      {/* SIDEBAR CONTAINER */}
      <div
        className={`
    fixed lg:static inset-y-0 left-0 z-40
    w-64 bg-white shadow-lg lg:shadow-none
    transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        <ProfileSidebar onLinkClick={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 ml-0 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
            My Bookings
          </h1>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-500">No bookings yet.</p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="mt-6 bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700"
              >
                Explore Spaces
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="overflow-hidden flex flex-col sm:flex-row"
                >
                  <img
                    src={booking.property?.coverImage}
                    alt={booking.property?.title}
                    className="w-full sm:w-48 h-48 object-cover"
                  />
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      {booking.property?.title}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {new Date(booking.checkIn).toLocaleDateString()} –{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-pink-600">
                          ${booking.totalPrice}
                        </p>
                        {booking.discountApplied > 0 && (
                          <p className="text-sm text-green-600">
                            Saved ${booking.discountApplied.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-4 py-2 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>

                        {!booking.isPaid && booking.status !== "declined" && (
                          <Button
                            onClick={() => handlePay(booking._id)}
                            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition"
                          >
                            Pay Now
                          </Button>
                        )}

                        {booking.isPaid && (
                          <span className="text-green-600 font-medium flex items-center">
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
