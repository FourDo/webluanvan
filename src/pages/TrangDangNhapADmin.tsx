import React, { useState, useEffect } from "react";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../API/authApi"; // Giả sử authapi nằm cùng thư mục
import Cookies from "js-cookie";

function TrangDangNhapADmin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Danh sách hình ảnh cho slideshow
  const images = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
  ];

  // Tự động chuyển hình ảnh
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Kiểm tra trạng thái ghi nhớ đăng nhập khi component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberMeEmail");
    const savedRememberMe = localStorage.getItem("rememberMe");
    if (savedEmail && savedRememberMe === "true") {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email,
        mat_khau: password,
        role: "admin", // Chỉ định vai trò là admin
      });

      // Xử lý ghi nhớ đăng nhập
      if (rememberMe) {
        localStorage.setItem("admin_rememberMe", "true");
        localStorage.setItem("admin_rememberMeEmail", email);
      } else {
        localStorage.removeItem("admin_rememberMe");
        localStorage.removeItem("admin_rememberMeEmail");
      }

      navigate("/admin", { replace: true }); // Chuyển hướng đến /admin
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError(
          (err as { message?: string }).message ||
            "Đăng nhập thất bại. Vui lòng thử lại."
        );
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Phần bên trái - Hình ảnh slideshow */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10"></div>

        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-20 p-12">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl font-bold leading-tight">
              Chào mừng trở lại
            </h1>
            <p className="text-xl opacity-90 max-w-md">
              Quản lý hệ thống của bạn một cách hiệu quả và chuyên nghiệp
            </p>
            <div className="flex space-x-2 justify-center">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "bg-white scale-110"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phần bên phải - Form đăng nhập */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng nhập Admin
            </h2>
            <p className="text-gray-600">
              Nhập thông tin để truy cập hệ thống quản trị
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Admin Panel. Được bảo vệ bởi hệ thống bảo mật cao cấp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrangDangNhapADmin;
