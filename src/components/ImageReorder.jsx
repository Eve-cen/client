import React from "react";

const ImageReorder = ({ images, onReorder, onAddMore }) => {
  const handleDragStart = (e, index) => e.dataTransfer.setData("index", index);
  const handleDrop = (e, targetIndex) => {
    const sourceIndex = e.dataTransfer.getData("index");
    const newImages = [...images];
    const [moved] = newImages.splice(sourceIndex, 1);
    newImages.splice(targetIndex, 0, moved);
    onReorder(newImages);
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-4 pb-10 h-[500px] md:h-[600px] overflow-scroll">
      {images.map((img, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, index)}
          className={`relative w-full rounded-lg overflow-hidden border border-gray-300 ${
            index === 0
              ? "col-span-2 h-80" // First image spans all columns
              : "h-64"
          }`}
        >
          <img
            src={img}
            alt={`Space ${index}`}
            className="w-full h-full object-cover"
          />
          {index === 0 && (
            <span className="absolute top-2 left-2 bg-pink-600 text-white px-2 py-1 rounded">
              Cover
            </span>
          )}
        </div>
      ))}

      <button
        onClick={onAddMore}
        className="w-full h-40 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center text-pink-600 hover:bg-gray-200"
      >
        + Add More
      </button>
    </div>
  );
};

export default ImageReorder;
