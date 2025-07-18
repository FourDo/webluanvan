import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllBaiViet } from "../API/baibaoApi";
import type { BaiViet } from "../types/BaiViet";

const ArticleCard = ({ baiviet }: { baiviet: BaiViet }) => {
  return (
    <Link
      to={`/baibao/${baiviet.id}`}
      className="relative w-full h-full overflow-hidden block"
    >
      <img
        src={baiviet.anh_dai_dien}
        alt={baiviet.tieu_de}
        className="w-full h-full object-cover"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="max-w-4xl">
          {baiviet.danh_muc && (
            <span className="inline-block mb-3 px-3 py-1 text-sm bg-gray-600/80 text-white rounded-full backdrop-blur-sm">
              {baiviet.danh_muc.ten_danh_muc}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">
            {baiviet.tieu_de}
          </h2>
          <div className="flex items-center text-sm text-gray-200 space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-xs font-bold">A</span>
            </div>
            <span>Admin</span>
            <span>•</span>
            <span>
              {new Date(baiviet.ngay_tao ?? "").toLocaleDateString("vi-VN")}
            </span>
            <span>•</span>
            <span>{baiviet.luot_xem} lượt xem</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

function ArticleSwiper() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [baiviets, setBaiviets] = useState<BaiViet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBaiViet()
      .then((data) => {
        // Chỉ lấy 3 bài viết đầu tiên cho swiper
        setBaiviets(data.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % baiviets.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + baiviets.length) % baiviets.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="relative w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (baiviets.length === 0) {
    return (
      <div className="relative w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Không có bài viết nào</div>
      </div>
    );
  }

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
          {baiviets.map((baiviet, index) => (
            <div
              key={baiviet.id || index}
              className="w-full h-full flex-shrink-0"
            >
              <ArticleCard baiviet={baiviet} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {baiviets.map((_, index) => (
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
