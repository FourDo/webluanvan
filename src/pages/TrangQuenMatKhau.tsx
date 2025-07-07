import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import authApi from "../API/authApi";

const TrangQuenMatKhau: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    mat_khau_moi: "",
    xac_nhan_mat_khau: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.otp.trim()) {
      newErrors.otp = "Vui lòng nhập mã OTP";
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "Mã OTP phải có 6 chữ số";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.mat_khau_moi) {
      newErrors.mat_khau_moi = "Vui lòng nhập mật khẩu mới";
    } else if (formData.mat_khau_moi.length < 6) {
      newErrors.mat_khau_moi = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.xac_nhan_mat_khau) {
      newErrors.xac_nhan_mat_khau = "Vui lòng xác nhận mật khẩu";
    } else if (formData.mat_khau_moi !== formData.xac_nhan_mat_khau) {
      newErrors.xac_nhan_mat_khau = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.forgotPasswordSendOtp(formData.email);
      setSuccessMessage(response.message);
      setOtpSent(true);
      setCurrentStep(2);
    } catch (error: any) {
      setErrors({
        general: error.message || "Email không tồn tại trong hệ thống",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.forgotPasswordVerifyOtp(
        formData.email,
        formData.otp
      );
      setSuccessMessage(response.message);
      setCurrentStep(3);
    } catch (error: any) {
      setErrors({
        general: error.message || "Mã OTP không chính xác hoặc đã hết hạn",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.forgotPasswordReset(
        formData.email,
        formData.mat_khau_moi,
        formData.xac_nhan_mat_khau
      );
      setSuccessMessage(response.message);
      setTimeout(() => {
        navigate("/dangnhap", {
          state: {
            message: "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.",
          },
        });
      }, 2000);
    } catch (error: any) {
      setErrors({
        general: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.forgotPasswordSendOtp(formData.email);
      setSuccessMessage(response.message);
    } catch (error: any) {
      setErrors({
        general: error.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step <= currentStep
                ? "bg-[#518581] text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? "bg-[#518581]" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Bước 1: Nhập địa chỉ email
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Nhập email đã đăng ký để nhận mã xác thực
        </p>
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
              errors.email ? "border-red-300" : "border-gray-300"
            } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] focus:border-[#518581] sm:text-sm`}
            placeholder="Nhập địa chỉ email"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#518581] hover:bg-[#518581]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#518581]"
          } transition-colors duration-200`}
        >
          {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Bước 2: Nhập mã OTP
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Mã OTP đã được gửi đến{" "}
          <span className="font-medium">{formData.email}</span>
        </p>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700"
        >
          Mã OTP (6 chữ số)
        </label>
        <div className="mt-1">
          <input
            id="otp"
            name="otp"
            type="text"
            maxLength={6}
            value={formData.otp}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.otp ? "border-red-300" : "border-gray-300"
            } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] focus:border-[#518581] sm:text-sm text-center text-lg tracking-widest`}
            placeholder="000000"
          />
        </div>
        {errors.otp && (
          <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
        )}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={resendOTP}
            disabled={isLoading}
            className="text-sm text-[#518581] hover:text-[#518581]/80 font-medium"
          >
            Gửi lại mã OTP
          </button>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#518581] transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#518581] hover:bg-[#518581]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#518581]"
          } transition-colors duration-200`}
        >
          {isLoading ? "Đang xác thực..." : "Xác thực"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Bước 3: Đặt mật khẩu mới
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <div>
        <label
          htmlFor="mat_khau_moi"
          className="block text-sm font-medium text-gray-700"
        >
          Mật khẩu mới
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="mat_khau_moi"
            name="mat_khau_moi"
            type="password"
            value={formData.mat_khau_moi}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
              errors.mat_khau_moi ? "border-red-300" : "border-gray-300"
            } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] focus:border-[#518581] sm:text-sm`}
            placeholder="Nhập mật khẩu mới"
          />
        </div>
        {errors.mat_khau_moi && (
          <p className="mt-1 text-sm text-red-600">{errors.mat_khau_moi}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="xac_nhan_mat_khau"
          className="block text-sm font-medium text-gray-700"
        >
          Xác nhận mật khẩu mới
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="xac_nhan_mat_khau"
            name="xac_nhan_mat_khau"
            type="password"
            value={formData.xac_nhan_mat_khau}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
              errors.xac_nhan_mat_khau ? "border-red-300" : "border-gray-300"
            } rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#518581] focus:border-[#518581] sm:text-sm`}
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>
        {errors.xac_nhan_mat_khau && (
          <p className="mt-1 text-sm text-red-600">
            {errors.xac_nhan_mat_khau}
          </p>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#518581] transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#518581] hover:bg-[#518581]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#518581]"
          } transition-colors duration-200`}
        >
          {isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
          <CheckCircle className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );

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
          Quên mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          <Link
            to="/dang-nhap"
            className="font-medium text-[#518581] hover:text-[#518581]/80 transition-colors duration-200"
          >
            Quay lại đăng nhập
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderStepIndicator()}

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

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default TrangQuenMatKhau;
