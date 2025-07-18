import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin } from "lucide-react";
import authApi from "../API/authApi";

const TrangDangky: React.FC = () => {
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    mat_khau: "",
    confirmPassword: "",
    so_dien_thoai: "",
    dia_chi: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const navigate = useNavigate();

  // Helper function to check if there are any validation errors
  const hasValidationErrors = () => {
    return Object.values(validationErrors).some((error) => error !== "");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Xử lý định dạng đặc biệt cho từng trường
    let formattedValue = value;

    switch (name) {
      case "ho_ten":
        // Chỉ cho phép chữ cái và khoảng trắng, loại bỏ số và ký tự đặc biệt
        formattedValue = value.replace(/[^a-zA-ZÀ-ỹ\s]/g, "");
        // Viết hoa chữ cái đầu mỗi từ
        formattedValue = formattedValue.replace(/\b\w/g, (l) =>
          l.toUpperCase()
        );
        break;

      case "so_dien_thoai":
        // Chỉ cho phép số và loại bỏ khoảng trắng
        formattedValue = value.replace(/[^\d]/g, "");
        // Giới hạn 10-11 số
        if (formattedValue.length > 11) {
          formattedValue = formattedValue.slice(0, 11);
        }
        break;

      case "email":
        // Loại bỏ khoảng trắng và chuyển về chữ thường
        formattedValue = value.trim().toLowerCase();
        break;

      case "dia_chi":
        // Viết hoa chữ cái đầu
        formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
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

    // Kiểm tra họ tên
    if (!formData.ho_ten.trim()) {
      newErrors.ho_ten = "❌ Vui lòng nhập họ tên!";
    } else if (formData.ho_ten.trim().length < 2) {
      newErrors.ho_ten = "❌ Họ tên phải có ít nhất 2 ký tự!";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.ho_ten.trim())) {
      newErrors.ho_ten = "❌ Họ tên chỉ được chứa chữ cái và khoảng trắng!";
    } else if (formData.ho_ten.trim().split(" ").length < 2) {
      newErrors.ho_ten = "❌ Vui lòng nhập đầy đủ họ và tên!";
    }

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "❌ Vui lòng nhập email!";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email =
        "❌ Email không đúng định dạng (ví dụ: name@example.com)!";
    }

    // Kiểm tra số điện thoại Việt Nam
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.so_dien_thoai.trim()) {
      newErrors.so_dien_thoai = "❌ Vui lòng nhập số điện thoại!";
    } else if (
      !phoneRegex.test(formData.so_dien_thoai.trim().replace(/\s/g, ""))
    ) {
      newErrors.so_dien_thoai =
        "❌ Số điện thoại không đúng định dạng (VD: 0901234567)!";
    }

    // Kiểm tra địa chỉ
    if (!formData.dia_chi.trim()) {
      newErrors.dia_chi = "❌ Vui lòng nhập địa chỉ!";
    } else if (formData.dia_chi.trim().length < 10) {
      newErrors.dia_chi = "❌ Địa chỉ phải có ít nhất 10 ký tự!";
    }

    // Kiểm tra mật khẩu
    if (!formData.mat_khau) {
      newErrors.mat_khau = "❌ Vui lòng nhập mật khẩu!";
    } else if (formData.mat_khau.length < 6) {
      newErrors.mat_khau = "❌ Mật khẩu phải có ít nhất 6 ký tự!";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.mat_khau)) {
      newErrors.mat_khau =
        "❌ Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số!";
    }

    // Kiểm tra xác nhận mật khẩu
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "❌ Vui lòng xác nhận mật khẩu!";
    } else if (formData.mat_khau !== formData.confirmPassword) {
      newErrors.confirmPassword = "❌ Mật khẩu xác nhận không khớp!";
    }

    setValidationErrors(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authApi.register({
        ho_ten: formData.ho_ten,
        email: formData.email,
        mat_khau: formData.mat_khau,
        so_dien_thoai: formData.so_dien_thoai,
        dia_chi: formData.dia_chi,
      });

      navigate("/dangnhap", {
        state: { message: "Đăng ký thành công! Vui lòng đăng nhập." },
      });
    } catch (error: any) {
      setErrors({
        general: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
      });
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
          Tạo tài khoản mới
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{" "}
          <Link
            to="/dang-nhap"
            className="font-medium text-[#518581] hover:text-[#518581]/80 transition-colors duration-200"
          >
            đăng nhập nếu đã có tài khoản
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Họ tên */}
            <div>
              <label
                htmlFor="ho_ten"
                className="block text-sm font-medium text-gray-700"
              >
                Họ và tên
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="ho_ten"
                  name="ho_ten"
                  type="text"
                  value={formData.ho_ten}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.ho_ten
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-[#518581]"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] sm:text-sm transition-colors`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.ho_ten && (
                <div className="mt-1 flex items-start gap-1">
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.ho_ten}
                  </p>
                </div>
              )}
              {!errors.ho_ten && formData.ho_ten && (
                <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                  <span>✅</span>
                  Họ tên hợp lệ
                </p>
              )}
            </div>

            {/* Email */}
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

            {/* Số điện thoại */}
            <div>
              <label
                htmlFor="so_dien_thoai"
                className="block text-sm font-medium text-gray-700"
              >
                Số điện thoại
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="so_dien_thoai"
                  name="so_dien_thoai"
                  type="text"
                  value={formData.so_dien_thoai}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.so_dien_thoai
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-[#518581]"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] sm:text-sm transition-colors`}
                  placeholder="0901234567"
                  maxLength={11}
                />
              </div>
              {errors.so_dien_thoai && (
                <div className="mt-1 flex items-start gap-1">
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.so_dien_thoai}
                  </p>
                </div>
              )}
              {!errors.so_dien_thoai &&
                formData.so_dien_thoai &&
                /^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.so_dien_thoai) && (
                  <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                    <span>✅</span>
                    Số điện thoại hợp lệ
                  </p>
                )}
              {formData.so_dien_thoai &&
                formData.so_dien_thoai.length > 0 &&
                formData.so_dien_thoai.length < 10 && (
                  <p className="mt-1 text-blue-600 text-sm flex items-center gap-1">
                    <span>ℹ️</span>
                    Số điện thoại cần có 10-11 chữ số
                  </p>
                )}
            </div>

            {/* Địa chỉ */}
            <div>
              <label
                htmlFor="dia_chi"
                className="block text-sm font-medium text-gray-700"
              >
                Địa chỉ
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="dia_chi"
                  name="dia_chi"
                  type="text"
                  value={formData.dia_chi}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.dia_chi
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-[#518581]"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] sm:text-sm transition-colors`}
                  placeholder="123 Đường ABC, Phường XYZ, Quận DEF, TP HCM"
                />
              </div>
              {errors.dia_chi && (
                <div className="mt-1 flex items-start gap-1">
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.dia_chi}
                  </p>
                </div>
              )}
              {!errors.dia_chi &&
                formData.dia_chi &&
                formData.dia_chi.length >= 10 && (
                  <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                    <span>✅</span>
                    Địa chỉ hợp lệ
                  </p>
                )}
              {formData.dia_chi &&
                formData.dia_chi.length > 0 &&
                formData.dia_chi.length < 10 && (
                  <p className="mt-1 text-blue-600 text-sm flex items-center gap-1">
                    <span>ℹ️</span>
                    Địa chỉ cần có ít nhất 10 ký tự
                  </p>
                )}
            </div>

            {/* Mật khẩu */}
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
                  value={formData.mat_khau}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.mat_khau
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-[#518581]"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] sm:text-sm transition-colors`}
                  placeholder="Ít nhất 6 ký tự với chữ hoa, thường và số"
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
                formData.mat_khau.length >= 6 &&
                /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.mat_khau) && (
                  <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                    <span>✅</span>
                    Mật khẩu mạnh
                  </p>
                )}
              {formData.mat_khau &&
                (formData.mat_khau.length < 6 ||
                  !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
                    formData.mat_khau
                  )) && (
                  <div className="mt-1 space-y-1">
                    <p className="text-blue-600 text-sm">💡 Mật khẩu cần:</p>
                    <div className="text-xs space-y-1 ml-4">
                      <p
                        className={
                          formData.mat_khau.length >= 6
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {formData.mat_khau.length >= 6 ? "✅" : "⭕"} Ít nhất 6
                        ký tự
                      </p>
                      <p
                        className={
                          /(?=.*[a-z])/.test(formData.mat_khau)
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {/(?=.*[a-z])/.test(formData.mat_khau) ? "✅" : "⭕"} Ít
                        nhất 1 chữ thường
                      </p>
                      <p
                        className={
                          /(?=.*[A-Z])/.test(formData.mat_khau)
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {/(?=.*[A-Z])/.test(formData.mat_khau) ? "✅" : "⭕"} Ít
                        nhất 1 chữ hoa
                      </p>
                      <p
                        className={
                          /(?=.*\d)/.test(formData.mat_khau)
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {/(?=.*\d)/.test(formData.mat_khau) ? "✅" : "⭕"} Ít
                        nhất 1 chữ số
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Xác nhận mật khẩu
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-[#518581]"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] sm:text-sm transition-colors`}
                  placeholder="Nhập lại mật khẩu để xác nhận"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <div className="mt-1 flex items-start gap-1">
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.confirmPassword}
                  </p>
                </div>
              )}
              {!errors.confirmPassword &&
                formData.confirmPassword &&
                formData.mat_khau === formData.confirmPassword && (
                  <p className="mt-1 text-green-600 text-sm flex items-center gap-1">
                    <span>✅</span>
                    Mật khẩu khớp
                  </p>
                )}
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
                {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>
              {hasValidationErrors() && (
                <p className="mt-2 text-red-600 text-sm text-center flex items-center justify-center gap-1">
                  <span>⚠️</span>
                  Vui lòng sửa các lỗi trước khi tạo tài khoản
                </p>
              )}
            </div>
          </form>

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
                to="/dangnhap"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
              >
                Đăng nhập
              </Link>
              <Link
                to="/quen-mat-khau"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrangDangky;
