import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Định nghĩa kiểu cho dữ liệu sản phẩm
interface Product {
  image: string;
  category: string;
  name: string;
  description: string;
  price: number;
}

// Dữ liệu giả lập
const mockData: Product[] = [
  {
    image: "/image/product1.png",
    category: "Kệ sách",
    name: "Kệ sách gỗ",
    description: "Sự kết hợp giữa gỗ và len",
    price: 63.47,
  },
  {
    image: "/image/product2.png",
    category: "Ghế",
    name: "Ghế thẩm mỹ trắng",
    description: "Sự kết hợp giữa gỗ và len",
    price: 45.99,
  },
  {
    image: "/image/product3.png",
    category: "Đèn",
    name: "Đèn thông minh Bardono",
    description: "Dễ sử dụng với kết nối Bluetooth",
    price: 78.23,
  },
  {
    image: "/image/product4.png",
    category: "Sofa",
    name: "Sofa Empuk Banget",
    description: "Sử dụng chất liệu kapuk randu",
    price: 78.23,
  },
  {
    image: "/image/product4.png",
    category: "Sofa",
    name: "Sofa Empuk Banget",
    description: "Sử dụng chất liệu kapuk randu",
    price: 78.23,
  },
];

// Giả định component ProductCard
const ProductCard = ({
  image,
  category,
  name,
  description,
  price,
}: Product) => {
  return (
    <div className="w-full max-w-[280px] mx-auto bg-white rounded-lg shadow-md p-4">
      <img
        src={image}
        alt={name}
        className="w-full h-40 sm:h-48 md:h-56 object-cover rounded"
      />
      <p className="text-xs sm:text-sm text-gray-400 mt-3">{category}</p>
      <h3 className="text-base sm:text-lg font-semibold text-[#151411] mt-1">
        {name}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">{description}</p>
      <p className="text-base sm:text-lg font-bold text-[#151411] mt-2">
        ${price.toFixed(2)}
      </p>
    </div>
  );
};

const SwiperContainer = () => {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // Cập nhật navigation sau khi DOM render
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
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Nút điều hướng */}
      <div className="hidden sm:block absolute top-1/2 -left-4 sm:-left-6 md:-left-8 z-10 transform -translate-y-1/2">
        <button ref={prevRef} className="rounded-full bg-gray-600 p-1 sm:p-2">
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white hover:text-black" />
        </button>
      </div>
      <div className="hidden sm:block absolute top-1/2 -right-4 sm:-right-6 md:-right-8 z-10 transform -translate-y-1/2">
        <button ref={nextRef} className="rounded-full bg-gray-600 p-1 sm:p-2">
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white hover:text-black" />
        </button>
      </div>

      {/* Swiper */}
      <SwiperComponent
        modules={[Navigation, Pagination, Mousewheel]}
        spaceBetween={10} // Default for small screens
        slidesPerView={1} // Default for small screens
        breakpoints={{
          640: {
            // sm
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            // md
            slidesPerView: 2, // Chỉ hiển thị 2 slide
            spaceBetween: 30, // Tăng khoảng cách để tránh sát nhau
          },
          1024: {
            // lg
            slidesPerView: 4,
            spaceBetween: 30,
          },
        }}
        mousewheel={true}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        pagination={{ clickable: true }}
        className="py-4"
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
    </div>
  );
};

export default SwiperContainer;
