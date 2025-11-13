import React, { useState } from "react";

const ImageUploadPopup = ({ onClose, onUpload }) => {
  const [images, setImages] = useState([]);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setImages((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleBrowse = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setImages((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleUpload = () => {
    onUpload(images);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Upload Photos</h3>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 p-4 mb-4 text-center"
        >
          Drag and drop images here, or{" "}
          <label className="text-pink-600 cursor-pointer">browse</label>
          <input
            type="file"
            multiple
            onChange={handleBrowse}
            // className="hidden"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="Upload preview"
              className="w-full h-20 object-cover rounded"
            />
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPopup;
