import React from "react";
import ReviewCard from "./ReviewCard";
import Accordion from "./Accordion";

const ReviewsSection = ({}) => {
  const reviews = [
    {
      name: "Josh Ali",
      date: "July 2025",
      rating: 5,
      text: "Samantha is a great Airbnb host. She made me feel right at home as soon as I arrived and was always up for a chat. The listed room was cozy and my stay included the use of her washing machine, which was a great help after having been on the road for a bit. I would definitely stay at Samantha’s place again 🙌",
      image: "/images/avatar1.png",
    },
    {
      name: "Josh Ali",
      date: "July 2025",
      rating: 5,
      text: "Samantha is a great Airbnb host. She made me feel right at home as soon as I arrived and was always up for a chat. The listed room was cozy and my stay included the use of her washing machine, which was a great help after having been on the road for a bit. I would definitely stay at Samantha’s place again 🙌",
      image: "/images/avatar1.png",
    },
  ];
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
      <div className="flex gap-10">
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
