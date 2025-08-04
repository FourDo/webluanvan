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
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import authApi from "../API/authApi";
import {
  getOrdersByUserId,
  getOrderDetail,
  requestCancelReturn,
  type DonHang,
} from "../API/orderApi";
import type {
  UpdateUserCredentials,
  ResetPasswordCredentials,
} from "../types/auth";

function TrangProfile() {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRefreshingUserInfo, setIsRefreshingUserInfo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // State cho đơn hàng thực tế
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // State cho xem chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [isLoadingOrderDetail, setIsLoadingOrderDetail] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  // State cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    mat_khau_cu: "",
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

  // State cho yêu cầu hủy/trả hàng
  const [showCancelReturnModal, setShowCancelReturnModal] = useState(false);
  const [selectedOrderForCancelReturn, setSelectedOrderForCancelReturn] =
    useState<number | null>(null);
  const [cancelReturnData, setCancelReturnData] = useState({
    yeu_cau_huy_tra: "Hủy",
    ly_do_huy_tra: "",
    dong_y_chinh_sach: false,
  });
  const [isSubmittingCancelReturn, setIsSubmittingCancelReturn] =
    useState(false);

  // Khởi tạo dữ liệu từ user context
  const [profileData, setProfileData] = useState({
    name: user?.ho_ten || "Chưa có thông tin",
    email: user?.email || "Chưa có thông tin",
    phone: user?.so_dien_thoai || "Chưa có thông tin",
    address: user?.dia_chi || "Chưa có thông tin",
    birthDate: "20/08/1985", // Giữ lại vì API chưa có trường này
    joinDate: user?.ngay_tao
      ? new Date(user.ngay_tao).toLocaleDateString("vi-VN")
      : "Chưa có thông tin",
    customerType:
      user?.vai_tro === "admin" ? "Quản trị viên" : "Khách hàng thân thiết",
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
        joinDate: user.ngay_tao
          ? new Date(user.ngay_tao).toLocaleDateString("vi-VN")
          : "Chưa có thông tin",
        customerType:
          user.vai_tro === "admin" ? "Quản trị viên" : "Khách hàng thân thiết",
      };
      setProfileData(newProfileData);
      setEditData(newProfileData);
    }
  }, [user]);

  // Hàm refresh thông tin người dùng từ server
  const refreshUserInfo = async () => {
    if (!user) return;

    setIsRefreshingUserInfo(true);
    setError(null);

    try {
      const response = await authApi.getUserInfo();

      // Cập nhật thông tin trong context với dữ liệu mới từ server
      const updatedUser = {
        ...user,
        ...response.data, // response.data chứa thông tin user mới nhất
      };
      login(updatedUser);

      setSuccess("Thông tin đã được cập nhật!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi tải thông tin người dùng");
    } finally {
      setIsRefreshingUserInfo(false);
    }
  };

  // Tự động refresh thông tin khi component mount
  useEffect(() => {
    if (user) {
      refreshUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  // Hàm load đơn hàng từ API
  const loadOrders = async () => {
    if (!user?.ma_nguoi_dung) return;

    setIsLoadingOrders(true);
    setOrdersError(null);

    try {
      const response = await getOrdersByUserId(user.ma_nguoi_dung);
      console.log("🔍 Response từ getOrdersByUserId:", response);

      // Xử lý trường hợp API trả về dữ liệu trống (404 được handle)
      if (response.don_hang) {
        console.log(
          "✅ Tìm thấy đơn hàng:",
          response.don_hang.length,
          "đơn hàng"
        );
        setOrders(response.don_hang);
      } else {
        console.log("⚠️ Không có trường don_hang trong response");
        setOrders([]);
      }

      // Nếu có message từ API (như "Khách hàng chưa có đơn hàng nào")
      if (response.message && response.don_hang?.length === 0) {
        console.log("ℹ️", response.message);
      }
    } catch (error: any) {
      setOrdersError(error.message || "Có lỗi xảy ra khi tải đơn hàng");
      console.error("Lỗi khi tải đơn hàng:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load đơn hàng khi user thay đổi
  useEffect(() => {
    if (user) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Hàm load chi tiết đơn hàng
  const loadOrderDetail = async (orderId: number) => {
    setIsLoadingOrderDetail(true);
    setSelectedOrder(orderId);

    try {
      const response = await getOrderDetail(orderId);
      setOrderDetail(response);
      setShowOrderDetailModal(true);
    } catch (error: any) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      setError("Không thể tải chi tiết đơn hàng");
    } finally {
      setIsLoadingOrderDetail(false);
    }
  };

  // Đóng modal chi tiết đơn hàng
  const closeOrderDetailModal = () => {
    setShowOrderDetailModal(false);
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  // Mở modal yêu cầu hủy/trả hàng
  const openCancelReturnModal = (orderId: number) => {
    const order = orders.find((o) => o.ma_don_hang === orderId);
    const defaultAction = order && canCancel(order) ? "Hủy" : "Trả";

    setSelectedOrderForCancelReturn(orderId);
    setCancelReturnData({
      yeu_cau_huy_tra: defaultAction,
      ly_do_huy_tra: "",
      dong_y_chinh_sach: false,
    });
    setShowCancelReturnModal(true);
  };

  // Đóng modal yêu cầu hủy/trả hàng
  const closeCancelReturnModal = () => {
    setShowCancelReturnModal(false);
    setSelectedOrderForCancelReturn(null);
    setCancelReturnData({
      yeu_cau_huy_tra: "Hủy",
      ly_do_huy_tra: "",
      dong_y_chinh_sach: false,
    });
  };

  // Xử lý gửi yêu cầu hủy/trả hàng
  const handleSubmitCancelReturn = async () => {
    if (!selectedOrderForCancelReturn) return;

    // Kiểm tra business rules
    const currentOrder = orders.find(
      (o) => o.ma_don_hang === selectedOrderForCancelReturn
    );
    if (!currentOrder) {
      setError("Không tìm thấy đơn hàng!");
      return;
    }

    if (
      cancelReturnData.yeu_cau_huy_tra === "Hủy" &&
      !canCancel(currentOrder)
    ) {
      setError(
        "Không thể hủy đơn hàng này (có thể đã được xử lý hoặc đang giao)!"
      );
      return;
    }

    if (
      cancelReturnData.yeu_cau_huy_tra === "Trả" &&
      !canReturn(currentOrder)
    ) {
      setError("Không thể trả hàng này (chỉ có thể trả hàng đã giao)!");
      return;
    }

    if (!cancelReturnData.ly_do_huy_tra.trim()) {
      setError("Vui lòng chọn lý do hủy/trả hàng");
      return;
    }

    if (!cancelReturnData.dong_y_chinh_sach) {
      setError("Vui lòng đồng ý với chính sách hủy/trả hàng");
      return;
    }

    setIsSubmittingCancelReturn(true);
    setError(null);

    try {
      await requestCancelReturn(selectedOrderForCancelReturn, cancelReturnData);
      setSuccess(
        `Yêu cầu ${cancelReturnData.yeu_cau_huy_tra.toLowerCase()} đã được gửi thành công!`
      );
      closeCancelReturnModal();

      // Reload đơn hàng để cập nhật trạng thái
      loadOrders();

      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi gửi yêu cầu");
    } finally {
      setIsSubmittingCancelReturn(false);
    }
  };

  // Kiểm tra đơn hàng có thể hủy không
  const canCancel = (order: DonHang) => {
    const status = order.trang_thai.toLowerCase();
    return (
      status === "chờ xử lý" ||
      status === "chờ xác nhận" ||
      status === "cho_xu_ly"
    );
  };

  // Kiểm tra đơn hàng có thể trả không
  const canReturn = (order: DonHang) => {
    const status = order.trang_thai.toLowerCase();
    return (
      status === "đã giao" || status === "hoàn thành" || status === "hoan_thanh"
    );
  };

  // Kiểm tra đơn hàng có thể hủy hoặc trả không
  const canCancelOrReturn = (order: DonHang) => {
    return canCancel(order) || canReturn(order);
  };

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

  // Hàm validation dữ liệu
  const validateProfileData = () => {
    const newErrors: { [key: string]: string } = {};

    // Kiểm tra họ tên
    if (!editData.name.trim()) {
      newErrors.name = "❌ Vui lòng nhập họ tên!";
    } else if (editData.name.trim().length < 2) {
      newErrors.name = "❌ Họ tên phải có ít nhất 2 ký tự!";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(editData.name.trim())) {
      newErrors.name = "❌ Họ tên chỉ được chứa chữ cái và khoảng trắng!";
    } else if (editData.name.trim().split(" ").length < 2) {
      newErrors.name = "❌ Vui lòng nhập đầy đủ họ và tên!";
    }

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editData.email.trim()) {
      newErrors.email = "❌ Vui lòng nhập email!";
    } else if (!emailRegex.test(editData.email.trim())) {
      newErrors.email =
        "❌ Email không đúng định dạng (ví dụ: name@gmail.com)!";
    }

    // Kiểm tra số điện thoại Việt Nam
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!editData.phone.trim()) {
      newErrors.phone = "❌ Vui lòng nhập số điện thoại!";
    } else if (!phoneRegex.test(editData.phone.trim().replace(/\s/g, ""))) {
      newErrors.phone =
        "❌ Số điện thoại không đúng định dạng (VD: 0901234567)!";
    }

    // Kiểm tra địa chỉ
    if (!editData.address.trim()) {
      newErrors.address = "❌ Vui lòng nhập địa chỉ!";
    } else if (editData.address.trim().length < 10) {
      newErrors.address = "❌ Địa chỉ phải có ít nhất 10 ký tự!";
    }

    // Kiểm tra ngày sinh
    if (editData.birthDate && editData.birthDate !== "20/08/1985") {
      const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = editData.birthDate.match(dateRegex);

      if (!match) {
        newErrors.birthDate = "❌ Ngày sinh phải theo định dạng dd/mm/yyyy!";
      } else {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);

        if (day < 1 || day > 31) {
          newErrors.birthDate = "❌ Ngày không hợp lệ (1-31)!";
        } else if (month < 1 || month > 12) {
          newErrors.birthDate = "❌ Tháng không hợp lệ (1-12)!";
        } else if (year < 1900 || year > new Date().getFullYear()) {
          newErrors.birthDate = "❌ Năm sinh không hợp lệ!";
        } else {
          // Kiểm tra ngày tháng có hợp lệ không
          const date = new Date(year, month - 1, day);
          if (
            date.getDate() !== day ||
            date.getMonth() !== month - 1 ||
            date.getFullYear() !== year
          ) {
            newErrors.birthDate = "❌ Ngày tháng không tồn tại!";
          } else if (date > new Date()) {
            newErrors.birthDate = "❌ Ngày sinh không thể trong tương lai!";
          }
        }
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }

    // Validate dữ liệu trước khi gửi
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
      setSuccess("✅ Cập nhật thông tin thành công!");

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
    setValidationErrors({});
  };

  // Helper function to check if there are any validation errors
  const hasValidationErrors = () => {
    return Object.values(validationErrors).some((error) => error !== "");
  };

  const handleInputChange = (field: keyof typeof editData, value: string) => {
    // Xử lý định dạng đặc biệt cho từng trường
    let formattedValue = value;

    switch (field) {
      case "name":
        // Chỉ cho phép chữ cái và khoảng trắng, loại bỏ số và ký tự đặc biệt
        formattedValue = value.replace(/[^a-zA-ZÀ-ỹ\s]/g, "");
        // Viết hoa chữ cái đầu mỗi từ
        formattedValue = formattedValue.replace(/\b\w/g, (l) =>
          l.toUpperCase()
        );
        break;

      case "phone":
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

      case "address":
        // Viết hoa chữ cái đầu
        formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;

      case "birthDate":
        // Định dạng ngày sinh dd/mm/yyyy
        formattedValue = value.replace(/[^\d\/]/g, "");
        // Thêm dấu / tự động
        if (formattedValue.length === 2 && !formattedValue.includes("/")) {
          formattedValue += "/";
        } else if (
          formattedValue.length === 5 &&
          formattedValue.split("/").length === 2
        ) {
          formattedValue += "/";
        }
        // Giới hạn độ dài
        if (formattedValue.length > 10) {
          formattedValue = formattedValue.slice(0, 10);
        }
        break;
    }

    setEditData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Xóa lỗi validation khi người dùng nhập
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Xử lý đổi mật khẩu
  const handlePasswordInputChange = (field: string, value: string) => {
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

  const validatePasswordForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordData.mat_khau_cu) {
      newErrors.mat_khau_cu = "Vui lòng nhập mật khẩu hiện tại";
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const resetPasswordCredentials: ResetPasswordCredentials = {
        mat_khau_cu: passwordData.mat_khau_cu,
        mat_khau_moi: passwordData.mat_khau_moi,
        mat_khau_moi_confirmation: passwordData.mat_khau_moi_confirmation,
      };

      const response = await authApi.resetpassword(resetPasswordCredentials);
      setSuccess(response.message || "Đổi mật khẩu thành công!");

      // Reset form
      setPasswordData({
        mat_khau_cu: "",
        mat_khau_moi: "",
        mat_khau_moi_confirmation: "",
      });

      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
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
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      {" "}
      {/* Thêm pt-20 để tránh navbar */}
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
            <div className="text-right flex items-end gap-4">
              <div>
                <p className="text-sm text-gray-500">Tham gia từ</p>
                <p className="font-semibold text-gray-800">
                  {profileData.joinDate}
                </p>
                <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full mt-1">
                  {profileData.customerType}
                </span>
              </div>
              <button
                onClick={refreshUserInfo}
                disabled={isRefreshingUserInfo}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Làm mới thông tin"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshingUserInfo ? "animate-spin" : ""}
                />
                {isRefreshingUserInfo ? "Đang tải..." : "Làm mới"}
              </button>
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
                  onClick={() => setActiveTab("password")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === "password"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Lock size={20} />
                  Đổi mật khẩu
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
                  <span className="font-semibold">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard size={16} />
                    Đã chi tiêu
                  </span>
                  <span className="font-semibold text-green-600">
                    {orders
                      .filter((order) => order.da_thanh_toan === 1)
                      .reduce(
                        (total, order) =>
                          total + parseFloat(order.tong_thanh_toan),
                        0
                      )
                      .toLocaleString("vi-VN")}{" "}
                    ₫
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <ShoppingBag size={16} />
                    Đã giao
                  </span>
                  <span className="font-semibold">
                    {
                      orders.filter((order) => order.trang_thai === "Đã giao")
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Heart size={16} />
                    Yêu thích
                  </span>
                  <span className="font-semibold">3</span>
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
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className={`text-2xl font-bold text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border-2 ${
                              validationErrors.name
                                ? "border-red-300 focus:border-red-500"
                                : "border-blue-200 focus:border-blue-500"
                            } outline-none transition-colors w-full max-w-md`}
                            placeholder="Nguyễn Văn A"
                          />
                          {validationErrors.name && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                              <span>⚠️</span>
                              {validationErrors.name}
                            </p>
                          )}
                        </div>
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
                          <div className="space-y-2">
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg outline-none transition-colors ${
                                validationErrors.email
                                  ? "border-red-300 focus:border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                              placeholder="example@gmail.com"
                            />
                            {validationErrors.email && (
                              <p className="text-red-600 text-sm flex items-center gap-1">
                                <span>⚠️</span>
                                {validationErrors.email}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              📧 Email để nhận thông báo và liên hệ
                            </p>
                          </div>
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
                          <div className="space-y-2">
                            <input
                              type="tel"
                              value={editData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg outline-none transition-colors ${
                                validationErrors.phone
                                  ? "border-red-300 focus:border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                              placeholder="0901234567"
                            />
                            {validationErrors.phone && (
                              <p className="text-red-600 text-sm flex items-center gap-1">
                                <span>⚠️</span>
                                {validationErrors.phone}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              📱 Số điện thoại Việt Nam (10-11 số)
                            </p>
                          </div>
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
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editData.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg outline-none transition-colors ${
                                validationErrors.address
                                  ? "border-red-300 focus:border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                              placeholder="Số 123, Đường ABC, Quận XYZ..."
                            />
                            {validationErrors.address && (
                              <p className="text-red-600 text-sm flex items-center gap-1">
                                <span>⚠️</span>
                                {validationErrors.address}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              🏠 Địa chỉ chi tiết để giao hàng
                            </p>
                          </div>
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
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editData.birthDate}
                              onChange={(e) =>
                                handleInputChange("birthDate", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg outline-none transition-colors ${
                                validationErrors.birthDate
                                  ? "border-red-300 focus:border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                              placeholder="dd/mm/yyyy"
                            />
                            {validationErrors.birthDate && (
                              <p className="text-red-600 text-sm flex items-center gap-1">
                                <span>⚠️</span>
                                {validationErrors.birthDate}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              🎂 Định dạng: ngày/tháng/năm (VD: 15/08/1990)
                            </p>
                          </div>
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
                        disabled={isLoading || hasValidationErrors()}
                        className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${
                          hasValidationErrors()
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
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
                      {hasValidationErrors() && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                          <span>⚠️</span>
                          Vui lòng sửa các lỗi trước khi lưu
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Đơn hàng của tôi
                  </h3>
                  <button
                    onClick={loadOrders}
                    disabled={isLoadingOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={isLoadingOrders ? "animate-spin" : ""}
                    />
                    {isLoadingOrders ? "Đang tải..." : "Làm mới"}
                  </button>
                </div>

                {ordersError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {ordersError}
                  </div>
                )}

                {isLoadingOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Đang tải đơn hàng...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.ma_don_hang}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package size={24} className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                Đơn hàng #{order.ma_don_hang}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.Ngay_Tao).toLocaleDateString(
                                  "vi-VN"
                                )}{" "}
                                • Người nhận: {order.ten_nguoi_nhan}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.hinh_thuc_thanh_toan}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">
                              {parseFloat(order.tong_thanh_toan).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              ₫
                            </p>
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.trang_thai)}`}
                            >
                              {order.trang_thai}
                            </span>
                            {order.da_thanh_toan === 1 && (
                              <p className="text-xs text-green-600 mt-1">
                                ✅ Đã thanh toán
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Thông tin vận chuyển */}
                        {order.don_vi_van_chuyen && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              Vận chuyển: {order.don_vi_van_chuyen}
                              {order.ma_van_don &&
                                ` - Mã vận đơn: ${order.ma_van_don}`}
                            </p>
                            {order.ngay_du_kien_giao && (
                              <p className="text-sm text-gray-600">
                                Dự kiến giao:{" "}
                                {new Date(
                                  order.ngay_du_kien_giao
                                ).toLocaleDateString("vi-VN")}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Nút xem chi tiết và yêu cầu hủy/trả */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button
                            onClick={() => loadOrderDetail(order.ma_don_hang)}
                            disabled={
                              isLoadingOrderDetail &&
                              selectedOrder === order.ma_don_hang
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                          >
                            {isLoadingOrderDetail &&
                            selectedOrder === order.ma_don_hang
                              ? "Đang tải..."
                              : "Xem chi tiết →"}
                          </button>

                          {/* Nút yêu cầu hủy/trả hàng */}
                          {canCancelOrReturn(order) && (
                            <button
                              onClick={() =>
                                openCancelReturnModal(order.ma_don_hang)
                              }
                              className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-300 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Yêu cầu hủy/trả
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Đổi mật khẩu
                </h3>
                <form onSubmit={handleChangePassword} className="max-w-md">
                  <div className="space-y-6">
                    {/* Mật khẩu hiện tại */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.old ? "text" : "password"}
                          value={passwordData.mat_khau_cu}
                          onChange={(e) =>
                            handlePasswordInputChange(
                              "mat_khau_cu",
                              e.target.value
                            )
                          }
                          className={`block w-full pl-10 pr-10 py-2 border ${
                            passwordErrors.mat_khau_cu
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility("old")}
                        >
                          {showPasswords.old ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.mat_khau_cu && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.mat_khau_cu}
                        </p>
                      )}
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.mat_khau_moi}
                          onChange={(e) =>
                            handlePasswordInputChange(
                              "mat_khau_moi",
                              e.target.value
                            )
                          }
                          className={`block w-full pl-10 pr-10 py-2 border ${
                            passwordErrors.mat_khau_moi
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
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
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.mat_khau_moi_confirmation}
                          onChange={(e) =>
                            handlePasswordInputChange(
                              "mat_khau_moi_confirmation",
                              e.target.value
                            )
                          }
                          className={`block w-full pl-10 pr-10 py-2 border ${
                            passwordErrors.mat_khau_moi_confirmation
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.mat_khau_moi_confirmation && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.mat_khau_moi_confirmation}
                        </p>
                      )}
                    </div>

                    {/* Submit button */}
                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang đổi mật khẩu...
                          </>
                        ) : (
                          "Đổi mật khẩu"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Modal Chi tiết đơn hàng */}
        {showOrderDetailModal && orderDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  Chi tiết đơn hàng #{orderDetail.don_hang.ma_don_hang}
                </h3>
                <button
                  onClick={closeOrderDetailModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Thông tin đơn hàng */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Thông tin đơn hàng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Mã đơn hàng:</span>{" "}
                        {orderDetail.don_hang.ma_don_hang}
                      </p>
                      <p>
                        <span className="font-medium">Ngày đặt:</span>{" "}
                        {new Date(
                          orderDetail.don_hang.Ngay_Tao
                        ).toLocaleDateString("vi-VN")}
                      </p>
                      <p>
                        <span className="font-medium">Trạng thái:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(orderDetail.don_hang.trang_thai)}`}
                        >
                          {orderDetail.don_hang.trang_thai}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Thanh toán:</span>{" "}
                        {orderDetail.don_hang.hinh_thuc_thanh_toan}
                      </p>
                      <p>
                        <span className="font-medium">
                          Trạng thái thanh toán:
                        </span>
                        {orderDetail.don_hang.da_thanh_toan === 1 ? (
                          <span className="text-green-600 ml-2">
                            ✅ Đã thanh toán
                          </span>
                        ) : (
                          <span className="text-red-600 ml-2">
                            ❌ Chưa thanh toán
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Thông tin giao hàng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Người nhận:</span>{" "}
                        {orderDetail.don_hang.ten_nguoi_nhan}
                      </p>
                      <p>
                        <span className="font-medium">Số điện thoại:</span>{" "}
                        {orderDetail.don_hang.so_dien_thoai}
                      </p>
                      <p>
                        <span className="font-medium">Địa chỉ:</span>{" "}
                        {orderDetail.don_hang.dia_chi_giao}
                      </p>
                      {orderDetail.don_hang.don_vi_van_chuyen && (
                        <p>
                          <span className="font-medium">
                            Đơn vị vận chuyển:
                          </span>{" "}
                          {orderDetail.don_hang.don_vi_van_chuyen}
                        </p>
                      )}
                      {orderDetail.don_hang.ma_van_don && (
                        <p>
                          <span className="font-medium">Mã vận đơn:</span>{" "}
                          {orderDetail.don_hang.ma_van_don}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chi tiết sản phẩm */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Sản phẩm đã đặt
                  </h4>
                  <div className="space-y-3">
                    {orderDetail.chi_tiet.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">
                              {item.ten_san_pham}
                            </h5>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>Màu sắc: {item.mau_sac}</span>
                              <span>Kích thước: {item.kich_thuoc}</span>
                              <span>Số lượng: {item.so_luong}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">
                              {item.gia_sau_km.toLocaleString("vi-VN")} ₫
                            </p>
                            {item.gia_goc !== item.gia_sau_km && (
                              <p className="text-sm text-gray-500 line-through">
                                {item.gia_goc.toLocaleString("vi-VN")} ₫
                              </p>
                            )}
                            {item.loai_khuyen_mai && (
                              <p className="text-xs text-red-600">
                                {item.loai_khuyen_mai}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tổng tiền */}
                <div className="border-t pt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tổng tiền hàng:</span>
                        <span>
                          {parseFloat(
                            orderDetail.don_hang.tong_tien
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí vận chuyển:</span>
                        <span>
                          {parseFloat(
                            orderDetail.don_hang.phi_van_chuyen
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Tổng thanh toán:</span>
                        <span className="text-red-600">
                          {parseFloat(
                            orderDetail.don_hang.tong_thanh_toan
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {orderDetail.don_hang.ghi_chu && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Ghi chú:
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {orderDetail.don_hang.ghi_chu}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Yêu cầu hủy/trả hàng */}
        {showCancelReturnModal && selectedOrderForCancelReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Yêu cầu hủy/trả hàng
                  </h3>
                  <button
                    onClick={closeCancelReturnModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại yêu cầu
                    </label>
                    <select
                      value={cancelReturnData.yeu_cau_huy_tra}
                      onChange={(e) =>
                        setCancelReturnData((prev) => ({
                          ...prev,
                          yeu_cau_huy_tra: e.target.value,
                          ly_do_huy_tra: "", // Reset lý do khi thay đổi loại
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {(() => {
                        const currentOrder = orders.find(
                          (o) => o.ma_don_hang === selectedOrderForCancelReturn
                        );
                        if (!currentOrder) return null;

                        const options = [];
                        if (canCancel(currentOrder)) {
                          options.push(
                            <option key="cancel" value="Hủy">
                              Hủy đơn hàng
                            </option>
                          );
                        }
                        if (canReturn(currentOrder)) {
                          options.push(
                            <option key="return" value="Trả">
                              Trả hàng
                            </option>
                          );
                        }
                        return options;
                      })()}
                    </select>
                    {(() => {
                      const currentOrder = orders.find(
                        (o) => o.ma_don_hang === selectedOrderForCancelReturn
                      );
                      if (!currentOrder) return null;

                      if (canCancel(currentOrder) && canReturn(currentOrder)) {
                        return (
                          <p className="text-xs text-gray-500 mt-1">
                            💡 Đơn hàng này có thể hủy hoặc trả hàng
                          </p>
                        );
                      } else if (canCancel(currentOrder)) {
                        return (
                          <p className="text-xs text-blue-600 mt-1">
                            ℹ️ Đơn hàng chỉ có thể hủy (chưa giao hàng)
                          </p>
                        );
                      } else if (canReturn(currentOrder)) {
                        return (
                          <p className="text-xs text-green-600 mt-1">
                            ℹ️ Đơn hàng chỉ có thể trả (đã giao hàng)
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do {cancelReturnData.yeu_cau_huy_tra.toLowerCase()}
                    </label>
                    <select
                      value={cancelReturnData.ly_do_huy_tra}
                      onChange={(e) =>
                        setCancelReturnData((prev) => ({
                          ...prev,
                          ly_do_huy_tra: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn lý do</option>
                      {cancelReturnData.yeu_cau_huy_tra === "Hủy" ? (
                        <>
                          <option value="Đặt Nhầm">Đặt nhầm</option>
                          <option value="Không Cần Nữa">Không cần nữa</option>
                          <option value="Tìm Được Giá Rẻ Hơn">
                            Tìm được giá rẻ hơn
                          </option>
                          <option value="Thay Đổi Ý Định">
                            Thay đổi ý định
                          </option>
                          <option value="Lý Do Khác">Lý do khác</option>
                        </>
                      ) : (
                        <>
                          <option value="Hàng Lỗi">Hàng lỗi</option>
                          <option value="Không Đúng Mô Tả">
                            Không đúng mô tả
                          </option>
                          <option value="Hàng Bị Hư Hỏng">
                            Hàng bị hư hỏng
                          </option>
                          <option value="Giao Sai Hàng">Giao sai hàng</option>
                          <option value="Không Ưng Ý">Không ưng ý</option>
                          <option value="Lý Do Khác">Lý do khác</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Chính sách hủy/trả hàng */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <span>📋</span>
                      Chính sách{" "}
                      {cancelReturnData.yeu_cau_huy_tra.toLowerCase()} hàng
                    </h4>

                    {cancelReturnData.yeu_cau_huy_tra === "Hủy" ? (
                      <div className="text-sm text-blue-700 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>
                            Miễn phí hủy đơn hàng trong vòng{" "}
                            <strong>24 giờ</strong> sau khi đặt
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>
                            Hoàn tiền 100% nếu đơn hàng chưa được xử lý
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">⚠</span>
                          <span>
                            Phí hủy 5% tổng đơn hàng nếu đã bắt đầu chuẩn bị
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>
                            Không thể hủy khi hàng đã giao cho đơn vị vận chuyển
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-blue-700 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>
                            Miễn phí đổi/trả trong vòng <strong>7 ngày</strong>{" "}
                            kể từ ngày nhận hàng
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Hoàn tiền 100% nếu lỗi do nhà bán hàng</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">⚠</span>
                          <span>
                            Sản phẩm phải còn nguyên vẹn, chưa sử dụng
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">⚠</span>
                          <span>
                            Khách hàng chịu phí vận chuyển khi trả hàng do đổi ý
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>
                            Không áp dụng cho sản phẩm giảm giá trên 50%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                      <strong>Lưu ý:</strong> Thời gian xử lý yêu cầu từ 1-3
                      ngày làm việc. Chúng tôi sẽ liên hệ với bạn để xác nhận
                      chi tiết.
                    </div>
                  </div>

                  {/* Checkbox xác nhận đồng ý */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree-policy"
                      checked={cancelReturnData.dong_y_chinh_sach || false}
                      onChange={(e) =>
                        setCancelReturnData((prev) => ({
                          ...prev,
                          dong_y_chinh_sach: e.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="agree-policy"
                      className="text-sm text-gray-700"
                    >
                      Tôi đã đọc và đồng ý với các điều khoản chính sách{" "}
                      {cancelReturnData.yeu_cau_huy_tra.toLowerCase()} hàng của
                      cửa hàng
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeCancelReturnModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitCancelReturn}
                    disabled={
                      isSubmittingCancelReturn ||
                      !cancelReturnData.ly_do_huy_tra ||
                      !cancelReturnData.dong_y_chinh_sach
                    }
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmittingCancelReturn ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrangProfile;
