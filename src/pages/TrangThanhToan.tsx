import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGioHang } from "../context/GioHangContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../API/orderApi";
import {
  createGHNShippingOrder,
  parseAddress,
  calculateOrderDimensions,
  type GHNCreateOrderPayload,
} from "../API/ghnShippingApi";
import Cookies from "js-cookie";
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

const TOKEN = "5596bafe-44e4-11f0-9b81-222185cb68c8";
const SHOP_ID = 196805;
const YOUR_SHOP_DISTRICT_ID = 1442;
const YOUR_SHOP_WARD_CODE = "20101";

const ThanhToan: React.FC = () => {
  const navigate = useNavigate();
  const { items, xoaGioHang, tinhTongTien } = useGioHang();
  const { user } = useAuth();

  // CSS tùy chỉnh cho component
  const customStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `;

  // Thêm styles vào head
  React.useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
  const [addressWarning, setAddressWarning] = useState<string | null>(null);

  // State cho validation errors của từng trường
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

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
      return 0;
    }
  };

  // Tự động điền thông tin nếu người dùng đã đăng nhập
  useEffect(() => {
    if (user) {
      setThongTinKhachHang((prev) => ({
        ...prev,
        hoTen: user.ho_ten || "",
        email: user.email || "",
        soDienThoai: user.so_dien_thoai || "",
        diaChi: user.dia_chi || "",
      }));
    }
  }, [user]);

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

    // Xử lý định dạng đặc biệt cho từng trường
    let formattedValue = value;

    switch (name) {
      case "hoTen":
        // Chỉ cho phép chữ cái và khoảng trắng, loại bỏ số và ký tự đặc biệt
        formattedValue = value.replace(/[^a-zA-ZÀ-ỹ\s]/g, "");
        // Viết hoa chữ cái đầu mỗi từ
        formattedValue = formattedValue.replace(/\b\w/g, (l) =>
          l.toUpperCase()
        );
        break;

      case "soDienThoai":
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

      case "diaChi":
        // Viết hoa chữ cái đầu
        formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;
    }

    setThongTinKhachHang((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Xóa lỗi khi người dùng bắt đầu nhập vào trường
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Xóa lỗi chung khi người dùng bắt đầu nhập
    if (error) {
      setError(null);
    }
  };

  const checkAddressConsistency = (
    address: string,
    province: any
  ): string | null => {
    if (!address || !province) return null;
    const addressLower = address.toLowerCase();
    const provinceName = province.ProvinceName.toLowerCase();

    const cityKeywords: { [key: string]: string[] } = {
      "hồ chí minh": [
        "hcm",
        "ho chi minh",
        "sài gòn",
        "saigon",
        "tphcm",
        "tp hcm",
      ],
      "hà nội": ["hanoi", "ha noi", "hn"],
      "đà nẵng": ["da nang", "danang"],
      "cần thơ": ["can tho", "cantho"],
      "hải phòng": ["hai phong", "haiphong"],
    };

    for (const [cityName, keywords] of Object.entries(cityKeywords)) {
      if (!provinceName.includes(cityName)) {
        for (const keyword of keywords) {
          if (addressLower.includes(keyword)) {
            return `Địa chỉ có vẻ thuộc ${cityName.toUpperCase()} nhưng bạn đã chọn ${province.ProvinceName}`;
          }
        }
      }
    }
    return null;
  };

  // Effect để kiểm tra địa chỉ real-time
  React.useEffect(() => {
    if (thongTinKhachHang.diaChi && selectedProvince) {
      const warning = checkAddressConsistency(
        thongTinKhachHang.diaChi,
        selectedProvince
      );
      setAddressWarning(warning);
    } else {
      setAddressWarning(null);
    }
  }, [thongTinKhachHang.diaChi, selectedProvince]);

  const validateForm = (): boolean => {
    const { hoTen, email, soDienThoai, diaChi } = thongTinKhachHang;
    const errors: { [key: string]: string } = {};

    // Kiểm tra họ tên (ít nhất 2 từ, không chứa số)
    if (!hoTen.trim()) {
      errors.hoTen = "Vui lòng nhập họ tên!";
    } else if (hoTen.trim().length < 2) {
      errors.hoTen = "Họ tên phải có ít nhất 2 ký tự!";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(hoTen.trim())) {
      errors.hoTen = "Họ tên chỉ được chứa chữ cái và khoảng trắng!";
    } else if (hoTen.trim().split(" ").length < 2) {
      errors.hoTen = "Vui lòng nhập đầy đủ họ và tên!";
    }

    // Kiểm tra email với regex chi tiết
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Vui lòng nhập email!";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Email không đúng định dạng (ví dụ: name@example.com)!";
    }

    // Kiểm tra số điện thoại Việt Nam
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!soDienThoai.trim()) {
      errors.soDienThoai = "Vui lòng nhập số điện thoại!";
    } else if (!phoneRegex.test(soDienThoai.trim().replace(/\s/g, ""))) {
      errors.soDienThoai =
        "Số điện thoại không đúng định dạng (VD: 0901234567)!";
    }

    // Kiểm tra địa chỉ
    if (!diaChi.trim()) {
      errors.diaChi = "Vui lòng nhập địa chỉ cụ thể!";
    } else if (diaChi.trim().length < 10) {
      errors.diaChi = "Địa chỉ phải có ít nhất 10 ký tự!";
    }

    // Kiểm tra các trường địa chỉ
    if (!selectedProvince) {
      errors.thanhPho = "Vui lòng chọn tỉnh/thành phố!";
    }
    if (!selectedDistrict) {
      errors.quanHuyen = "Vui lòng chọn quận/huyện!";
    }
    if (!selectedWard) {
      errors.phuongXa = "Vui lòng chọn phường/xã!";
    }

    // Kiểm tra phương thức thanh toán
    if (!phuongThucThanhToan) {
      errors.phuongThucThanhToan = "Vui lòng chọn phương thức thanh toán!";
    }

    // Kiểm tra tính nhất quán địa chỉ
    if (diaChi && selectedProvince) {
      const addressConsistencyWarning = checkAddressConsistency(
        diaChi,
        selectedProvince
      );
      if (addressConsistencyWarning) {
        errors.diaChi = `${addressConsistencyWarning}. Vui lòng kiểm tra lại!`;
      }
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(
        `Vui lòng kiểm tra và sửa ${Object.keys(errors).length} lỗi trong form!`
      );
      return false;
    }

    return true;
  };

  // Helper function để hiển thị lỗi cho từng trường
  const renderFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      return (
        <div className="mt-1 flex items-center text-red-600 text-xs animate-pulse">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{fieldErrors[fieldName]}</span>
        </div>
      );
    }
    return null;
  };

  const handleXacNhanDatHang = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setFieldErrors({}); // Xóa tất cả lỗi khi bắt đầu xử lý

    try {
      // Kiểm tra giỏ hàng trước khi xử lý
      if (!items || items.length === 0) {
        setError(
          "Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán."
        );
        return;
      }

      const invalidItems = items.filter(
        (item) =>
          !item.sanPham ||
          !item.sanPham.id ||
          !item.sanPham.ten ||
          !item.sanPham.gia ||
          !item.soLuong ||
          item.soLuong <= 0
      );

      if (invalidItems.length > 0) {
        setError(
          "Có sản phẩm trong giỏ hàng bị lỗi dữ liệu. Vui lòng cập nhật lại giỏ hàng."
        );
        return;
      }

      // Chuẩn bị dữ liệu chung cho đơn hàng
      const tinhTongTienSanPham = () => {
        return items.reduce((total, item) => {
          return total + Number(item.sanPham.gia) * Number(item.soLuong);
        }, 0);
      };

      const tongTienSanPham = tinhTongTienSanPham();
      const phiVanChuyenNumber = Number(phiVanChuyen) || 0;
      const tongThanhToanFinal = tongTienSanPham + phiVanChuyenNumber;

      const orderData = {
        ten_nguoi_nhan: thongTinKhachHang.hoTen.trim(),
        so_dien_thoai: thongTinKhachHang.soDienThoai.trim(),
        dia_chi_giao: `${thongTinKhachHang.diaChi}, ${thongTinKhachHang.phuongXa}, ${thongTinKhachHang.quanHuyen}, ${thongTinKhachHang.thanhPho}`,
        hinh_thuc_thanh_toan: phuongThucThanhToan,
        tong_tien: tongTienSanPham, // Chỉ tổng tiền sản phẩm
        phi_van_chuyen: phiVanChuyenNumber,
        tong_thanh_toan: tongThanhToanFinal, // Tổng cuối cùng = sản phẩm + vận chuyển
        ghi_chu: thongTinKhachHang.ghiChu || "",
        chi_tiet: items.map((item) => {
          const giaGoc = Number(item.sanPham.gia);
          const soLuong = Number(item.soLuong);

          // Debug để kiểm tra ma_bien_the
          console.log("🔍 Sản phẩm trong giỏ hàng:", {
            id: item.sanPham.id,
            ma_bien_the: item.sanPham.ma_bien_the,
            ten: item.sanPham.ten,
            mauSac: item.sanPham.mauSac,
            kichThuoc: item.sanPham.kichThuoc,
          });

          return {
            ma_bien_the: Number(item.sanPham.ma_bien_the || item.sanPham.id),
            ten_san_pham: String(item.sanPham.ten || "").trim(),
            mau_sac: String(item.sanPham.mauSac || "").trim(),
            kich_thuoc: String(item.sanPham.kichThuoc || "").trim(),
            so_luong: soLuong,
            gia_goc: giaGoc,
            loai_khuyen_mai: "", // Để trống thay vì "Không có"
            gia_khuyen_mai: 0,
            gia_sau_km: giaGoc,
          };
        }),
      };

      const userId = user?.id || 1;

      const donHangPayload = {
        ...orderData,
        ma_nguoi_dung: Number(userId),
        tong_tien: String(orderData.tong_tien),
        phi_van_chuyen: String(orderData.phi_van_chuyen),
        tong_thanh_toan: String(orderData.tong_thanh_toan),
      };

      if (Number(donHangPayload.tong_tien) <= 0) {
        setError("Tổng tiền phải lớn hơn 0");
        return;
      }

      if (
        Number(donHangPayload.tong_thanh_toan) !==
        Number(donHangPayload.tong_tien) + Number(donHangPayload.phi_van_chuyen)
      ) {
        setError(
          "Lỗi tính toán: Tổng thanh toán không khớp với tổng tiền + phí vận chuyển"
        );
        return;
      }

      if (!donHangPayload.chi_tiet || donHangPayload.chi_tiet.length === 0) {
        setError("Không có sản phẩm nào trong đơn hàng");
        return;
      }

      // Validate từng chi tiết sản phẩm
      for (const item of donHangPayload.chi_tiet) {
        console.log("🔍 Kiểm tra sản phẩm:", item);

        if (
          !item.ma_bien_the ||
          !item.ten_san_pham ||
          item.so_luong <= 0 ||
          item.gia_goc <= 0
        ) {
          console.error("❌ Sản phẩm không hợp lệ:", item);
          setError(`Sản phẩm "${item.ten_san_pham}" có dữ liệu không hợp lệ`);
          return;
        }
      }

      console.log(
        "✅ Tất cả dữ liệu đã được validate, bắt đầu gửi đơn hàng..."
      );
      const orderResult = await createOrder(donHangPayload);

      if (orderResult && orderResult.payment_url) {
        // Xóa giỏ hàng ngay khi đơn hàng được tạo thành công
        xoaGioHang();
        localStorage.setItem("pendingOrder", JSON.stringify(orderResult));
        window.location.href = orderResult.payment_url;
        return;
      } else {
        try {
          // Parse địa chỉ để lấy thông tin chi tiết
          const addressInfo = parseAddress(orderData.dia_chi_giao);

          // Tính toán kích thước và trọng lượng
          const dimensions = calculateOrderDimensions(items);

          // Chuẩn bị payload cho GHN
          const ghnPayload: GHNCreateOrderPayload = {
            to_name: orderData.ten_nguoi_nhan,
            to_phone: orderData.so_dien_thoai,
            to_address: addressInfo.address || orderData.dia_chi_giao,
            to_ward_name: addressInfo.ward || thongTinKhachHang.phuongXa,
            to_district_name:
              addressInfo.district || thongTinKhachHang.quanHuyen,
            to_province_name:
              addressInfo.province || thongTinKhachHang.thanhPho,
            cod_amount:
              orderData.hinh_thuc_thanh_toan === "cod"
                ? orderData.tong_thanh_toan
                : 0,
            content: `Đơn hàng #${orderResult.ma_don_hang || "N/A"} - ${items.map((item) => item.sanPham.ten).join(", ")}`,
            weight: dimensions.weight,
            length: dimensions.length,
            width: dimensions.width,
            height: dimensions.height,
            service_type_id: 2, // Hàng nhẹ
            payment_type_id: 1, // Người gửi trả phí
            required_note: "CHOTHUHANG", // Cho thử hàng
            note: orderData.ghi_chu || "Đơn hàng từ website",
            client_order_code: `WEB-${orderResult.ma_don_hang || Date.now()}`,
            insurance_value: Math.min(orderData.tong_tien, 5000000), // Max 5M theo quy định
            items: items.map((item) => ({
              name: item.sanPham.ten,
              code: `SP-${item.sanPham.id}`,
              quantity: item.soLuong,
              price: item.sanPham.gia,
              weight: item.sanPham.weight || 500,
              length: item.sanPham.length || 20,
              width: item.sanPham.width || 15,
              height: item.sanPham.weight
                ? Math.ceil(item.sanPham.weight / 100)
                : 5, // Estimate height based on weight
            })),
          };

          const ghnResult = await createGHNShippingOrder(ghnPayload);

          // Lưu thông tin đơn vận chuyển
          if (ghnResult.code === 200 && ghnResult.data) {
            localStorage.setItem(
              "ghnShippingInfo",
              JSON.stringify({
                order_code: ghnResult.data.order_code,
                total_fee: ghnResult.data.total_fee,
                expected_delivery_time: ghnResult.data.expected_delivery_time,
                sort_code: ghnResult.data.sort_code,
                orderId: orderResult.ma_don_hang,
              })
            );
          }
        } catch (ghnError: any) {}

        xoaGioHang();
        navigate(
          `/hoa-don?orderId=${orderResult.ma_don_hang}&paymentMethod=${orderData.hinh_thuc_thanh_toan}&status=1`,
          {
            state: { order: orderResult },
          }
        );
        return;
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 422) {
          const serverErrors = error.response.data.errors || {};
          const newFieldErrors: { [key: string]: string } = {};

          const fieldMapping: { [key: string]: string } = {
            ma_nguoi_dung: "Mã người dùng",
            ten_nguoi_nhan: "Họ tên",
            so_dien_thoai: "Số điện thoại",
            dia_chi_giao: "Địa chỉ giao hàng",
            hinh_thuc_thanh_toan: "Phương thức thanh toán",
          };

          Object.keys(serverErrors).forEach((serverField) => {
            const clientField = fieldMapping[serverField] || serverField;
            const errorMessages = serverErrors[serverField];
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              newFieldErrors[serverField] =
                `${clientField}: ${errorMessages[0]}`;
            }
          });

          setFieldErrors(newFieldErrors);
          setError(
            `Lỗi từ server: ${error.response.data.message || "Dữ liệu không hợp lệ"}`
          );
        } else if (error.response.status === 500) {
          setError(
            `Lỗi server (500): ${error.response.data.message || error.response.data.error || "Có lỗi xảy ra trên server. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."}`
          );
        } else {
          setError(
            `Lỗi ${error.response.status}: ${error.response.data.message || "Có lỗi không xác định xảy ra"}`
          );
        }
      } else if (error.request) {
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        setError("Đã có lỗi xảy ra khi xử lý thanh toán");
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
      color: "bg-green-50 border-green-200 text-green-800",
    },
    {
      value: "zalopay",
      label: "ZaloPay",
      icon: "🔵",
      desc: "Thanh toán qua ví điện tử ZaloPay",
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
    {
      value: "vnpay",
      label: "VNPay",
      icon: "🟣",
      desc: "Thanh toán qua ví điện tử VNPay",
      color: "bg-purple-50 border-purple-200 text-purple-800",
    },
  ];

  // Kiểm tra đăng nhập trước khi hiển thị trang thanh toán
  const userDataCookie = Cookies.get("user_data");
  const localUserData = localStorage.getItem("user");
  const hasUserData = userDataCookie || localUserData;

  if (!hasUserData) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        <div className="bg-white p-10 rounded-2xl text-center max-w-md mx-auto shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔐 Cần đăng nhập để thanh toán
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Để bảo mật thông tin và theo dõi đơn hàng, vui lòng đăng nhập trước
            khi thanh toán.
          </p>
          <div className="space-y-4">
            <button
              className="w-full bg-gradient-to-r from-[#518581] to-[#3d6360] hover:from-[#3d6360] hover:to-[#2a4745] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => navigate("/dangnhap")}
            >
              <span className="mr-2">🚀</span>
              Đăng nhập ngay
            </button>
            <button
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors border border-gray-200"
              onClick={() => navigate("/gio-hang")}
            >
              <span className="mr-2">🛒</span>
              Quay về giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="bg-white p-10 rounded-2xl text-center max-w-md mx-auto shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và thêm vào giỏ
            hàng!
          </p>
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={() => navigate("/")}
          >
            <span className="mr-2">🛍️</span>
            Khám phá sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl pt-20">
      {" "}
      {/* Thêm pt-20 để tránh navbar */}
      <nav className="text-sm breadcrumbs mb-6">
        <div className="flex items-center space-x-2 text-gray-600">
          <button
            onClick={() => navigate("/")}
            className="hover:text-blue-600 transition-colors"
          >
            🏠 Trang chủ
          </button>
          <span className="text-gray-400">›</span>
          <button
            onClick={() => navigate("/gio-hang")}
            className="hover:text-blue-600 transition-colors"
          >
            🛒 Giỏ hàng
          </button>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-medium">💳 Thanh toán</span>
        </div>
      </nav>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Thanh toán đơn hàng
        </h1>
        <p className="text-gray-600">
          Vui lòng kiểm tra thông tin và hoàn tất đơn hàng của bạn
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold flex items-center">
                <span className="mr-3 text-2xl">📋</span>
                Thông tin giao hàng
              </h2>
              {user ? (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  <span className="text-lg">✅</span>
                  <span className="font-medium">
                    Đã đăng nhập - Thông tin tự động
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <span className="text-lg">ℹ️</span>
                  <span className="font-medium">
                    Khách - Vui lòng nhập thông tin
                  </span>
                  <button
                    onClick={() => navigate("/dangnhap")}
                    className="ml-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Đăng nhập
                  </button>
                </div>
              )}
            </div>

            {apiLoading && (
              <div className="flex items-center justify-center mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700 font-medium">
                  Đang tải dữ liệu địa chỉ...
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hoTen"
                  value={thongTinKhachHang.hoTen}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.hoTen
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="Nguyễn Văn A"
                />
                {renderFieldError("hoTen")}
                {!fieldErrors.hoTen && (
                  <p className="text-xs text-gray-500">
                    💡 Nhập đầy đủ họ và tên
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={thongTinKhachHang.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.email
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="example@gmail.com"
                />
                {renderFieldError("email")}
                {!fieldErrors.email && (
                  <p className="text-xs text-gray-500">
                    📧 Email để nhận thông báo đơn hàng
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="soDienThoai"
                  value={thongTinKhachHang.soDienThoai}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.soDienThoai
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="0901234567"
                />
                {renderFieldError("soDienThoai")}
                {!fieldErrors.soDienThoai && (
                  <p className="text-xs text-gray-500">
                    📱 Để liên hệ khi giao hàng
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProvince ? selectedProvince.ProvinceID : ""}
                  onChange={(e) => {
                    const province = provinces.find(
                      (p) => p.ProvinceID === parseInt(e.target.value)
                    );
                    setSelectedProvince(province);
                    if (error) setError(null);
                    // Xóa lỗi khi chọn
                    if (fieldErrors.thanhPho) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        thanhPho: "",
                      }));
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.thanhPho
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  disabled={apiLoading}
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map((province) => (
                    <option
                      key={province.ProvinceID}
                      value={province.ProvinceID}
                    >
                      {province.ProvinceName}
                    </option>
                  ))}
                </select>
                {renderFieldError("thanhPho")}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDistrict ? selectedDistrict.DistrictID : ""}
                  onChange={(e) => {
                    const district = districts.find(
                      (d) => d.DistrictID === parseInt(e.target.value)
                    );
                    setSelectedDistrict(district);
                    if (error) setError(null);
                    // Xóa lỗi khi chọn
                    if (fieldErrors.quanHuyen) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        quanHuyen: "",
                      }));
                    }
                  }}
                  disabled={!selectedProvince || apiLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-100 ${
                    fieldErrors.quanHuyen
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
                >
                  <option value="">-- Chọn quận/huyện --</option>
                  {districts.map((district) => (
                    <option
                      key={district.DistrictID}
                      value={district.DistrictID}
                    >
                      {district.DistrictName}
                    </option>
                  ))}
                </select>
                {renderFieldError("quanHuyen")}
                {!selectedProvince && !fieldErrors.quanHuyen && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Vui lòng chọn tỉnh/thành phố trước
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedWard ? selectedWard.WardCode : ""}
                  onChange={(e) => {
                    const ward = wards.find(
                      (w) => w.WardCode === e.target.value
                    );
                    setSelectedWard(ward);
                    if (error) setError(null);
                    // Xóa lỗi khi chọn
                    if (fieldErrors.phuongXa) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        phuongXa: "",
                      }));
                    }
                  }}
                  disabled={!selectedDistrict || apiLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-100 ${
                    fieldErrors.phuongXa
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
                >
                  <option value="">-- Chọn phường/xã --</option>
                  {wards.map((ward) => (
                    <option key={ward.WardCode} value={ward.WardCode}>
                      {ward.WardName}
                    </option>
                  ))}
                </select>
                {renderFieldError("phuongXa")}
                {!selectedDistrict && !fieldErrors.phuongXa && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Vui lòng chọn quận/huyện trước
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="diaChi"
                  value={thongTinKhachHang.diaChi}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.diaChi
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="Số 123, Đường ABC, Khu vực XYZ..."
                />
                {renderFieldError("diaChi")}
                <div className="space-y-1">
                  {!fieldErrors.diaChi && (
                    <p className="text-xs text-gray-500">
                      🏠 Số nhà, tên đường, khu vực...
                    </p>
                  )}
                  {selectedProvince &&
                    thongTinKhachHang.diaChi &&
                    !fieldErrors.diaChi && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 flex items-start">
                          <span className="mr-2 mt-0.5">ℹ️</span>
                          <span>
                            <strong>Địa chỉ giao hàng:</strong>{" "}
                            {thongTinKhachHang.diaChi},{" "}
                            {selectedWard?.WardName || "..."},{" "}
                            {selectedDistrict?.DistrictName || "..."},{" "}
                            {selectedProvince.ProvinceName}
                          </span>
                        </p>
                      </div>
                    )}
                  {addressWarning && !fieldErrors.diaChi && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 flex items-start">
                        <span className="mr-2 mt-0.5">🚨</span>
                        <span>
                          <strong>Cảnh báo:</strong> {addressWarning}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  name="ghiChu"
                  value={thongTinKhachHang.ghiChu}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ghi chú đặc biệt cho đơn hàng (không bắt buộc)..."
                />
                <p className="text-xs text-gray-500">
                  📝 Thời gian giao hàng mong muốn, yêu cầu đặc biệt...
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="mr-2">💳</span>
              Phương thức thanh toán
            </h2>
            <div className="space-y-4">
              {phuongThucThanhToanOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                    phuongThucThanhToan === option.value
                      ? "border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="phuongThucThanhToan"
                    value={option.value}
                    checked={phuongThucThanhToan === option.value}
                    onChange={(e) => {
                      setPhuongThucThanhToan(e.target.value);
                      if (error) setError(null);
                      // Xóa lỗi khi chọn phương thức thanh toán
                      if (fieldErrors.phuongThucThanhToan) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          phuongThucThanhToan: "",
                        }));
                      }
                    }}
                    className="mt-1 mr-4 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{option.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-900 text-lg">
                          {option.label}
                        </span>
                        {phuongThucThanhToan === option.value && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            ✓ Đã chọn
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {option.desc}
                    </p>
                    {option.value === "cod" && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700">
                          ✅ Miễn phí - Không cần thanh toán trước
                        </p>
                      </div>
                    )}
                    {(option.value === "zalopay" ||
                      option.value === "momo") && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          🔒 Bảo mật cao - Thanh toán ngay lập tức
                        </p>
                      </div>
                    )}
                  </div>
                  {phuongThucThanhToan === option.value && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>

            {renderFieldError("phuongThucThanhToan")}

            {!phuongThucThanhToan && !fieldErrors.phuongThucThanhToan && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-sm flex items-center">
                  <span className="mr-2">⚠️</span>
                  Vui lòng chọn phương thức thanh toán để tiếp tục
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="mr-2">📋</span>
              Đơn hàng của bạn
            </h2>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
              {items.map((item, index) => (
                <div
                  key={item.sanPham.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-blue-50"
                  } hover:shadow-md`}
                >
                  <div className="relative">
                    <img
                      src={item.sanPham.hinhAnh}
                      alt={item.sanPham.ten}
                      className="w-14 h-14 object-cover rounded-lg"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.src =
                          "/api/placeholder/56/56?text=" +
                          encodeURIComponent(item.sanPham.ten);
                      }}
                    />
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.soLuong}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.sanPham.ten}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {item.soLuong} x {dinhDangTien(item.sanPham.gia)}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        {dinhDangTien(item.sanPham.gia * item.soLuong)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-600 flex items-center">
                  <span className="mr-2">🛍️</span>
                  Tạm tính ({items.length} sản phẩm)
                </span>
                <span className="font-semibold">
                  {dinhDangTien(tinhTongTien())}
                </span>
              </div>

              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-600 flex items-center">
                  <span className="mr-2">🚚</span>
                  Phí vận chuyển
                </span>
                <span
                  className={`font-semibold ${phiVanChuyen > 0 ? "text-green-600" : "text-amber-600"}`}
                >
                  {phiVanChuyen > 0 ? dinhDangTien(phiVanChuyen) : "Chưa tính"}
                </span>
              </div>

              {phiVanChuyen > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 flex items-center">
                    <span className="mr-2">✅</span>
                    Phí vận chuyển đã được tính toán chính xác
                  </p>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold border-t pt-4 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 py-4 rounded-b-lg">
                <span className="flex items-center">
                  <span className="mr-2">💰</span>
                  Tổng thanh toán
                </span>
                <span className="text-blue-600 text-xl">
                  {dinhDangTien(tinhTongTien() + phiVanChuyen)}
                </span>
              </div>

              {phiVanChuyen === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 flex items-center">
                    <span className="mr-2">💡</span>
                    Chọn đầy đủ địa chỉ để tính phí vận chuyển chính xác
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hiển thị tổng quan các lỗi nếu có nhiều hơn 1 lỗi */}
            {Object.keys(fieldErrors).filter((key) => fieldErrors[key]).length >
              1 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-800 font-semibold mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cần khắc phục{" "}
                  {
                    Object.keys(fieldErrors).filter((key) => fieldErrors[key])
                      .length
                  }{" "}
                  lỗi:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.keys(fieldErrors).map(
                    (key) =>
                      fieldErrors[key] && (
                        <li key={key} className="flex items-center">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                          {fieldErrors[key]}
                        </li>
                      )
                  )}
                </ul>
              </div>
            )}

            <button
              className={`w-full font-bold py-4 px-6 rounded-xl mt-6 transition-all duration-300 transform ${
                phuongThucThanhToan && !loading && !apiLoading
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleXacNhanDatHang}
              disabled={!phuongThucThanhToan || loading || apiLoading}
            >
              {loading || apiLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span>Đang xử lý thanh toán...</span>
                </div>
              ) : phuongThucThanhToan ? (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🛒</span>
                  {`Thanh toán ${dinhDangTien(tinhTongTien() + phiVanChuyen)}`}
                </div>
              ) : (
                "Chọn phương thức thanh toán"
              )}
            </button>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">🔒</span>
                <span>Bảo mật SSL</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">🚚</span>
                <span>Giao hàng nhanh</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">💯</span>
                <span>Hoàn tiền 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThanhToan;
