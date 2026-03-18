import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ProfileSidebar from "../components/ProfileSidebar";
import Button from "../components/Button";
import { Menu, X, AlertTriangle, Loader2 } from "lucide-react";
import VencomeLoader from "../components/Loader";
import { toast } from "react-toastify";

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
const CancelModal = ({ booking, onConfirm, onClose, loading }) => {
  if (!booking) return null;

  const refundPolicy =
    booking.property?.bookingSettings?.refundPolicy || "non-refundable";
  const hoursUntilCheckIn =
    (new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60);

  const getRefundPreview = () => {
    switch (refundPolicy) {
      case "flexible":
        return hoursUntilCheckIn > 24
          ? { percent: 100, label: "Full refund", color: "text-green-600" }
          : {
              percent: 0,
              label: "No refund — within 24hrs of check-in",
              color: "text-red-500",
            };
      case "moderate":
        return hoursUntilCheckIn > 5 * 24
          ? { percent: 100, label: "Full refund", color: "text-green-600" }
          : {
              percent: 0,
              label: "No refund — within 5 days of check-in",
              color: "text-red-500",
            };
      case "strict":
        return hoursUntilCheckIn > 7 * 24
          ? { percent: 50, label: "50% refund", color: "text-yellow-600" }
          : {
              percent: 0,
              label: "No refund — within 7 days of check-in",
              color: "text-red-500",
            };
      case "non-refundable":
      default:
        return {
          percent: 0,
          label: "No refund — non-refundable booking",
          color: "text-red-500",
        };
    }
  };

  const refund = getRefundPreview();
  const refundAmount = ((booking.totalPrice * refund.percent) / 100).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-red-600" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  Cancel booking?
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Booking summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex items-center gap-3">
              {booking.property?.coverImage && (
                <img
                  src={booking.property.coverImage}
                  alt={booking.property.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {booking.property?.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(booking.checkIn).toLocaleDateString()} –{" "}
                  {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">Total paid</span>
              <span className="font-bold text-gray-800">
                ${booking.totalPrice}
              </span>
            </div>
          </div>

          {/* Refund preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Refund estimate
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Policy</span>
              <span className="text-sm font-medium text-gray-800 capitalize">
                {refundPolicy}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Refund</span>
              <span className={`text-sm font-semibold ${refund.color}`}>
                {refund.label}
              </span>
            </div>
            {refund.percent > 0 && booking.isPaid && (
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                <span className="text-sm font-semibold text-gray-700">
                  You'll receive
                </span>
                <span className="text-base font-bold text-green-600">
                  ${refundAmount}
                </span>
              </div>
            )}
            {!booking.isPaid && (
              <p className="text-xs text-gray-400 mt-1">
                No payment was made — nothing to refund.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              Keep booking
            </button>
            <button
              onClick={() => onConfirm(booking._id)}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Yes, cancel"
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// ─── MyBookings ───────────────────────────────────────────────────────────────
const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const [cancelTarget, setCancelTarget] = useState(null); // booking object
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
    if (searchParams.get("success")) {
      toast.success("Payment successful! Booking confirmed.");
      window.history.replaceState({}, "", "/my-bookings");
    }
    if (searchParams.get("cancel")) {
      toast.error("Payment cancelled.");
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
      window.location.href = url;
    } catch (err) {
      alert("Failed to start payment");
    }
  };

  const goToChat = async (bookingId, hostId) => {
    try {
      const conversation = await apiFetch({
        endpoint: `/chat/conversation/${bookingId}`,
        method: "POST",
        body: { hostId },
        credentials: "include",
      });
      navigate(`/chat/${conversation._id}`);
    } catch (err) {
      console.error(err);
      alert("Unable to open chat. Please try again.");
    }
  };

  const [filter, setFilter] = useState("active"); // "active" | "cancelled"

  const filteredBookings = bookings.filter((b) =>
    filter === "cancelled"
      ? b.status === "cancelled"
      : !["cancelled"].includes(b.status)
  );

  const isCancellable = (booking) => {
    if (["cancelled", "completed", "declined"].includes(booking.status))
      return false;
    return new Date(booking.checkIn) > new Date();
  };

  const handleCancelConfirm = async (bookingId) => {
    setCancelling(true);
    try {
      const data = await apiFetch({
        endpoint: `/bookings/${bookingId}/cancel`,
        method: "DELETE",
        credentials: "include",
      });

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: "cancelled", refund: data.refund }
            : b
        )
      );

      setCancelTarget(null);

      if (data.refund?.amount > 0) {
        toast.success(
          `Booking cancelled. $${data.refund.amount.toFixed(
            2
          )} refund is on its way.`
        );
      } else {
        toast.info("Booking cancelled. No refund applies.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <VencomeLoader />;

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button */}
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg lg:shadow-none transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <ProfileSidebar onLinkClick={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 ml-0 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              My Bookings
            </h1>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
              {[
                {
                  key: "active",
                  label: "Active",
                  count: bookings.filter((b) => b.status !== "cancelled")
                    .length,
                },
                {
                  key: "cancelled",
                  label: "Cancelled",
                  count: bookings.filter((b) => b.status === "cancelled")
                    .length,
                },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    filter === key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        filter === key
                          ? key === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-primary/10 text-primary"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400">
                {filter === "cancelled"
                  ? "No cancelled bookings."
                  : "No active bookings yet."}
              </p>
              {filter === "active" && (
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="mt-6 bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/80"
                >
                  Explore Spaces
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="overflow-hidden flex flex-col sm:flex-row bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                  <img
                    src={booking.property?.coverImage}
                    alt={booking.property?.title}
                    className="w-full sm:w-48 h-48 object-cover"
                  />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {booking.property?.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-gray-500 mt-1 text-sm">
                      {new Date(booking.checkIn).toLocaleDateString()} –{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                    </p>

                    {/* Refund info if cancelled */}
                    {booking.status === "cancelled" && booking.refund && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">
                        {booking.refund.amount > 0
                          ? `Refund of $${booking.refund.amount.toFixed(
                              2
                            )} processed`
                          : booking.refund.reason || "No refund"}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex gap-2 items-baseline">
                        <p className="text-2xl font-bold text-primary">
                          ${booking.totalPrice}
                        </p>
                        {booking.discountApplied > 0 && (
                          <p className="text-xs text-green-600">
                            Saved ${booking.discountApplied.toFixed(2)}
                          </p>
                        )}
                        {booking.isPaid && (
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {!booking.isPaid &&
                          booking.status !== "declined" &&
                          booking.status !== "cancelled" && (
                            <Button
                              onClick={() => handlePay(booking._id)}
                              className="bg-gradient-to-r from-primary to-purple-600 text-white px-5 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition text-sm"
                            >
                              Pay Now
                            </Button>
                          )}

                        <Button
                          onClick={() => goToChat(booking._id, booking.host)}
                          className="bg-primary text-white text-sm px-5 py-2 rounded-full"
                        >
                          Message Host
                        </Button>

                        {isCancellable(booking) && (
                          <button
                            onClick={() => setCancelTarget(booking)}
                            className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline transition-colors px-1"
                          >
                            Cancel
                          </button>
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

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => !cancelling && setCancelTarget(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
};

export default MyBookings;
