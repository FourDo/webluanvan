import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import authApi from "../API/authApi";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { UpdateUserCredentials } from "../types/auth";

const AdminProfile: React.FC = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  // States cho cập nhật thông tin
  const [profileData, setProfileData] = useState({
    ho_ten: user?.ho_ten || "",
    email: user?.email || "",
    so_dien_thoai: user?.so_dien_thoai || "",
    dia_chi: user?.dia_chi || "",
  });

  const [editData, setEditData] = useState(profileData);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // States cho đổi mật khẩu với OTP
  const [passwordData, setPasswordData] = useState({
    mat_khau_cu: "",
    otp: "",
    mat_khau_moi: "",
    mat_khau_moi_confirmation: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Cập nhật dữ liệu khi user thay đổi
  useEffect(() => {
    if (user) {
      const newProfileData = {
        ho_ten: user.ho_ten || "",
        email: user.email || "",
        so_dien_thoai: user.so_dien_thoai || "",
        dia_chi: user.dia_chi || "",
      };
      setProfileData(newProfileData);
      setEditData(newProfileData);
    }
  }, [user]);

  // Countdown cho OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCountdown]);

  // Validation cho thông tin cá nhân
  const validateProfileData = () => {
    const newErrors: { [key: string]: string } = {};

    if (!editData.ho_ten.trim()) {
      newErrors.ho_ten = "Vui lòng nhập họ tên";
    } else if (editData.ho_ten.trim().length < 2) {
      newErrors.ho_ten = "Họ tên phải có ít nhất 2 ký tự";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!emailRegex.test(editData.email.trim())) {
      newErrors.email = "Email không đúng định dạng";
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!editData.so_dien_thoai.trim()) {
      newErrors.so_dien_thoai = "Vui lòng nhập số điện thoại";
    } else if (
      !phoneRegex.test(editData.so_dien_thoai.trim().replace(/\s/g, ""))
    ) {
      newErrors.so_dien_thoai = "Số điện thoại không đúng định dạng";
    }

    if (!editData.dia_chi.trim()) {
      newErrors.dia_chi = "Vui lòng nhập địa chỉ";
    } else if (editData.dia_chi.trim().length < 10) {
      newErrors.dia_chi = "Địa chỉ phải có ít nhất 10 ký tự";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation cho đổi mật khẩu
  const validatePasswordData = () => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordData.mat_khau_cu) {
      newErrors.mat_khau_cu = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwordData.otp) {
      newErrors.otp = "Vui lòng nhập mã OTP";
    } else if (passwordData.otp.length !== 6) {
      newErrors.otp = "Mã OTP phải có 6 số";
    }

    if (!passwordData.mat_khau_moi) {
      newErrors.mat_khau_moi = "Vui lòng nhập mật khẩu mới";
    } else if (passwordData.mat_khau_moi.length < 6) {
      newErrors.mat_khau_moi = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }

    if (!passwordData.mat_khau_moi_confirmation) {
      newErrors.mat_khau_moi_confirmation = "Vui lòng xác nhận mật khẩu mới";
    } else if (
      passwordData.mat_khau_moi !== passwordData.mat_khau_moi_confirmation
    ) {
      newErrors.mat_khau_moi_confirmation = "Mật khẩu xác nhận không khớp";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gửi OTP
  const handleSendOtp = async () => {
    if (!user?.email) {
      setError("Không tìm thấy email của admin");
      return;
    }

    setIsSendingOtp(true);
    setError(null);

    try {
      await authApi.forgotPasswordSendOtp(user.email);
      setSuccess("Mã OTP đã được gửi đến email của bạn!");
      setIsOtpSent(true);
      setOtpCountdown(60); // 60 giây countdown
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi gửi OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Cập nhật thông tin cá nhân
  const handleUpdateProfile = async () => {
    if (!user) {
      setError("Không tìm thấy thông tin admin");
      return;
    }

    if (!validateProfileData()) {
      setError("Vui lòng kiểm tra lại thông tin đã nhập!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UpdateUserCredentials = {
        email: editData.email,
        ho_ten: editData.ho_ten,
        so_dien_thoai: editData.so_dien_thoai,
        dia_chi: editData.dia_chi,
      };

      const response = await authApi.updateUser(updateData);

      // Cập nhật thông tin trong context
      const updatedUser = {
        ...user,
        ...response.user,
      };
      login(updatedUser);

      // Cập nhật state local
      setProfileData(editData);
      setIsEditing(false);
      setSuccess("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  // Đổi mật khẩu với OTP
  const handleChangePassword = async () => {
    if (!validatePasswordData()) {
      setError("Vui lòng kiểm tra lại thông tin đã nhập!");
      return;
    }

    if (!user?.email) {
      setError("Không tìm thấy email của admin");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Verify OTP trước
      await authApi.forgotPasswordVerifyOtp(user.email, passwordData.otp);

      // Reset password với OTP
      await authApi.forgotPasswordReset(
        user.email,
        passwordData.mat_khau_moi,
        passwordData.mat_khau_moi_confirmation
      );

      setSuccess("Đổi mật khẩu thành công!");

      // Reset form
      setPasswordData({
        mat_khau_cu: "",
        otp: "",
        mat_khau_moi: "",
        mat_khau_moi_confirmation: "",
      });
      setIsOtpSent(false);
      setOtpCountdown(0);

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof editData, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Xóa lỗi validation khi người dùng nhập
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePasswordInputChange = (
    field: keyof typeof passwordData,
    value: string
  ) => {
    // Xử lý định dạng OTP
    if (field === "otp") {
      value = value.replace(/[^\d]/g, "").slice(0, 6);
    }

    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Xóa lỗi khi người dùng nhập
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setValidationErrors({});
  };

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không thể truy cập trang profile admin
          </h2>
          <p className="text-gray-600">Vui lòng đăng nhập lại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Hồ sơ Admin
                </h1>
                <p className="text-gray-600">
                  Quản lý thông tin tài khoản quản trị viên
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar size={16} />
              <span>
                Tham gia:{" "}
                {user.ngay_tao
                  ? new Date(user.ngay_tao).toLocaleDateString("vi-VN")
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <CheckCircle size={16} className="mr-2" />
            {success}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "info"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <User size={16} className="inline mr-2" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "password"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Lock size={16} className="inline mr-2" />
                Đổi mật khẩu
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "info" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Thông tin cá nhân
                  </h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <X size={16} className="mr-2" />
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                        ) : (
                          <Save size={16} className="mr-2" />
                        )}
                        Lưu
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Họ tên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      Họ tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.ho_ten}
                        onChange={(e) =>
                          handleInputChange("ho_ten", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationErrors.ho_ten
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Nhập họ tên"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        {profileData.ho_ten || "Chưa có thông tin"}
                      </div>
                    )}
                    {validationErrors.ho_ten && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.ho_ten}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Nhập email"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        {profileData.email || "Chưa có thông tin"}
                      </div>
                    )}
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.so_dien_thoai}
                        onChange={(e) =>
                          handleInputChange("so_dien_thoai", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationErrors.so_dien_thoai
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        {profileData.so_dien_thoai || "Chưa có thông tin"}
                      </div>
                    )}
                    {validationErrors.so_dien_thoai && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.so_dien_thoai}
                      </p>
                    )}
                  </div>

                  {/* Địa chỉ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Địa chỉ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.dia_chi}
                        onChange={(e) =>
                          handleInputChange("dia_chi", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationErrors.dia_chi
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Nhập địa chỉ"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        {profileData.dia_chi || "Chưa có thông tin"}
                      </div>
                    )}
                    {validationErrors.dia_chi && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.dia_chi}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Đổi mật khẩu với xác thực OTP
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <Shield size={16} className="inline mr-2" />
                    Để đảm bảo bảo mật, chúng tôi sẽ gửi mã OTP đến email của
                    bạn để xác thực việc đổi mật khẩu.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Mật khẩu hiện tại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        value={passwordData.mat_khau_cu}
                        onChange={(e) =>
                          handlePasswordInputChange(
                            "mat_khau_cu",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                          passwordErrors.mat_khau_cu
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("old")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.old ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.mat_khau_cu && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.mat_khau_cu}
                      </p>
                    )}
                  </div>

                  {/* Gửi OTP */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Mã OTP
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || otpCountdown > 0}
                        className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOtp ? (
                          <>
                            <RefreshCw
                              size={12}
                              className="inline mr-1 animate-spin"
                            />
                            Đang gửi...
                          </>
                        ) : otpCountdown > 0 ? (
                          `Gửi lại sau ${otpCountdown}s`
                        ) : (
                          "Gửi OTP"
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={passwordData.otp}
                      onChange={(e) =>
                        handlePasswordInputChange("otp", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        passwordErrors.otp
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Nhập mã OTP 6 số"
                      maxLength={6}
                    />
                    {passwordErrors.otp && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.otp}
                      </p>
                    )}
                    {isOtpSent && (
                      <p className="mt-1 text-sm text-green-600">
                        Mã OTP đã được gửi đến email: {user.email}
                      </p>
                    )}
                  </div>

                  {/* Mật khẩu mới */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.mat_khau_moi}
                        onChange={(e) =>
                          handlePasswordInputChange(
                            "mat_khau_moi",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                          passwordErrors.mat_khau_moi
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.mat_khau_moi && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.mat_khau_moi}
                      </p>
                    )}
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.mat_khau_moi_confirmation}
                        onChange={(e) =>
                          handlePasswordInputChange(
                            "mat_khau_moi_confirmation",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                          passwordErrors.mat_khau_moi_confirmation
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.mat_khau_moi_confirmation && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.mat_khau_moi_confirmation}
                      </p>
                    )}
                  </div>

                  {/* Button đổi mật khẩu */}
                  <div className="pt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading || !isOtpSent}
                      className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Lock size={16} className="mr-2" />
                          Đổi mật khẩu
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
