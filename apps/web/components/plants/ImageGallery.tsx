'use client';

import { useState } from 'react';
import type { PlantImage } from '@lwf/types';

interface ImageGalleryProps {
  images: PlantImage[];
  plantName: string;
}

export function ImageGallery({ images, plantName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center">
        <svg
          className="w-20 h-20 text-green-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Primary image */}
        <div 
          className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => setShowLightbox(true)}
        >
          <img
            src={images[selectedIndex].url}
            alt={`${plantName} - ${images[selectedIndex].type || 'image'}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Thumbnail grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity ${
                  selectedIndex === i ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                <img
                  src={img.url}
                  alt={`${plantName} ${img.type || ''}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={images[selectedIndex].url}
              alt={`${plantName} - ${images[selectedIndex].type || 'image'}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}