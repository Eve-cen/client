import { Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

const ReviewCard = ({ review }) => {
  const [guest, setGuest] = useState(null);

  useEffect(() => {
    if (!review?.guest) return;

    const fetchGuest = async () => {
      try {
        const userDetails = await apiFetch({
          endpoint: `/profile/${review.guest}`,
          method: "GET",
        });
        setGuest(userDetails);
      } catch (err) {
        console.error("Failed to load guest", err);
      }
    };

    fetchGuest();
  }, [review.guest]);

  return (
    <div className="flex gap-4">
      <img
        src={guest?.profileImage || "/avatar-placeholder.png"}
        alt={guest?.displayName || "Guest"}
        className="w-14 h-14 rounded-full object-cover"
      />

      <div className="text-left">
        <h4 className="font-semibold">{guest?.displayName || "Guest"}</h4>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < review.rating ? "text-yellow-500" : "text-gray-300"
                }
                fill={i < review.rating ? "currentColor" : "none"}
              />
            ))}
          </div>

          <span>
            {new Date(review.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <p className="mt-2 text-gray-700 text-sm leading-relaxed">
          {review.comment}
        </p>
      </div>
    </div>
  );
};

export default ReviewCard;
