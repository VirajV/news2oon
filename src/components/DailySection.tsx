import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { getDailyGenerations } from '../lib/supabase';
import type { CartoonGeneration } from '../types';
import ImageModal from './ImageModal';
import 'swiper/css';
import 'swiper/css/navigation';

export default function DailySection() {
  const [dailyItems, setDailyItems] = useState<CartoonGeneration[]>([]);
  const [selectedImage, setSelectedImage] = useState<CartoonGeneration | null>(null);

  useEffect(() => {
    getDailyGenerations()
      .then(setDailyItems)
      .catch(console.error);
  }, []);

  const handleDownload = async () => {
    if (!selectedImage) return;

    try {
      const response = await fetch(selectedImage.image_url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `news2toon-${selectedImage.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 px-4">Today's Top 10</h2>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="daily-swiper"
      >
        {dailyItems.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-4">
                <p className="text-white text-sm line-clamp-2">
                  {item.title}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.image_url}
          title={selectedImage.title}
          onClose={() => setSelectedImage(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}