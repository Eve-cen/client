import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const PropertyCard = ({ property, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={
          property.coverImage ||
          property.images[0] ||
          "https://via.placeholder.com/300x200"
        }
        alt={property.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {property.title}
        </h3>
        <p className="text-sm text-gray-600">{property.location.address}</p>
        {/* <p className="text-lg font-bold text-pink-600 mt-2">
          ${property.pricing.weekdayPrice}/day
        </p> */}
        {property.pricing?.pricingType === "HOURLY" ? (
          <p className="text-lg">${property.pricing?.hourlyPrice} / hour</p>
        ) : (
          <p className="text-lg">${property.pricing?.weekdayPrice} / night</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {property.features.sizeSQM} SQM • {property.features.seatCapacity}{" "}
          seats
        </p>
        <div className="mt-4 flex space-x-2">
          <Button
            onClick={() => navigate(`/property/${property._id}`)}
            className="flex-1 bg-gray-400 text-gray-700 hover:bg-gray-200"
          >
            View
          </Button>
          <Button
            onClick={() => onEdit(property)}
            className="flex-1 bg-primary text-white hover:bg-primary/80"
          >
            Edit
          </Button>
          <Button
            onClick={() => onDelete(property._id)}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
