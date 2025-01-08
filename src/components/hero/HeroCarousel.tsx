import { RestaurantImage } from './RestaurantImage';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

export const HeroCarousel = () => (
  <div className="relative h-[80vh] mb-12">
    <Carousel className="w-full h-full">
      <CarouselContent>
        {restaurantImages.map((image, index) => (
          <CarouselItem key={index} className="h-full">
            <RestaurantImage {...image} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  </div>
);