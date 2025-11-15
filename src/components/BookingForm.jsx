import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Button from "./Button"; // adjust if needed
import { apiFetch } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function BookingForm({ property }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  const [formData, setFormData] = useState({
    checkInTime: "14:00",
    checkOutTime: "11:00",
  });

  const nights = differenceInDays(range[0].endDate, range[0].startDate);
  const pricePerNight = property.pricing.weekdayPrice; // example
  const totalPrice = nights * pricePerNight;

  const generateTimes = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimes();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const booking = await apiFetch({
        endpoint: "/bookings",
        method: "POST",
        body: {
          propertyId: property._id,
          checkIn: range[0].startDate,
          checkOut: range[0].endDate,
          guests,
          extras: [
            { name: "Projector", price: 50 },
            { name: "Sound System", price: 50 },
            { name: "Catering Available", price: 50 },
          ],
        },
        credentials: "include",
      });
      setShowModal(true);

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowModal(false);
            navigate("/my-bookings", { replace: true });
            window.location.reload(); // Reload homepage
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex border rounded-2xl w-full mb-4">
        <div className="flex-1 flex-col border-r px-4 py-3">
          <p>Check-in:</p>
          <span className="text-lg font-semibold">
            {range[0].startDate.toLocaleDateString()}
          </span>
        </div>
        <div className="flex-1 flex-col px-4 py-3">
          <p>Check-out:</p>
          <span className="text-lg font-semibold">
            {range[0].endDate.toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label
            htmlFor="checkInTime"
            className="block text-sm font-medium mb-1"
          >
            Check-in Time
          </label>
          <select
            name="checkInTime"
            value={formData.checkInTime}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="checkOutTime"
            className="block text-sm font-medium mb-1"
          >
            Check-out Time
          </label>
          <select
            name="checkOutTime"
            value={formData.checkOutTime}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <DateRange
          ranges={range}
          onChange={(item) => setRange([item.selection])}
          moveRangeOnFirstSelection={false}
          rangeColors={["#305CDE"]} // Tailwind pink-500
          minDate={new Date()}
          showDateDisplay={false}
        />

        <p className="text-lg font-semibold">
          Total: ${totalPrice} ({nights} nights)
        </p>

        <div className="my-4">
          <label className="block mb-1 font-medium">Guests:</label>
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || nights <= 0}
          children={loading ? "Booking..." : "Book Now"}
        />
      </form>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
              minWidth: "300px",
            }}
          >
            <h2>Your booking is successfully created!</h2>
            <p>
              Redirecting in {countdown} second{countdown > 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
