import { FC } from 'react';

interface RestaurantImage {
  url: string;
  alt: string;
  title: string;
  description: string;
}

export const RestaurantImage: FC<RestaurantImage> = ({ url, alt, title, description }) => (
  <div className="relative w-full h-full">
    <img
      src={url}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-1000"
    />
    <div className="absolute inset-0 bg-black/50">
      <div className="flex flex-col items-center justify-center h-full text-white space-y-4 p-4">
        <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-center">
          {description}
        </p>
      </div>
    </div>
  </div>
);
