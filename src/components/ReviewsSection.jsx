import React from "react";
import ReviewCard from "./ReviewCard";
import Accordion from "./Accordion";

const ReviewsSection = ({ reviews }) => {
  return (
    <Accordion title="Reviews">
      <div className="flex flex-col items-center">
        <img src="/review.png" className="w-48" />
        <p className="font-semibold text-center">
          This home is a guest favorite based on <br /> ratings, reviews, and
          reliability
        </p>
      </div>
      <hr className="my-10" />
      <div className="grid grid-cols-2 gap-10">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </Accordion>
  );
};

export default ReviewsSection;
