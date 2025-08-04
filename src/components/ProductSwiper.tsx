import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
              <div
                className="relative w-full h-full overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/sukien/${eventItem.su_kien_id}`)}
              >
                {/* Background Image with Parallax Effect */}
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                  <img
                    src={eventItem.anh_banner || "/image/hetcuu3.png"}
                    alt={eventItem.tieu_de}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-12">
                  {/* Top Section - Event Badge */}
                  <div className="flex justify-between items-start">
                    <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-xl">
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <span className="text-lg animate-bounce">🔥</span>
                          <span>KHUYẾN MÃI HOT</span>
                          <span className="text-lg animate-pulse">✨</span>
                        </div>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    {eventItem.uu_tien === 3 && (
                      <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        ⭐ VIP
                      </div>
                    )}
                  </div>

                  {/* Bottom Section - Main Content */}
                  <div className="space-y-4">
                    {/* Event Type */}
                    {eventItem.loai_su_kien && (
                      <div className="inline-block">
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                          {eventItem.loai_su_kien
                            .replace("-", " ")
                            .toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-2xl font-black text-white leading-tight">
                      <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        {eventItem.tieu_de}
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="text-gray-200 text-lg md:text-xl max-w-3xl leading-relaxed">
                      {eventItem.noi_dung}
                    </p>

                    {/* Date Info with Modern Design */}
                    <div className="flex flex-wrap gap-4 text-yellow-300">
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-300/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                          Bắt đầu:{" "}
                          {new Date(eventItem.ngay_bat_dau).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-300/30">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                          Kết thúc:{" "}
                          {new Date(eventItem.ngay_ket_thuc).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <button
                        className="group/btn relative overflow-hidden bg-gradient-to-r  text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sukien/${eventItem.su_kien_id}`);
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <span>Khám Phá Ngay</span>
                          <svg
                            className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>

                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>

                        {/* Sparkle Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
                          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                          <div
                            className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-ping"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-ping"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Decorative Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
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
