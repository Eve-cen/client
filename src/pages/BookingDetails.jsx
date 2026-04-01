import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import VencomeLoader from "../components/Loader";

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-red-50 text-red-600 border border-red-200",
    dot: "bg-red-500",
  },
};

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
  loading,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8">
        <div className="text-4xl text-center mb-4">
          {confirmClass?.includes("red") ? "⚠️" : "✓"}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 text-center mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-500 text-center leading-relaxed mb-8">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 cursor-pointer ${confirmClass}`}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm text-slate-800 font-medium">{value || "—"}</span>
    </div>
  );
}

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await apiFetch({
          endpoint: `/bookings/${id}`,
          method: "GET",
          cacheable: true,
        });
        if (data.status === 401) {
          navigate("/login");
          return;
        }
        setBooking(data);

        // Both property and guest are raw ObjectId strings — fetch in parallel
        const propertyId =
          typeof data.property === "object" ? data.property._id : data.property;
        const guestId =
          typeof data.guest === "object" ? data.guest._id : data.guest;

        const [propertyData, guestData] = await Promise.allSettled([
          propertyId
            ? apiFetch({
                endpoint: `/properties/${propertyId}`,
                method: "GET",
                cacheable: true,
              })
            : null,
          guestId
            ? apiFetch({
                endpoint: `/profile/${guestId}`,
                method: "GET",
                cacheable: true,
              })
            : null,
        ]);

        if (propertyData.status === "fulfilled" && propertyData.value)
          setProperty(propertyData.value.property);
        if (guestData.status === "fulfilled" && guestData.value)
          setGuest(guestData.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAccept = useCallback(async () => {
    setActionLoading(true);
    try {
      await apiFetch({
        endpoint: `/bookings/${id}/status`,
        method: "PUT",
        body: { status: "confirmed" },
      });
      setBooking((prev) => ({ ...prev, status: "confirmed" }));
      setModal(null);
      showToast("Booking confirmed successfully.");
    } catch {
      showToast("Failed to confirm booking.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [id]);

  const handleCancel = useCallback(async () => {
    setActionLoading(true);
    try {
      await apiFetch({ endpoint: `/bookings/${id}/cancel`, method: "DELETE" });
      setBooking((prev) => ({ ...prev, status: "cancelled" }));
      setModal(null);
      showToast("Booking cancelled.");
    } catch {
      showToast("Failed to cancel booking.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [id]);

  if (loading) return <VencomeLoader />;
  if (!booking)
    return <div className="p-8 text-slate-400">Booking not found.</div>;

  const { checkIn, checkOut, totalPrice, status, guests } = booking;
  const nights =
    booking.totalNights ??
    Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const canAccept = status === "pending";
  const canCancel = status !== "cancelled";
  const initials = `${guest?.firstName?.[0] || ""}${
    guest?.lastName?.[0] || ""
  }`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium ${
            toast.type === "error" ? "bg-red-600" : "bg-slate-900"
          }`}
        >
          <span>{toast.type === "error" ? "⚠" : "✓"}</span>
          {toast.message}
        </div>
      )}

      {/* Modals */}
      {modal === "accept" && (
        <ConfirmModal
          title="Confirm this booking?"
          message="The guest will be notified and the booking status will update to Confirmed."
          confirmLabel="Yes, Confirm"
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={handleAccept}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === "cancel" && (
        <ConfirmModal
          title="Cancel this booking?"
          message="This may trigger a refund based on your cancellation policy. This cannot be undone."
          confirmLabel="Yes, Cancel"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleCancel}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Dark header */}
      <div className="bg-primary px-6 pt-6 pb-10 lg:px-10">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-200 hover:text-slate-400 text-sm font-medium mb-6 flex items-center gap-1.5 transition cursor-pointer"
        >
          ← Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 max-w-5xl">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-slate-200 uppercase mb-1.5">
              Booking #{id?.slice(-6).toUpperCase()}
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              {property?.name || "Property Booking"}
            </h1>
            <p className="text-slate-200 text-sm mt-1">
              {property?.address ||
                property?.location?.address ||
                "Address on file"}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase self-start shrink-0 ${statusCfg.classes}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 -mt-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left — spans 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Property card */}
            {property && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {property.images?.[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-6">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                    Property
                  </p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {property.name}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {property.address ||
                      property.location?.address ||
                      property.location?.city ||
                      "—"}
                  </p>
                  <div className="border-t border-slate-100 mt-4 pt-1">
                    {property.category && (
                      <InfoRow
                        label="Category"
                        value={property.category?.name ?? property.category}
                      />
                    )}
                    {property.subcategory && (
                      <InfoRow
                        label="Type"
                        value={
                          property.subcategory?.name ?? property.subcategory
                        }
                      />
                    )}
                    {property.pricePerNight && (
                      <InfoRow
                        label="Price / night"
                        value={`€${property.pricePerNight}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Guest card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
                Guest
              </p>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {initials || "?"}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {guest?.firstName} {guest?.lastName}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {guest?.email}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <InfoRow label="Phone" value={guest?.phoneNumber} />
                <InfoRow label="Guests" value={guests} />
              </div>
            </div>

            {/* Stay card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
                Stay Details
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Check-in
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(checkIn).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Check-out
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(checkOut).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <InfoRow
                  label="Duration"
                  value={`${nights} night${nights !== 1 ? "s" : ""}`}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Payment */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
                Payment
              </p>
              <p className="text-4xl font-bold text-slate-900 leading-none tracking-tight">
                €{totalPrice?.toLocaleString()}
              </p>
              <p className="text-slate-400 text-xs font-medium mt-2">
                Total charged
              </p>
              {nights > 0 && (
                <p className="text-slate-300 text-xs mt-1">
                  ≈ €{Math.round(totalPrice / nights)} / night
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
                Actions
              </p>
              <div className="flex flex-col gap-3">
                {canAccept && (
                  <button
                    onClick={() => setModal("accept")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold transition cursor-pointer"
                  >
                    ✓ Accept Booking
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => setModal("cancel")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 active:scale-95 text-red-600 text-sm font-semibold transition cursor-pointer"
                  >
                    ✕ Cancel Booking
                  </button>
                )}
                <button
                  onClick={() =>
                    navigate(`/messages?guest=${guest?._id}&booking=${id}`)
                  }
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-sm font-semibold transition cursor-pointer"
                >
                  ✉ Message Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
