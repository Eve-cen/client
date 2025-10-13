import React from "react";
import { useNavigate } from "react-router-dom";

const EvenCard = ({ id, image, title, price, rating, location }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/property/${id}`);
  };

  return (
    <div
      className="w-full p-3 flex flex-col gap-3 max-w-sm bg-gray-100 rounded-[16px] shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-72 rounded-[16px] object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 bg-white rounded-[16px]">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{location}</p>
        <div className="flex items-center">
          <p className="text-lg font-bold text-gray-900">
            ${price} <span className="text-sm font-normal">per day</span>
          </p>
          <div className="px-2 py-1 text-sm font-semibold text-gray-800">
            {rating} ★
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvenCard;
