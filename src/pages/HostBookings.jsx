import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import Sidebar from "../components/Sidebar";
import VencomeLoader from "../components/Loader";

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const data = await apiFetch({
      endpoint: "/bookings/host",
      credentials: "include",
    });
    setBookings(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const updated = await apiFetch({
      endpoint: `/bookings/${id}/status`,
      method: "PUT",
      body: { status },
      credentials: "include",
    });
    setBookings((prev) => prev.map((b) => (b._id === id ? updated : b)));
  };

  if (loading) return <VencomeLoader />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeSection="/host/bookings" />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">Bookings</h1>
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white p-4 rounded-lg shadow mb-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{booking.property.title}</p>
              <p>Guest: {booking.guest.name}</p>
              <p>
                Dates: {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                {new Date(booking.checkOut).toLocaleDateString()}
              </p>
              <p className="font-bold">${booking.totalPrice}</p>
            </div>
            <div className="space-x-2">
              {booking.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(booking._id, "confirmed")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(booking._id, "declined")}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Decline
                  </button>
                </>
              )}
              <span
                className={`px-3 py-1 rounded text-white ${
                  booking.status === "confirmed"
                    ? "bg-green-600"
                    : booking.status === "declined"
                    ? "bg-red-600"
                    : "bg-yellow-600"
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostBookings;
