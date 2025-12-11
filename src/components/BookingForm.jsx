import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Button from "./Button";
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

  const [checkInTime, setCheckInTime] = useState("09:00"); // default
  const [checkOutTime, setCheckOutTime] = useState("18:00"); // default

  // Generate time options every 30 mins
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

  // Calculate hours per day based on times only (ignore dates)
  const getHoursPerDay = () => {
    const tempStart = new Date(2025, 0, 1); // arbitrary same day
    const [startH, startM] = checkInTime.split(":").map(Number);
    tempStart.setHours(startH, startM, 0, 0);

    const tempEnd = new Date(2025, 0, 1);
    const [endH, endM] = checkOutTime.split(":").map(Number);
    tempEnd.setHours(endH, endM, 0, 0);

    if (tempEnd <= tempStart) {
      return 0; // invalid
    }

    return (tempEnd - tempStart) / (1000 * 60 * 60);
  };

  // Actual check-in/out for submit (startDate + inTime, endDate + outTime)
  const getFullCheckIn = () => {
    const date = new Date(range[0].startDate);
    const [hours, minutes] = checkInTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const getFullCheckOut = () => {
    const date = new Date(range[0].endDate);
    const [hours, minutes] = checkOutTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Recalculate whenever dates or times change
  const hoursPerDay = getHoursPerDay();
  const checkInFull = getFullCheckIn();
  const checkOutFull = getFullCheckOut();

  // Correct nights calculation
  const startDayOnly = new Date(range[0].startDate);
  startDayOnly.setHours(0, 0, 0, 0);
  const endDayOnly = new Date(range[0].endDate);
  endDayOnly.setHours(0, 0, 0, 0);

  const nights = differenceInDays(endDayOnly, startDayOnly);
  const nightRate = Number(property.pricing?.weekdayPrice) || 0;

  // Same-day booking = 0 nights → treat as 1 night (most booking apps do this)
  const displayNights = nights === 0 ? 1 : nights;
  const totalPriceNightly = displayNights * nightRate;

  // const nights = differenceInDays(range[0].endDate, range[0].startDate) || 1;
  const days = differenceInDays(range[0].endDate, range[0].startDate) + 1 || 1;
  const totalHours = days * hoursPerDay;

  // Pricing calculations (exactly matches updated backend logic)
  const isHourly = property.pricing?.pricingType === "HOURLY";
  const hourlyRate = Number(property.pricing?.hourlyPrice) || 0;

  const subtotal = isHourly ? totalHours * hourlyRate : nights * nightRate;

  // Optional: add extras/discounts here if needed
  const totalPrice = Number(subtotal.toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hoursPerDay <= 0) {
      alert("Check-out time must be after check-in time");
      return;
    }

    if (checkOutFull < checkInFull) {
      alert("Overall check-out must be after check-in");
      return;
    }

    setLoading(true);

    const bookingData = {
      propertyId: property._id,
      checkIn: checkInFull.toISOString(),
      checkOut: checkOutFull.toISOString(),
      guests,
      extras: [], // add selected extras here
    };

    try {
      const booking = await apiFetch({
        endpoint: "/bookings",
        method: "POST",
        body: bookingData,
        credentials: "include",
      });

      console.log("Booking created:", booking);
      setShowModal(true);

      // Countdown redirect
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
      console.error("Booking failed:", err);
      alert("Booking failed: " + (err.message || "Please try again"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex border rounded-2xl w-full mb-4 text-sm">
        <div className="flex-1 border-r px-4 py-3">
          <p className="text-gray-600">Check-in</p>
          <p className="font-semibold">
            {range[0].startDate.toLocaleDateString()}
          </p>
        </div>
        <div className="flex-1 px-4 py-3">
          <p className="text-gray-600">Check-out</p>
          <p className="font-semibold">
            {range[0].endDate.toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Check-in Time
          </label>
          <select
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Check-out Time
          </label>
          <select
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="my-4">
        <label className="block text-sm font-medium mb-1">Guests</label>
        <input
          type="number"
          min="1"
          max={property.maxGuests || 10}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <DateRange
        ranges={range}
        onChange={(item) => setRange([item.selection])}
        moveRangeOnFirstSelection={false}
        rangeColors={["#305CDE"]}
        minDate={new Date()}
        showDateDisplay={false}
        className="mx-auto"
      />

      {/* Price Display - Now Correct for Multi-Day Slots */}
      <div className="mt-6 pt-4 border-t">
        {isHourly ? (
          <div className="space-y-1 text-right">
            <p className="text-gray-600">
              {days} day{days > 1 ? "s" : ""} × {hoursPerDay.toFixed(1)} hrs/day
              × ${hourlyRate}/hr
            </p>
            <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
          </div>
        ) : (
          <div className="space-y-1 text-right">
            {nights === 0 ? (
              <p className="text-orange-600 text-sm">
                Same-day booking = 1 night stay
              </p>
            ) : null}
            <p className="text-gray-600">
              {displayNights} night{displayNights > 1 ? "s" : ""} × ${nightRate}
              /night
            </p>
            <p className="text-2xl font-bold">
              ${totalPriceNightly.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={loading || totalPrice === 0 || hoursPerDay <= 0}
        className="w-full mt-6"
      >
        {loading ? "Booking..." : `Book Now – $${totalPrice.toFixed(2)}`}
      </Button>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600">
              Redirecting in {countdown} second{countdown > 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
