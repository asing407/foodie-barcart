import { useState, useEffect } from 'react';
import { RestaurantImage } from './RestaurantImage';

export const restaurantImages = [
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    alt: "Main dining area with warm ambient lighting",
    title: "Elegant Main Dining",
    description: "Experience fine dining in our beautifully lit main hall"
  },
  {
    url: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    alt: "Modern bar setup with elegant seating",
    title: "Sophisticated Bar",
    description: "Enjoy craft cocktails at our modern bar"
  },
  {
    url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
    alt: "Private dining section with luxurious decor",
    title: "Private Dining",
    description: "Intimate spaces for special occasions"
  },
  {
    url: "https://images.unsplash.com/photo-1559329007-40df8a9345d8",
    alt: "Outdoor seating area with scenic views",
    title: "Outdoor Terrace",
    description: "Al fresco dining with breathtaking views"
  },
];

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % restaurantImages.length);
    }, 4000); // Change image every 2 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div className="relative w-full h-[80vh] mb-12 overflow-hidden">
      <RestaurantImage {...restaurantImages[currentIndex]} />
    </div>
  );
};
