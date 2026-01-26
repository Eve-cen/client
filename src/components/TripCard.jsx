import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const TripCard = ({ trip, onWriteReview, onBookAgain }) => {
  const navigate = useNavigate();
  const { property, checkIn, checkOut, totalPrice } = trip;
  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <img
        src={property.image}
        alt={property.title}
        className="w-full h-40 object-cover rounded-lg mb-2"
      />
      <h3 className="text-lg font-semibold">{property.title}</h3>
      <p className="text-gray-600">{property.location}</p>
      <p className="text-gray-600">
        Price: ${totalPrice} (${property.price}/night, {nights} nights)
      </p>
      <p className="text-gray-600">
        Dates: {new Date(checkIn).toLocaleDateString()} -{" "}
        {new Date(checkOut).toLocaleDateString()}
      </p>
      {!trip.reviewed && (
        <Button
          onClick={onWriteReview}
          className="mt-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
        >
          Write Review
        </Button>
      )}
      <Button
        onClick={onBookAgain}
        className="mt-2 ml-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
      >
        Book Again
      </Button>
    </div>
  );
};

export default TripCard;
