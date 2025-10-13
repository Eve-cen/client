import React from "react";
import ReviewCard from "./ReviewCard";

const ReviewsSection = ({ reviews }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
      {reviews.length > 0 ? (
        reviews.map((review) => <ReviewCard key={review._id} review={review} />)
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}
    </div>
  );
};

export default ReviewsSection;
