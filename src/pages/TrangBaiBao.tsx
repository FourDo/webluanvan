import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllBaiViet, getBaiVietById } from "../API/baibaoApi";
import type { BaiViet } from "../types/BaiViet";
import ArticleSwiper from "../components/ArticleSwiper";

function TrangBaiBao() {
  const { id } = useParams<{ id: string }>();
  const [baiviets, setBaiviets] = useState<BaiViet[]>([]);
  const [baivietDetail, setBaivietDetail] = useState<BaiViet | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (id) {
      // Nếu có ID thì load chi tiết bài viết
      getBaiVietById(Number(id))
        .then(setBaivietDetail)
        .finally(() => setLoading(false));
    } else {
      // Nếu không có ID thì load danh sách bài viết
      getAllBaiViet()
        .then(setBaiviets)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Đang tải...</div>
      </div>
    );
  }

  // Hiển thị chi tiết bài viết nếu có ID
  if (id && baivietDetail) {
    return (
      <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            to="/baibao"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Quay lại danh sách bài viết
          </Link>

          <article className="bg-white rounded-lg overflow-hidden shadow-lg">
            <img
              src={baivietDetail.anh_dai_dien}
              alt={baivietDetail.tieu_de}
              className="w-full h-96 object-cover"
            />

            <div className="p-8">
              <div className="mb-4">
                <span className="text-[#FFB23F] text-sm font-semibold">
                  {baivietDetail.danh_muc?.ten_danh_muc}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-[#151411] mb-4">
                {baivietDetail.tieu_de}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span>
                  Ngày đăng:{" "}
                  {new Date(baivietDetail.ngay_tao ?? "").toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
                <span>•</span>
                <span>Lượt xem: {baivietDetail.luot_xem}</span>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {baivietDetail.mo_ta_ngan}
                </p>
              </div>

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: baivietDetail.noi_dung }}
              />

              {baivietDetail.tags && baivietDetail.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <p className="text-sm text-gray-500 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {baivietDetail.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag.ten_tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    );
  }

  // Hiển thị danh sách bài viết (trang chính)
  const filteredBaiviets =
    selectedCategory === "All"
      ? baiviets
      : baiviets.filter((bv) => bv.danh_muc?.ten_danh_muc === selectedCategory);

  const categories = [
    "All",
    ...Array.from(
      new Set(baiviets.map((bv) => bv.danh_muc?.ten_danh_muc).filter(Boolean))
    ),
  ];

  return (
    <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col justify-center items-center mb-6 sm:mb-8 text-center">
          <h1 className="mt-8 sm:mt-10 mb-4 sm:mb-6 text-4xl sm:text-5xl font-bold">
            Bài Viết
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md sm:max-w-xl">
            Khám phá những bài viết mới nhất về trang trí nội thất, mẹo vặt và
            cảm hứng thiết kế.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-[1240px] h-[550px]">
          <ArticleSwiper />
        </div>
      </div>

      {/* Bài viết nổi bật */}
      {baiviets.length >= 2 && (
        <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10">
          <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-4">
            <p className="text-xs sm:text-sm text-[#FFB23F] font-semibold mb-2">
              Nổi bật
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#151411] leading-snug">
              Bài viết hàng đầu hôm nay
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {baiviets.slice(0, 2).map((baiviet) => (
                <Link
                  to={`/baibao/${baiviet.id}`}
                  key={baiviet.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={baiviet.anh_dai_dien}
                    alt={baiviet.tieu_de}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6">
                    <p className="text-gray-400 text-sm mb-1">
                      {baiviet.danh_muc?.ten_danh_muc}
                    </p>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {baiviet.tieu_de}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                      {baiviet.mo_ta_ngan}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-semibold text-black">
                        {new Date(baiviet.ngay_tao ?? "").toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                      <span>•</span>
                      <span>{baiviet.luot_xem} lượt xem</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Danh sách tất cả bài viết */}
      <div className="max-w-7xl mx-auto mt-16 sm:mt-20 md:mt-24 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
        <p className="text-xs sm:text-sm md:text-base text-[#FFB23F] font-semibold mb-2">
          Tất cả bài viết
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#151411] mb-4 sm:mb-6">
          Khám phá thêm
        </h2>

        {/* Tabs danh mục */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3 sm:gap-4">
          <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category || "All")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold transition-colors ${
                  selectedCategory === category
                    ? "bg-[#151411] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách bài viết */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {filteredBaiviets.map((baiviet) => (
            <Link
              to={`/baibao/${baiviet.id}`}
              key={baiviet.id}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-white hover:shadow-sm rounded-lg p-4 transition-all"
            >
              <img
                src={baiviet.anh_dai_dien}
                alt={baiviet.tieu_de}
                className="w-full sm:w-32 md:w-40 h-28 sm:h-24 md:h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">
                  {baiviet.danh_muc?.ten_danh_muc}
                </p>
                <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 line-clamp-2">
                  {baiviet.tieu_de}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2">
                  {baiviet.mo_ta_ngan}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400">
                  <span className="font-semibold text-black">
                    {new Date(baiviet.ngay_tao ?? "").toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                  <span>•</span>
                  <span>{baiviet.luot_xem} lượt xem</span>
                  {baiviet.tags && baiviet.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-1">
                        {baiviet.tags.slice(0, 2).map((tag) => (
                          <span key={tag.id} className="text-[#FFB23F]">
                            #{tag.ten_tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredBaiviets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Không có bài viết nào trong danh mục này.
            </p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto mt-16 px-4 sm:px-6 md:px-8 pb-16">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between text-center md:text-left">
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-0">
            Đăng ký nhận tin
            <br className="hidden md:block" /> từ chúng tôi?
          </h2>
          <button className="bg-[#518581] text-white font-semibold px-8 py-3 rounded-md flex items-center gap-2 text-base md:text-lg hover:bg-[#406b67] transition-all">
            Liên hệ ngay
            <span className="ml-2 text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrangBaiBao;
