import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGioHang } from "../context/GioHangContext";
import { createOrder } from "../API/orderApi";
import axios from "axios";

interface ThongTinKhachHang {
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  thanhPho: string;
  quanHuyen: string;
  phuongXa: string;
  ghiChu: string;
}

const TOKEN = "5596bafe-44e4-11f0-9b81-222185cb68c8"; // Nên lưu trong .env
const SHOP_ID = 196805; // Nên lưu trong .env
const YOUR_SHOP_DISTRICT_ID = 1442; // Thay bằng district_id của shop
const YOUR_SHOP_WARD_CODE = "20101"; // Thay bằng ward_code của shop

const ThanhToan: React.FC = () => {
  const navigate = useNavigate();
  const { items, xoaGioHang, tinhTongTien } = useGioHang();

  // State cho thông tin khách hàng
  const [thongTinKhachHang, setThongTinKhachHang] = useState<ThongTinKhachHang>(
    {
      hoTen: "",
      email: "",
      soDienThoai: "",
      diaChi: "",
      thanhPho: "",
      quanHuyen: "",
      phuongXa: "",
      ghiChu: localStorage.getItem("ghiChuDonHang") || "",
    }
  );

  // State cho dữ liệu từ GHN
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);

  // State cho thanh toán và phí vận chuyển
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [phiVanChuyen, setPhiVanChuyen] = useState<number>(0);

  // Hàm định dạng tiền
  const dinhDangTien = (gia: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(gia);
  };

  // API GHN: Lấy danh sách tỉnh/thành phố
  const getProvinces = async () => {
    try {
      const response = await axios.get(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
        { headers: { Token: TOKEN } }
      );
      return response.data.data || [];
    } catch (error) {
      setError("Không thể tải danh sách tỉnh/thành phố");
      console.error("Lỗi khi lấy danh sách tỉnh:", error);
      return [];
    }
  };

  // API GHN: Lấy danh sách quận/huyện
  const getDistricts = async (provinceId: number) => {
    try {
      const response = await axios.get(
        `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceId}`,
        { headers: { Token: TOKEN } }
      );
      return response.data.data || [];
    } catch (error) {
      setError("Không thể tải danh sách quận/huyện");
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
      return [];
    }
  };

  // API GHN: Lấy danh sách phường/xã
  const getWards = async (districtId: number) => {
    try {
      const response = await axios.get(
        `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
        { headers: { Token: TOKEN } }
      );
      return response.data.data || [];
    } catch (error) {
      setError("Không thể tải danh sách phường/xã");
      console.error("Lỗi khi lấy danh sách phường/xã:", error);
      return [];
    }
  };

  // API GHN: Tính phí vận chuyển
  const calculateShippingFee = async (
    toDistrictId: number,
    toWardCode: string
  ) => {
    try {
      // Tính tổng trọng lượng và kích thước từ giỏ hàng
      const totalWeight = items.reduce(
        (sum, item) => sum + (item.sanPham.weight || 1000) * item.soLuong,
        0
      );
      const maxLength = Math.max(
        ...items.map((item) => item.sanPham.length || 20)
      );
      const maxWidth = Math.max(
        ...items.map((item) => item.sanPham.width || 20)
      );
      const totalHeight = items.reduce(
        (sum, item) => sum + (item.sanPham.weight || 20) * item.soLuong,
        0
      );

      const payload = {
        shop_id: SHOP_ID,
        from_district_id: YOUR_SHOP_DISTRICT_ID,
        from_ward_code: YOUR_SHOP_WARD_CODE,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        weight: totalWeight,
        length: maxLength,
        width: maxWidth,
        height: totalHeight,
        service_type_id: 2, // Dịch vụ tiêu chuẩn
      };

      const response = await axios.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        payload,
        {
          headers: {
            Token: TOKEN,
            "Content-Type": "application/json",
            ShopId: SHOP_ID,
          },
        }
      );

      if (response.data.code === 200) {
        return response.data.data.total;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError("Không thể tính phí vận chuyển");
      console.error("Lỗi khi tính phí vận chuyển:", error);
      return 0;
    }
  };

  // Lấy danh sách tỉnh/thành phố khi component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setApiLoading(true);
      const provincesData = await getProvinces();
      setProvinces(provincesData);
      setApiLoading(false);
    };
    fetchProvinces();
  }, []);

  // Lấy danh sách quận/huyện khi chọn tỉnh/thành phố
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        setApiLoading(true);
        const districtsData = await getDistricts(selectedProvince.ProvinceID);
        setDistricts(districtsData);
        setSelectedDistrict(null);
        setWards([]);
        setSelectedWard(null);
        setPhiVanChuyen(0);
        setApiLoading(false);
      };
      fetchDistricts();
      setThongTinKhachHang((prev) => ({
        ...prev,
        thanhPho: selectedProvince.ProvinceName,
        quanHuyen: "",
        phuongXa: "",
      }));
    }
  }, [selectedProvince]);

  // Lấy danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        setApiLoading(true);
        const wardsData = await getWards(selectedDistrict.DistrictID);
        setWards(wardsData);
        setSelectedWard(null);
        setPhiVanChuyen(0);
        setApiLoading(false);
      };
      fetchWards();
      setThongTinKhachHang((prev) => ({
        ...prev,
        quanHuyen: selectedDistrict.DistrictName,
        phuongXa: "",
      }));
    }
  }, [selectedDistrict]);

  // Tính phí vận chuyển khi chọn phường/xã
  useEffect(() => {
    if (selectedWard && selectedDistrict) {
      const fetchShippingFee = async () => {
        setApiLoading(true);
        const fee = await calculateShippingFee(
          selectedDistrict.DistrictID,
          selectedWard.WardCode
        );
        setPhiVanChuyen(fee);
        setApiLoading(false);
        setThongTinKhachHang((prev) => ({
          ...prev,
          phuongXa: selectedWard.WardName,
        }));
      };
      fetchShippingFee();
    }
  }, [selectedWard]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setThongTinKhachHang((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const { hoTen, email, soDienThoai, diaChi } = thongTinKhachHang;

    if (!hoTen.trim()) {
      setError("Vui lòng nhập họ tên!");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Vui lòng nhập email hợp lệ!");
      return false;
    }
    if (!soDienThoai.trim()) {
      setError("Vui lòng nhập số điện thoại!");
      return false;
    }
    if (!diaChi.trim()) {
      setError("Vui lòng nhập địa chỉ!");
      return false;
    }
    if (!selectedProvince) {
      setError("Vui lòng chọn tỉnh/thành phố!");
      return false;
    }
    if (!selectedDistrict) {
      setError("Vui lòng chọn quận/huyện!");
      return false;
    }
    if (!selectedWard) {
      setError("Vui lòng chọn phường/xã!");
      return false;
    }
    if (!phuongThucThanhToan) {
      setError("Vui lòng chọn phương thức thanh toán!");
      return false;
    }
    return true;
  };

  const handleXacNhanDatHang = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Chuẩn bị dữ liệu đơn hàng
      const donHangPayload = {
        ma_nguoi_dung: 1, // TODO: Lấy từ context đăng nhập
        ten_nguoi_nhan: thongTinKhachHang.hoTen,
        so_dien_thoai: thongTinKhachHang.soDienThoai,
        dia_chi_giao: `${thongTinKhachHang.diaChi}, ${thongTinKhachHang.phuongXa}, ${thongTinKhachHang.quanHuyen}, ${thongTinKhachHang.thanhPho}`,
        hinh_thuc_thanh_toan: phuongThucThanhToan,
        tong_tien: tinhTongTien(),
        phi_van_chuyen: phiVanChuyen,
        tong_thanh_toan: tinhTongTien() + phiVanChuyen,
        ghi_chu: thongTinKhachHang.ghiChu,
        chi_tiet: items.map((item) => ({
          ma_bien_the: item.sanPham.id,
          ten_san_pham: item.sanPham.ten,
          mau_sac: item.sanPham.mauSac || "",
          kich_thuoc: item.sanPham.kichThuoc || "",
          so_luong: item.soLuong,
          gia_goc: item.sanPham.gia,
          loai_khuyen_mai: "",
          gia_khuyen_mai: 0,
          gia_sau_km: item.sanPham.gia,
        })),
      };

      const orderResult = await createOrder(donHangPayload);
      if (orderResult && orderResult.payment_url) {
        window.location.href = orderResult.payment_url;
        return;
      } else {
        xoaGioHang();
        navigate("/hoa-don", { state: { order: orderResult } });
        return;
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setError(
          "Dữ liệu gửi lên không hợp lệ: " + JSON.stringify(error.response.data)
        );
        console.error("Lỗi 422 khi gửi đơn hàng:", error.response.data);
      } else {
        setError("Đã có lỗi xảy ra khi xử lý thanh toán");
        console.error("Lỗi thanh toán:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const phuongThucThanhToanOptions = [
    {
      value: "cod",
      label: "COD (Thanh toán khi nhận hàng)",
      icon: "💵",
      desc: "Thanh toán bằng tiền mặt khi nhận hàng",
    },
    {
      value: "zalopay",
      label: "zalopay",
      icon: "🏦",
      desc: "Thanh toán qua ví điện tử zaloPay",
    },
    {
      value: "momo",
      label: "Momo",
      icon: "🟣",
      desc: "Thanh toán qua ví điện tử MoMo",
    },
  ];

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate("/")}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <nav className="text-sm breadcrumbs mb-6">
        <div className="flex items-center space-x-2 text-gray-600">
          <button onClick={() => navigate("/")} className="hover:text-blue-600">
            Trang chủ
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/gio-hang")}
            className="hover:text-blue-600"
          >
            Giỏ hàng
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </div>
      </nav>

      <h1 className="text-3xl font-bold mb-8">Thanh toán đơn hàng</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">Thông tin giao hàng</h2>

            {apiLoading && (
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span>Đang tải dữ liệu...</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="hoTen"
                  value={thongTinKhachHang.hoTen}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={thongTinKhachHang.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="soDienThoai"
                  value={thongTinKhachHang.soDienThoai}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố *
                </label>
                <select
                  value={selectedProvince ? selectedProvince.ProvinceID : ""}
                  onChange={(e) => {
                    const province = provinces.find(
                      (p) => p.ProvinceID === parseInt(e.target.value)
                    );
                    setSelectedProvince(province);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={apiLoading}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option
                      key={province.ProvinceID}
                      value={province.ProvinceID}
                    >
                      {province.ProvinceName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện *
                </label>
                <select
                  value={selectedDistrict ? selectedDistrict.DistrictID : ""}
                  onChange={(e) => {
                    const district = districts.find(
                      (d) => d.DistrictID === parseInt(e.target.value)
                    );
                    setSelectedDistrict(district);
                  }}
                  disabled={!selectedProvince || apiLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option
                      key={district.DistrictID}
                      value={district.DistrictID}
                    >
                      {district.DistrictName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phường/Xã *
                </label>
                <select
                  value={selectedWard ? selectedWard.WardCode : ""}
                  onChange={(e) => {
                    const ward = wards.find(
                      (w) => w.WardCode === e.target.value
                    );
                    setSelectedWard(ward);
                  }}
                  disabled={!selectedDistrict || apiLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward) => (
                    <option key={ward.WardCode} value={ward.WardCode}>
                      {ward.WardName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ cụ thể *
                </label>
                <input
                  type="text"
                  name="diaChi"
                  value={thongTinKhachHang.diaChi}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  name="ghiChu"
                  value={thongTinKhachHang.ghiChu}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">
              Phương thức thanh toán
            </h2>
            <div className="space-y-3">
              {phuongThucThanhToanOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    phuongThucThanhToan === option.value
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="phuongThucThanhToan"
                    value={option.value}
                    checked={phuongThucThanhToan === option.value}
                    onChange={(e) => setPhuongThucThanhToan(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-xl mr-3">{option.icon}</span>
                      <span className="font-medium text-gray-900">
                        {option.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6">Đơn hàng của bạn</h2>
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.sanPham.id}
                  className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                >
                  <img
                    src={item.sanPham.hinhAnh}
                    alt={item.sanPham.ten}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.src =
                        "/api/placeholder/48/48?text=" +
                        encodeURIComponent(item.sanPham.ten);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.sanPham.ten}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.soLuong} x {dinhDangTien(item.sanPham.gia)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {dinhDangTien(item.sanPham.gia * item.soLuong)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">
                  {dinhDangTien(tinhTongTien())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-medium">
                  {phiVanChuyen > 0 ? dinhDangTien(phiVanChuyen) : "Chưa tính"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-3">
                <span>Tổng cộng</span>
                <span className="text-blue-600">
                  {dinhDangTien(tinhTongTien() + phiVanChuyen)}
                </span>
              </div>
              {phiVanChuyen === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  💡 Chọn đầy đủ địa chỉ để tính phí vận chuyển chính xác
                </p>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              className={`w-full font-bold py-3 px-4 rounded-lg mt-6 transition-all duration-200 ${
                phuongThucThanhToan && !loading && !apiLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleXacNhanDatHang}
              disabled={!phuongThucThanhToan || loading || apiLoading}
            >
              {loading || apiLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : phuongThucThanhToan ? (
                `Thanh toán ${dinhDangTien(tinhTongTien() + phiVanChuyen)}`
              ) : (
                "Chọn phương thức thanh toán"
              )}
            </button>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>🔒 Thông tin thanh toán được bảo mật an toàn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThanhToan;
