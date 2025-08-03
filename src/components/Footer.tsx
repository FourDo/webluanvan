import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 text-black border-t border-gray-200 py-10 ">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo + Description */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {/* Replace this with your logo image if needed */}
            <div className="w-6 h-6 bg-orange-500 rounded-sm" />
            <span className="text-lg font-semibold">Nội Thất VN</span>
          </div>
          <p className="text-sm text-gray-600">
            Nội Thất VN là đơn vị chuyên cung cấp nội thất chất lượng cao, mang
            đến trải nghiệm tốt nhất cho không gian sống của bạn.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Sản Phẩm</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="#">Hàng Mới Về</a>
            </li>
            <li>
              <a href="#">Bán Chạy Nhất</a>
            </li>
            <li>
              <a href="#">Đồ Trang Trí</a>
            </li>
            <li>
              <a href="#">Bộ Bếp</a>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Dịch Vụ</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="#">Danh Mục</a>
            </li>
            <li>
              <a href="#">Bài Viết</a>
            </li>
            <li>
              <a href="#">Câu Hỏi Thường Gặp</a>
            </li>
            <li>
              <a href="#">Bảng Giá</a>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Theo Dõi Chúng Tôi</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="#" className="flex items-center gap-2">
                <FaFacebookF /> Facebook
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2">
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2">
                <FaTwitter /> Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
