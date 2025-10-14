// import React, { useState } from "react";
// import { apiFetch } from "../utils/api";
// import Button from "./Button";

// const BookingForm = ({ propertyId, pricePerNight }) => {
//   const [formData, setFormData] = useState({
//     checkIn: "",
//     checkOut: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const data = await apiFetch({
//         endpoint: "/bookings",
//         method: "POST",
//         body: {
//           propertyId,
//           checkIn: formData.checkIn,
//           checkOut: formData.checkOut,
//         },
//       });
//       alert("Booking successful!");
//       console.log("Booking data:", data);
//     } catch (err) {
//       setError(err.message || "Booking failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const nights =
//     formData.checkIn && formData.checkOut
//       ? Math.ceil(
//           (new Date(formData.checkOut) - new Date(formData.checkIn)) /
//             (1000 * 60 * 60 * 24)
//         )
//       : 1;
//   const totalPrice = nights > 0 ? nights * pricePerNight : pricePerNight;

//   return (
//     <div className="">
//       <div className="flex border rounded-2xl w-full">
//         <div className="flex-1 flex-col border-r px-4 py-3">
//           <p>Check-in:</p>
//           <span className="text-lg font-semibold">{formData.checkIn}</span>
//         </div>
//         <div className="flex-1 flex-col px-4 py-3">
//           <p>Check-out:</p>
//           <span className="text-lg font-semibold">{formData.checkOut}</span>
//         </div>
//       </div>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="date"
//           name="checkIn"
//           value={formData.checkIn}
//           onChange={handleChange}
//           className="w-full p-2 border rounded-lg"
//           required
//         />
//         <input
//           type="date"
//           name="checkOut"
//           value={formData.checkOut}
//           onChange={handleChange}
//           className="w-full p-2 border rounded-lg"
//           required
//         />
//         <p className="text-lg font-semibold">
//           Total: ${totalPrice} ({nights} nights)
//         </p>
//         <Button
//           type="submit"
//           disabled={
//             loading || !formData.checkIn || !formData.checkOut || nights <= 0
//           }
//           className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
//         >
//           {loading ? "Booking..." : "Book Now"}
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default BookingForm;

import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Button from "./Button"; // adjust if needed

export default function BookingForm() {
  const [loading, setLoading] = useState(false);
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
  const pricePerNight = 120; // example
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Booking successful!");
      setLoading(false);
    }, 1000);
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

        <Button
          type="submit"
          disabled={loading || nights <= 0}
          // className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
          children={loading ? "Booking..." : "Book Now"}
        />
      </form>
    </div>
  );
}
