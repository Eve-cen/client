import React from "react";

const ImageGallery = ({ images }) => {
  return (
    <div className="w-full">
      <div className="relative w-full h-[500px]">
        <img
          src={
            // images[0] ||
            "https://images.squarespace-cdn.com/content/v1/5b850dd4da02bc525570db40/1570534941146-CSQDPR3G9L8RGMG47OZ5/002.jpg?format=2500w"
          }
          alt="Main property"
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {images.slice(1, 5).map((img, index) => (
          <img
            key={index}
            src={
              img ||
              "https://images.squarespace-cdn.com/content/v1/5b850dd4da02bc525570db40/1570534941146-CSQDPR3G9L8RGMG47OZ5/002.jpg?format=2500w"
            }
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
