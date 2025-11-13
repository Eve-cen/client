import React from "react";
import { Link } from "react-router-dom";

const HostCard = ({ host }) => {
  const joinDate = new Date(host.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={host.profileImage || "https://via.placeholder.com/80"}
          alt={host.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-800">{host.name}</h3>
          <p className="text-sm text-gray-500">Host since {joinDate}</p>
        </div>
      </div>

      {host.bio && <p className="text-gray-700 mb-4">{host.bio}</p>}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-semibold">{host.totalListings}</p>
          <p className="text-gray-500">Listings</p>
        </div>
        <div>
          {host.avgRating ? (
            <>
              <p className="font-semibold flex items-center">
                {host.avgRating} stars
              </p>
              <p className="text-gray-500">{host.totalReviews} reviews</p>
            </>
          ) : (
            <>
              <p className="font-semibold">—</p>
              <p className="text-gray-500">No reviews yet</p>
            </>
          )}
        </div>
      </div>

      <Link
        to={`/host/${host._id}`}
        className="mt-4 inline-block text-pink-600 font-medium hover:underline"
      >
        View Host Profile →
      </Link>
    </div>
  );
};

export default HostCard;
