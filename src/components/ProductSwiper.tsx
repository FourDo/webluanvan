import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Mousewheel, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Product } from "../types/Product";
import type { Event } from "../types/Event";

interface ProductSwiperProps {
  products: Product[];
  event?: Event | null;
  events?: Event[];
}

const ProductCard = ({ product }: { product: Product }) => {
  const mainVariant = product.bienthe?.[0];
  const image = mainVariant?.hinh_anh?.[0] || "/image/hetcuu3.png";
  const hasDiscount = product.ma_khuyen_mai !== null;
  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] flex items-center justify-center">
      <img
        src={image}
        alt={product.ten_san_pham}
        className={`w-full h-full object-cover rounded-lg ${hasDiscount ? "ring-4 ring-red-400" : ""}`}
      />
      {hasDiscount && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20 animate-bounce">
          KHUYẾN MÃI
        </div>
      )}
      <div className="absolute bottom-6 left-6 bg-black/60 rounded-lg p-4 z-10 min-w-[250px] max-w-[80%]">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 line-clamp-2">
          {product.ten_san_pham}
        </h2>
        <p className="text-sm text-gray-200 mb-2 line-clamp-2">
          {product.mo_ta_ngan}
        </p>
        <div className="text-lg font-bold text-yellow-300">
          {mainVariant
            ? Number(mainVariant.gia_ban).toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            : "Liên hệ"}
        </div>
      </div>
    </div>
  );
};

const ProductSwiper = ({ products, event, events }: ProductSwiperProps) => {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // Sử dụng events nếu có, nếu không thì dùng event đơn lẻ
  const eventsToShow =
    events && events.length > 0 ? events : event ? [event] : [];

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
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] max-w-7xl mx-auto px-4">
      {/* Navigation Buttons - Improved styling */}
      {(eventsToShow.length > 1 || products.length > 1) && (
        <>
          <div className="absolute top-1/2 left-2 sm:left-4 md:left-6 z-20 transform -translate-y-1/2">
            <button
              ref={prevRef}
              className="rounded-full bg-white/90 backdrop-blur-sm p-2 sm:p-3 md:p-4 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-gray-200"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
            </button>
          </div>
          <div className="absolute top-1/2 right-2 sm:right-4 md:right-6 z-20 transform -translate-y-1/2">
            <button
              ref={nextRef}
              className="rounded-full bg-white/90 backdrop-blur-sm p-2 sm:p-3 md:p-4 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-gray-200"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
            </button>
          </div>
        </>
      )}

      <SwiperComponent
        modules={[Navigation, Pagination, Mousewheel, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={eventsToShow.length > 1 || products.length > 1}
        mousewheel={true}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/60 !w-3 !h-3",
          bulletActiveClass:
            "swiper-pagination-bullet-active !bg-white !w-4 !h-4",
        }}
        className="w-full h-full rounded-xl overflow-hidden shadow-2xl"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {products.length > 0 ? (
          // Hiển thị sản phẩm nếu có
          products.map((product) => (
            <SwiperSlide key={product.ma_san_pham}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))
        ) : eventsToShow.length > 0 ? (
          // Hiển thị các events
          eventsToShow.map((eventItem) => (
            <SwiperSlide key={eventItem.su_kien_id}>
              <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
                <div className="absolute inset-0">
                  <img
                    src={eventItem.anh_banner || "/image/hetcuu3.png"}
                    alt={eventItem.tieu_de}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-8">
                  <div className="mb-4 inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                    🎉 SỰ KIỆN HOT
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                    {eventItem.tieu_de}
                  </h1>

                  <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
                    {eventItem.noi_dung}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-yellow-300 font-semibold text-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📅</span>
                      <span>
                        Từ:{" "}
                        {new Date(eventItem.ngay_bat_dau).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="hidden sm:block text-white">•</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⏰</span>
                      <span>
                        Đến:{" "}
                        {new Date(eventItem.ngay_ket_thuc).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full shadow-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300">
                      Khám Phá Ngay
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">📅</div>
                <h2 className="text-2xl font-bold mb-2">
                  Không có sự kiện nào
                </h2>
                <p>Hiện tại chưa có sự kiện nào đang diễn ra</p>
              </div>
            </div>
          </SwiperSlide>
        )}
      </SwiperComponent>

      {/* Custom Pagination Styles */}
      <style>{`
        .swiper-pagination {
          bottom: 20px !important;
        }
        .swiper-pagination-bullet {
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default ProductSwiper;
