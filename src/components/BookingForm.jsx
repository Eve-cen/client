import React, { useState } from "react";
import { apiFetch } from "../utils/api";
import Button from "./Button";

const BookingForm = ({ propertyId, pricePerNight }) => {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch({
        endpoint: "/bookings",
        method: "POST",
        body: {
          propertyId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
        },
      });
      alert("Booking successful!");
      console.log("Booking data:", data);
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nights =
    formData.checkIn && formData.checkOut
      ? Math.ceil(
          (new Date(formData.checkOut) - new Date(formData.checkIn)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = nights > 0 ? nights * pricePerNight : 0;

  return (
    <div className="">
      <h3 className="text-xl font-semibold mb-4">Book Your Stay</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          name="checkIn"
          value={formData.checkIn}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          required
        />
        <input
          type="date"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          required
        />
        <p className="text-lg font-semibold">
          Total: ${totalPrice} ({nights} nights)
        </p>
        <Button
          type="submit"
          disabled={
            loading || !formData.checkIn || !formData.checkOut || nights <= 0
          }
          className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          {loading ? "Booking..." : "Book Now"}
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
