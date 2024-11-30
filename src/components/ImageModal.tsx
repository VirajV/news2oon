import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
  onDownload: () => void;
}

export default function ImageModal({ imageUrl, title, onClose, onDownload }: ImageModalProps) {
  // Close modal when clicking outside the image
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={onDownload}
          className="absolute top-4 right-16 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
        >
          <Download className="w-6 h-6 text-gray-700" />
        </button>
        <div className="p-4">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <p className="mt-4 text-lg font-medium text-gray-900">{title}</p>
        </div>
      </div>
    </div>
  );
}