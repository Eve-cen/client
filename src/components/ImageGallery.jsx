import React from "react";

const ImageGallery = ({ images }) => {
  return (
    <div className="w-full">
      <div className="relative w-full h-[500px]">
        <img
          src={images[0] || "https://source.unsplash.com/random/800x400/?house"}
          alt="Main property"
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {images.slice(1, 5).map((img, index) => (
          <img
            key={index}
            src={img || "https://source.unsplash.com/random/200x200/?house"}
            alt={`Property ${index + 2}`}
            className="w-full h-96 object-cover rounded-lg"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
