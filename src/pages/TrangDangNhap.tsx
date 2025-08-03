import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogOut } from "lucide-react";
import authApi from "../API/authApi";
import { useAuth } from "../context/AuthContext";

const TrangDangNhap: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    mat_khau: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  // Helper function to check if there are any validation errors
  const hasValidationErrors = () => {
    return Object.values(validationErrors).some((error) => error !== "");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Xử lý định dạng đặc biệt cho từng trường
    let formattedValue = value;

    switch (name) {
      case "email":
        // Loại bỏ khoảng trắng và chuyển về chữ thường
        formattedValue = value.trim().toLowerCase();
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Xóa lỗi validation khi người dùng nhập
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "❌ Vui lòng nhập email!";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email =
        "❌ Email không đúng định dạng (ví dụ: name@example.com)!";
    }

    // Kiểm tra mật khẩu
    if (!formData.mat_khau) {
      newErrors.mat_khau = "❌ Vui lòng nhập mật khẩu!";
    } else if (formData.mat_khau.length < 6) {
      newErrors.mat_khau = "❌ Mật khẩu phải có ít nhất 6 ký tự!";
    }

    setValidationErrors(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ general: "" });

    try {
      const response = await authApi.login({
        email: formData.email,
        mat_khau: formData.mat_khau,
      });

      console.log("🔐 Login API response:", response);
      console.log("- User data:", response.user);

      // Sử dụng AuthContext để login (không cần token)
      login(response.user);

      // Lưu thông tin người dùng vào localStorage (cho tương thích)
      localStorage.setItem("user", JSON.stringify(response.user));

      // Xử lý ghi nhớ đăng nhập
      if (rememberMe) {
        localStorage.setItem("client_rememberMe", "true");
        localStorage.setItem("client_rememberMeEmail", formData.email);
      } else {
        localStorage.removeItem("client_rememberMe");
        localStorage.removeItem("client_rememberMeEmail");
      }

      setSuccessMessage(response.success);
      setIsLoggedIn(true);
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("❌ Lỗi đăng nhập:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);

      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Email hoặc mật khẩu không chính xác";

      if (error.response?.status === 403) {
        // Tài khoản bị khóa - log để debug
        console.log("🔒 Tài khoản bị khóa - status 403");
        console.log("🔒 Error data:", error.response?.data);

        errorMessage =
          error.response?.data?.error ||
          "Tài khoản của bạn đã bị chặn, vui lòng liên hệ quản trị viên.";
        console.log("🔒 Final error message:", errorMessage);
      } else if (error.response?.data?.error) {
        // Lỗi khác từ server
        console.log("⚠️ Lỗi khác từ server:", error.response.data.error);
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        // Lỗi với message
        console.log("⚠️ Lỗi với message:", error.response.data.message);
        errorMessage = error.response.data.message;
      }

      console.log("📢 Thông báo lỗi cuối cùng:", errorMessage);

      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.logout();
      // Sử dụng AuthContext logout để xóa tất cả
      logout();
      localStorage.removeItem("user");
      setSuccessMessage(response.success);
      setIsLoggedIn(false);
      navigate("/", { replace: true });
    } catch (error) {
      setErrors({ general: "Đăng xuất thất bại. Vui lòng thử lại." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 3H8.5L10.62 9L14.5 3H22L15.5 13L20.5 21H14L10.5 15L6.5 21H2L8.5 13L2 3Z"
                fill="#AD7E5C"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isLoggedIn ? "Đã đăng nhập" : "Đăng nhập vào tài khoản"}
        </h2>
        {!isLoggedIn && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{" "}
            <Link
              to="/dang-ky"
              className="font-medium text-[#518581] hover:text-[#518581]/80 transition-colors duration-200"
            >
              tạo tài khoản mới
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {isLoggedIn ? (
            <div className="space-y-6">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                } transition-colors duration-200`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.email
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-[#518581]"
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] sm:text-sm transition-colors`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <div className="mt-1 flex items-start gap-1">
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <span>⚠️</span>
                      {errors.email}
                    </p>
                  </div>
                )}
                {!errors.email &&
                  formData.email &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                      <span>✅</span>
                      Email hợp lệ
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="mat_khau"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="mat_khau"
                    name="mat_khau"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.mat_khau}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.mat_khau
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-[#518581]"
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] sm:text-sm transition-colors`}
                    placeholder="Nhập mật khẩu của bạn"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.mat_khau && (
                  <div className="mt-1 flex items-start gap-1">
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <span>⚠️</span>
                      {errors.mat_khau}
                    </p>
                  </div>
                )}
                {!errors.mat_khau &&
                  formData.mat_khau &&
                  formData.mat_khau.length >= 6 && (
                    <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                      <span>✅</span>
                    </p>
                  )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#518581] focus:ring-[#518581] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/quenmatkhau"
                    className="font-medium text-[#518581] hover:text-[#518581]/80 transition-colors duration-200"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || hasValidationErrors()}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                    isLoading || hasValidationErrors()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#518581] hover:bg-[#518581]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#518581]"
                  }`}
                >
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
                {hasValidationErrors() && (
                  <p className="mt-2 text-red-600 text-sm text-center flex items-center justify-center gap-1">
                    <span>⚠️</span>
                    Vui lòng sửa các lỗi trước khi đăng nhập
                  </p>
                )}
              </div>
            </form>
          )}

          {!isLoggedIn && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  to="/dangky"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                >
                  Tạo tài khoản
                </Link>
                <Link
                  to="/quenmatkhau"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                >
                  Quên mật khẩu
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrangDangNhap;
