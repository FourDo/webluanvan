import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBaiVietById } from "../API/baibaoApi";
import type { BaiViet } from "../types/BaiViet";

const BaiBaoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [baiviet, setBaiviet] = useState<BaiViet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getBaiVietById(Number(id))
        .then(setBaiviet)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!baiviet) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Không tìm thấy bài viết
          </h2>
          <Link to="/baibao" className="text-blue-600 hover:underline">
            ← Quay lại danh sách bài báo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          to="/baibao"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Quay lại danh sách bài báo
        </Link>

        <article className="bg-white rounded-lg overflow-hidden shadow-lg">
          <img
            src={baiviet.anh_dai_dien}
            alt={baiviet.tieu_de}
            className="w-full h-96 object-cover"
          />

          <div className="p-8">
            <div className="mb-4">
              <span className="text-[#FFB23F] text-sm font-semibold">
                {baiviet.danh_muc?.ten_danh_muc}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#151411] mb-4">
              {baiviet.tieu_de}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span>
                Ngày đăng:{" "}
                {new Date(baiviet.ngay_tao ?? "").toLocaleDateString("vi-VN")}
              </span>
              <span>•</span>
              <span>Lượt xem: {baiviet.luot_xem}</span>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                {baiviet.mo_ta_ngan}
              </p>
            </div>

            <div
              className="prose prose-lg max-w-none prose-headings:text-[#151411] prose-a:text-blue-600 prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: baiviet.noi_dung }}
            />

            {baiviet.tags && baiviet.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {baiviet.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
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
};

export default BaiBaoDetail;
