import { Star } from "lucide-react";
import React from "react";

const ReviewCard = ({ review, key }) => {
  return (
    <div key={key} className="flex gap-4">
      <img
        src={review.image}
        alt={review.name}
        className="w-14 h-14 rounded-full object-cover"
      />
      <div className="text-left">
        <h4 className="font-semibold">{review.name}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center text-yellow-500">
            {[...Array(review.rating)].map((_, i) => (
              // <Star key={i} size={14} fill="currentColor" />
              <span key={i} className="text-yellow-500">
                ★
              </span>
            ))}
          </div>
          <span>{review.date}</span>
        </div>
        <p className="mt-2 text-gray-700 text-sm leading-relaxed">
          {review.text}
        </p>
      </div>
    </div>
  );
};

export default ReviewCard;
