import { useState, useRef, useEffect } from "react";

export default function UploadModal({ onClose, onUpload }) {
  const [imageFiles, setImageFiles] = useState([]); // ✅ Store File objects
  const [imagePreviews, setImagePreviews] = useState([]); // ✅ Store blob URLs for preview
  const fileInputRef = useRef(null);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) return;

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleBrowse = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) return;

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    // Revoke blob URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (imageFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    if (onUpload) {
      onUpload(imageFiles); // ✅ Pass File objects, not blob URLs
    }

    // Clean up blob URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Upload Photos</h3>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 p-4 mb-4 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current.click()}
        >
          <p className="text-gray-600">
            Drag and drop images here, or{" "}
            <span className="text-primary font-semibold">browse</span>
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleBrowse}
            className="hidden"
          />
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4 max-h-60 overflow-y-auto">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Upload preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {imagePreviews.length > 0 && (
          <p className="text-sm text-gray-600 mb-4">
            {imagePreviews.length} image{imagePreviews.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={imageFiles.length === 0}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Upload ({imageFiles.length})
          </button>
        </div>
      </div>
    </div>
  );
}
