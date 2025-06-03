import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Article {
  image: string;
  title: string;
  category?: string;
  author: string;
  date: string;
}

const mockData: Article[] = [
  {
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
    title:
      "This 400-Square-Foot New York Apartment Is Maximized With Custom Millwork",
    category: "Tips and Trick",
    author: "Morgan Goldberg",
    date: "Tuesday, 17 May 2022",
  },
  {
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
    title: "Modern Living Room Design Ideas",
    category: "Design Ideas",
    author: "Jane Doe",
    date: "Friday, 20 May 2022",
  },
  {
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
    title: "Eco-Friendly Home Renovation Tips",
    category: "Sustainability",
    author: "John Smith",
    date: "Monday, 23 May 2022",
  },
];

const ArticleCard = ({ image, title, category, author, date }: Article) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="max-w-4xl">
          {category && (
            <span className="inline-block mb-3 px-3 py-1 text-sm bg-gray-600/80 text-white rounded-full backdrop-blur-sm">
              {category}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">
            {title}
          </h2>
          <div className="flex items-center text-sm text-gray-200 space-x-2">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
              alt={author}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>By {author}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function ArticleSwiper() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mockData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mockData.length) % mockData.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-full">
      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 z-20 transform -translate-y-1/2 rounded-full bg-gray-800/70 hover:bg-gray-800/90 p-3 transition-all duration-200"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 z-20 transform -translate-y-1/2 rounded-full bg-gray-800/70 hover:bg-gray-800/90 p-3 transition-all duration-200"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slides container */}
      <div className="relative overflow-hidden h-full rounded-lg">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {mockData.map((item, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <ArticleCard {...item} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {mockData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ArticleSwiper;
