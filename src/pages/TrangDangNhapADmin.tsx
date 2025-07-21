import React, { useState, useEffect } from "react";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authApi from "../API/authApi";
import { useAuth } from "../context/AuthContext"; // Import useAuth

function TrangDangNhapADmin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth(); // Lấy login và isAdmin từ AuthContext

  const images = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
  ];

  // Kiểm tra trạng thái admin khi component mount
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin", { replace: true });
    }

    const savedEmail = localStorage.getItem("admin_rememberMeEmail");
    const savedRememberMe = localStorage.getItem("admin_rememberMe");
    if (savedEmail && savedRememberMe === "true") {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [isAdmin, navigate]);

  // Tự động chuyển hình ảnh
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to check if there are any validation errors
  const hasValidationErrors = () => {
    return Object.values(validationErrors).some((error) => error !== "");
  };

  // Xử lý thay đổi input với validation
  const handleEmailChange = (value: string) => {
    // Loại bỏ khoảng trắng và chuyển về chữ thường
    const formattedValue = value.trim().toLowerCase();
    setEmail(formattedValue);

    // Xóa lỗi validation khi người dùng nhập
    if (validationErrors.email) {
      setValidationErrors((prev) => ({
        ...prev,
        email: "",
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    // Xóa lỗi validation khi người dùng nhập
    if (validationErrors.password) {
      setValidationErrors((prev) => ({
        ...prev,
        password: "",
      }));
    }
  };

  // Validation form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "❌ Vui lòng nhập email quản trị!";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email =
        "❌ Email không đúng định dạng (ví dụ: admin@example.com)!";
    }

    // Kiểm tra mật khẩu
    if (!password) {
      newErrors.password = "❌ Vui lòng nhập mật khẩu!";
    } else if (password.length < 6) {
      newErrors.password = "❌ Mật khẩu phải có ít nhất 6 ký tự!";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form trước khi submit
    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin đã nhập!");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({
        email,
        mat_khau: password,
      });

      if (response.user.vai_tro !== "admin") {
        throw new Error(
          "Tài khoản này không có quyền truy cập khu vực quản trị."
        );
      }

      // Gọi hàm login từ AuthContext để cập nhật trạng thái (không cần token)
      login(response.user);

      // Xử lý ghi nhớ đăng nhập
      if (rememberMe) {
        localStorage.setItem("admin_rememberMe", "true");
        localStorage.setItem("admin_rememberMeEmail", email);
      } else {
        localStorage.removeItem("admin_rememberMe");
        localStorage.removeItem("admin_rememberMeEmail");
      }

      // Chuyển hướng đến dashboard
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu."
      );
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span>
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
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                    validationErrors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              {validationErrors.email && (
                <div className="mt-1 flex items-start gap-1">
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {validationErrors.email}
                  </p>
                </div>
              )}
              {!validationErrors.email &&
                email &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                    <span>✅</span>
                    Email hợp lệ
                  </p>
                )}
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
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                    validationErrors.password
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Nhập mật khẩu quản trị"
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
              {validationErrors.password && (
                <div className="mt-1 flex items-start gap-1">
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {validationErrors.password}
                  </p>
                </div>
              )}
              {!validationErrors.password &&
                password &&
                password.length >= 6 && (
                  <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                    <span>✅</span>
                    
                  </p>
                )}
              {password && password.length > 0 && password.length < 6 && (
                <p className="mt-1 text-blue-600 text-sm flex items-center gap-1">
                  <span>ℹ️</span>
                  Mật khẩu cần có ít nhất 6 ký tự
                </p>
              )}
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
              disabled={loading || hasValidationErrors()}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                loading || hasValidationErrors()
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
            {hasValidationErrors() && (
              <p className="mt-2 text-red-600 text-sm text-center flex items-center justify-center gap-1">
                <span>⚠️</span>
                Vui lòng sửa các lỗi trước khi đăng nhập
              </p>
            )}
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
