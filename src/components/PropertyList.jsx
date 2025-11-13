import React from "react";
import Card from "./EvenCard";

const Featured = ({ properties }) => {
  const hasProperties = Array.isArray(properties) && properties.length > 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl text-gray-900 mb-8">Featured Event Centers</h2>

      {hasProperties ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <Card
              key={property._id}
              id={property._id}
              image={property.image}
              title={property.title}
              price={property.pricing?.weekdayPrice}
              rating={property.rating}
              location={property.location}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg text-center mt-10">
          No featured event centers available at the moment.
        </p>
      )}
    </div>
  );
};

export default Featured;
