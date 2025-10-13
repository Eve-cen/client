import React from "react";

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center mb-2">
        <span className="text-yellow-500">★ {review.rating}</span>
      </div>
      <p className="text-gray-600">{review.comment}</p>
      <p className="text-sm text-gray-500 mt-2">
        by {review.user.email || "Anonymous"} on{" "}
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ReviewCard;
