import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Save,
  X,
  ShoppingBag,
  Heart,
  CreditCard,
  Package,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import authApi from "../API/authApi";
import type { UpdateUserCredentials } from "../types/auth";

function TrangProfile() {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Khởi tạo dữ liệu từ user context
  const [profileData, setProfileData] = useState({
    name: user?.ho_ten || "Chưa có thông tin",
    email: user?.email || "Chưa có thông tin",
    phone: user?.so_dien_thoai || "Chưa có thông tin",
    address: user?.dia_chi || "Chưa có thông tin",
    birthDate: "20/08/1985", // Giữ lại vì API chưa có trường này
    joinDate: user?.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : "Chưa có thông tin",
    customerType: user?.vai_tro === "admin" ? "Quản trị viên" : "Khách hàng thân thiết",
  });

  const [editData, setEditData] = useState(profileData);

  // Cập nhật dữ liệu khi user thay đổi
  useEffect(() => {
    if (user) {
      const newProfileData = {
        name: user.ho_ten || "Chưa có thông tin",
        email: user.email || "Chưa có thông tin",
        phone: user.so_dien_thoai || "Chưa có thông tin",
        address: user.dia_chi || "Chưa có thông tin",
        birthDate: "20/08/1985", // Giữ lại vì API chưa có trường này
        joinDate: user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : "Chưa có thông tin",
        customerType: user.vai_tro === "admin" ? "Quản trị viên" : "Khách hàng thân thiết",
      };
      setProfileData(newProfileData);
      setEditData(newProfileData);
    }
  }, [user]);

  // Dữ liệu mẫu cho đơn hàng
  const orders = [
    {
      id: "DH001",
      date: "15/06/2025",
      total: "12,500,000",
      status: "Đã giao",
      items: 3,
    },
    {
      id: "DH002",
      date: "08/06/2025",
      total: "8,750,000",
      status: "Đang giao",
      items: 2,
    },
    {
      id: "DH003",
      date: "02/06/2025",
      total: "25,000,000",
      status: "Đã giao",
      items: 5,
    },
  ];

  const wishlist = [
    { name: "Sofa da cao cấp Milano", price: "25,000,000", image: "🛋️" },
    { name: "Bàn ăn gỗ sồi 6 chỗ", price: "15,500,000", image: "🪑" },
    { name: "Tủ kệ TV hiện đại", price: "8,200,000", image: "📺" },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!user) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UpdateUserCredentials = {
        email: editData.email,
        ho_ten: editData.name,
        so_dien_thoai: editData.phone,
        dia_chi: editData.address,
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
      
      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
        return "bg-green-100 text-green-800";
      case "Đang giao":
        return "bg-blue-100 text-blue-800";
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Vui lòng đăng nhập để xem thông tin cá nhân
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Tài khoản của tôi
              </h1>
              <p className="text-gray-600">
                Quản lý thông tin và đơn hàng của bạn
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tham gia từ</p>
              <p className="font-semibold text-gray-800">
                {profileData.joinDate}
              </p>
              <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full mt-1">
                {profileData.customerType}
              </span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <User size={20} />
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === "orders"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <ShoppingBag size={20} />
                  Đơn hàng của tôi
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === "wishlist"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Heart size={20} />
                  Sản phẩm yêu thích
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Package size={16} />
                    Tổng đơn hàng
                  </span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard size={16} />
                    Đã chi tiêu
                  </span>
                  <span className="font-semibold text-green-600">125M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Heart size={16} />
                    Yêu thích
                  </span>
                  <span className="font-semibold">8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 rounded-t-lg relative">
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm text-black px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-300 flex items-center gap-2"
                    >
                      <Edit3 size={18} />
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                <div className="p-6 -mt-16 relative">
                  {/* Avatar */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                        <User size={40} className="text-white" />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                        <Camera size={12} />
                      </button>
                    </div>
                    <div className="flex-1 pt-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="text-2xl font-bold text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border-2 border-blue-200 focus:border-blue-500 outline-none transition-colors w-full max-w-md"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-800">
                          {profileData.name}
                        </h2>
                      )}
                      <p className="text-gray-600 mt-1">
                        {profileData.customerType}
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <Mail size={16} />
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {profileData.email}
                          </p>
                        )}
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <Phone size={16} />
                          Số điện thoại
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {profileData.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <MapPin size={16} />
                          Địa chỉ
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {profileData.address}
                          </p>
                        )}
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <Calendar size={16} />
                          Ngày sinh
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.birthDate}
                            onChange={(e) =>
                              handleInputChange("birthDate", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {profileData.birthDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <X size={16} />
                        Hủy bỏ
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Đơn hàng của tôi
                </h3>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              Đơn hàng #{order.id}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {order.date} • {order.items} sản phẩm
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            {order.total} ₫
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Sản phẩm yêu thích
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="text-center mb-3">
                        <div className="text-4xl mb-2">{item.image}</div>
                        <h4 className="font-medium text-gray-800 text-sm">
                          {item.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-600">
                          {item.price} ₫
                        </span>
                        <button className="text-red-500 hover:text-red-700">
                          <Heart size={16} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrangProfile;
