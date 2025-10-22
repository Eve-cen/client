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
    <div className="grid grid-cols-3 gap-2 mb-4">
      {images.map((img, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, index)}
          className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden"
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
        className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-pink-600 hover:bg-gray-300"
      >
        Add More
      </button>
    </div>
  );
};

export default ImageReorder;
