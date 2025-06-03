import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Product {
  image: string;
  title?: string;
  description?: string;
}

const mockData: Product[] = [
  {
    image: "/image/border.png",
    title: "Ramadhan Sale Offer",
    description: "Get 40% off the first transaction on Lalasia",
  },
  {
    image: "/image/hetcuu.png",
    title: "Summer Sale",
    description: "Get 30% off on all furniture",
  },
  {
    image: "https://via.placeholder.com/1920x1080?text=Image+3",
    title: "Winter Deals",
    description: "Save up to 50% on home decor",
  },
  {
    image: "https://via.placeholder.com/1920x1080?text=Image+4",
    title: "Clearance Sale",
    description: "Up to 70% off on selected items",
  },
  {
    image: "https://via.placeholder.com/1920x1080?text=Image+5",
    title: "Special Offer",
    description: "Buy 1 get 1 free on all sofas",
  },
];

const ProductCard = ({ image, title, description }: Product) => {
  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px]">
      <img
        src={image}
        alt={title || "Slide"}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 lg:top-12 lg:left-12 z-10">
        <button className="mb-2 px-2 py-1 text-xs sm:text-sm text-teal-600 bg-teal-100 rounded-full">
          Discount
        </button>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
          {title}
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mt-1 sm:mt-2">
          {description}
        </p>
      </div>
    </div>
  );
};

const SwiperContainer = () => {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      const swiper = swiperRef.current;
      if (
        swiper.params.navigation &&
        typeof swiper.params.navigation !== "boolean"
      ) {
        swiper.params.navigation.prevEl = prevRef.current;
        swiper.params.navigation.nextEl = nextRef.current;
        swiper.navigation.init();
        swiper.navigation.update();
      }
    }
  }, []);

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px]">
      <div className="absolute top-1/2 left-2 sm:left-4 md:left-6 lg:left-8 z-10 transform -translate-y-1/2">
        <button
          ref={prevRef}
          className="rounded-full bg-gray-600 p-2 sm:p-3 md:p-4"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white hover:text-black" />
        </button>
      </div>
      <div className="absolute top-1/2 right-2 sm:right-4 md:right-6 lg:right-8 z-10 transform -translate-y-1/2">
        <button
          ref={nextRef}
          className="rounded-full bg-gray-600 p-2 sm:p-3 md:p-4"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white hover:text-black" />
        </button>
      </div>
      <SwiperComponent
        modules={[Navigation, Pagination, Mousewheel]}
        spaceBetween={0}
        slidesPerView={1}
        mousewheel={true}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet bg-gray-400",
          bulletActiveClass: "swiper-pagination-bullet-active bg-white",
        }}
        className="w-full h-full"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {mockData.map((item, index) => (
          <SwiperSlide key={index}>
            <ProductCard {...item} />
          </SwiperSlide>
        ))}
      </SwiperComponent>
      {/* Tùy chỉnh pagination để responsive */}
      <style>{`
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          margin: 0 4px;
        }
        @media (min-width: 640px) {
          .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            margin: 0 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default SwiperContainer;
