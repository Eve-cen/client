import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({ id, imageUrl, title, description, buttonText }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${id}`);
  };
  return (
    <div className="min-h-[500px] relative w-full rounded-[16px] overflow-hidden shadow-lg bg-white">
      {/* Image with overlay gradient */}
      <div
        className="relative h-[500px] bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Text Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h2 className="text-4xl font-semibold mb-2">{title}</h2>
        <p className="text-sm mb-6">{description}</p>

        {/* Button */}
        <a
          onClick={handleClick}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          {buttonText}
          <svg
            className="ml-2 -mr-1 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default CategoryCard;
