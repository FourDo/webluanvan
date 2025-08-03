import apiClient from "../ultis/apiClient";

export interface ChiTietDonHang {
  id: number;
  ma_don_hang: number;
  ma_bien_the: number;
  ten_san_pham: string;
  mau_sac: string;
  kich_thuoc: string;
  so_luong: number;
  gia_goc: number;
  loai_khuyen_mai: string;
  gia_khuyen_mai: number;
  gia_sau_km: number;
}

export interface DonHang {
  ma_don_hang: number;
  ma_nguoi_dung: number;
  ten_nguoi_nhan: string;
  so_dien_thoai: string;
  dia_chi_giao: string;
  hinh_thuc_thanh_toan: string;
  tong_tien: string;
  phi_van_chuyen: string;
  tong_thanh_toan: string;
  ghi_chu?: string;
  trang_thai: string;
  Ngay_Tao: string;
  Ngay_Cap_Nhat: string;
  ngay_thanh_toan: string | null;
  da_thanh_toan: number; // 0: chưa thanh toán, 1: đã thanh toán
  don_vi_van_chuyen?: string | null;
  ma_van_don?: string | null;
  ngay_du_kien_giao?: string | null;
}

export interface OrderDetailResponse {
  message: string;
  don_hang: DonHang;
  chi_tiet: ChiTietDonHang[];
}

export interface ChiTietDonHangPayload {
  ma_bien_the: number;
  ten_san_pham: string;
  mau_sac: string;
  kich_thuoc: string;
  so_luong: number;
  gia_goc: number;
  loai_khuyen_mai: string;
  gia_khuyen_mai: number;
  gia_sau_km: number;
}

export interface DonHangPayload {
  ma_nguoi_dung: number;
  ten_nguoi_nhan: string;
  so_dien_thoai: string;
  dia_chi_giao: string;
  hinh_thuc_thanh_toan: string;
  tong_tien: string;
  phi_van_chuyen: string;
  tong_thanh_toan: string;
  ghi_chu?: string;
  chi_tiet: ChiTietDonHangPayload[];
}

export const orderApi = {
  // Tạo đơn hàng mới
  createOrder: (payload: DonHangPayload) => {
    // Log payload để debug chi tiết
    console.log(
      "🔍 Payload được gửi (chi tiết):",
      JSON.stringify(payload, null, 2)
    );

    // Validate từng chi tiết sản phẩm chi tiết hơn
    payload.chi_tiet.forEach((item, index) => {
      console.log(`📦 Chi tiết sản phẩm [${index}]:`, {
        ma_bien_the: item.ma_bien_the,
        ten_san_pham: item.ten_san_pham,
        mau_sac: item.mau_sac,
        kich_thuoc: item.kich_thuoc,
        so_luong: item.so_luong,
        gia_goc: item.gia_goc,
        loai_khuyen_mai: item.loai_khuyen_mai,
        gia_khuyen_mai: item.gia_khuyen_mai,
        gia_sau_km: item.gia_sau_km,
      });

      if (!item.ma_bien_the || item.ma_bien_the <= 0) {
        console.warn(
          `⚠️ Cảnh báo: ma_bien_the không hợp lệ cho sản phẩm ${index}:`,
          item.ma_bien_the
        );
      }
      if (!item.ten_san_pham || item.ten_san_pham.trim() === "") {
        console.warn(`⚠️ Cảnh báo: ten_san_pham trống cho sản phẩm ${index}`);
      }
      if (item.loai_khuyen_mai && item.loai_khuyen_mai.length > 0) {
        console.warn(
          `⚠️ Cảnh báo: loai_khuyen_mai có giá trị cho sản phẩm ${index}:`,
          item.loai_khuyen_mai
        );
      }
    });

    // Validate payload structure trước khi gửi
    if (
      !payload.ma_nguoi_dung ||
      !payload.ten_nguoi_nhan ||
      !payload.chi_tiet?.length ||
      !payload.tong_tien ||
      !payload.phi_van_chuyen ||
      !payload.tong_thanh_toan
    ) {
      throw new Error("Payload thiếu thông tin bắt buộc");
    }

    // Validate giá trị số
    if (
      Number(payload.tong_tien) <= 0 ||
      Number(payload.phi_van_chuyen) < 0 ||
      Number(payload.tong_thanh_toan) <= 0
    ) {
      throw new Error("Giá trị tiền không hợp lệ");
    }

    // Tạo payload cleaned-up để gửi
    const cleanedPayload = {
      ma_nguoi_dung: payload.ma_nguoi_dung,
      ten_nguoi_nhan: payload.ten_nguoi_nhan.trim(),
      so_dien_thoai: payload.so_dien_thoai.trim(),
      dia_chi_giao: payload.dia_chi_giao.trim(),
      hinh_thuc_thanh_toan: payload.hinh_thuc_thanh_toan,
      tong_tien: payload.tong_tien,
      phi_van_chuyen: payload.phi_van_chuyen,
      tong_thanh_toan: payload.tong_thanh_toan,
      ghi_chu: payload.ghi_chu || "",
      chi_tiet: payload.chi_tiet.map((item) => ({
        ma_bien_the: item.ma_bien_the,
        ten_san_pham: item.ten_san_pham.trim(),
        mau_sac: item.mau_sac || "",
        kich_thuoc: item.kich_thuoc || "",
        so_luong: item.so_luong,
        gia_goc: item.gia_goc,
        loai_khuyen_mai: "", // Để trống thay vì "Không có"
        gia_khuyen_mai: 0,
        gia_sau_km: item.gia_sau_km,
      })),
    };

    console.log("🚀 Cleaned payload sẽ được gửi:", cleanedPayload);

    return apiClient
      .post("/don-hang", cleanedPayload)
      .then((res) => res.data)
      .catch((error) => {
        console.error("❌ Lỗi khi tạo đơn hàng:", error);

        // Log chi tiết lỗi từ response
        if (error.response?.data) {
          console.error("📝 Chi tiết lỗi từ server:", error.response.data);

          // Log chi tiết errors nếu có
          if (error.response.data.errors) {
            console.error("🔍 Chi tiết từng lỗi:");
            Object.keys(error.response.data.errors).forEach((field) => {
              console.error(
                `   - ${field}:`,
                error.response.data.errors[field]
              );
            });
          }
        }

        // Trả về lỗi với thông tin chi tiết hơn
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Tạo đơn hàng thất bại";
        throw new Error(errorMessage);
      });
  },

  // Lấy chi tiết đơn hàng theo ID
  getOrderDetail: (orderId: string | number) =>
    apiClient
      .get<OrderDetailResponse>(`/donhang/chitietdonhang/${orderId}`)
      .then((res) => {
        console.log("📋 Response từ API getOrderDetail:", res.data);
        return res.data;
      })
      .catch((error) => {
        console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", error);

        if (error.response?.status === 404) {
          throw new Error("Không tìm thấy đơn hàng");
        }

        throw new Error("Lấy chi tiết đơn hàng thất bại.");
      }),

  // Lấy danh sách đơn hàng theo mã người dùng
  getOrdersByUserId: (userId: number) =>
    apiClient
      .get(`/donhang/${userId}`)
      .then((res) => {
        console.log("📋 Response từ API getOrdersByUserId:", res.data);

        // Kiểm tra cấu trúc response
        if (res.data.data && Array.isArray(res.data.data)) {
          // Trường hợp API trả về {message, data: [...]}
          return {
            don_hang: res.data.data,
            message: res.data.message || "Lấy danh sách đơn hàng thành công",
          };
        } else if (res.data.don_hang && Array.isArray(res.data.don_hang)) {
          // Trường hợp API trả về {don_hang: [...]}
          return res.data;
        } else {
          // Fallback: trả về dữ liệu trống
          console.warn("⚠️ Cấu trúc response không như mong đợi:", res.data);
          return {
            don_hang: [],
            message: "Không tìm thấy đơn hàng nào",
          };
        }
      })
      .catch((error) => {
        console.error("❌ Lỗi khi lấy danh sách đơn hàng:", error);

        if (error.response?.status === 404) {
          // Trả về dữ liệu trống thay vì throw error
          return { don_hang: [], message: "Khách hàng chưa có đơn hàng nào" };
        }

        throw new Error("Lấy danh sách đơn hàng thất bại.");
      }),

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: (orderId: number, status: string) =>
    apiClient
      .patch(`/donhang/${orderId}`, { trang_thai: status })
      .then((res) => {
        console.log("✅ Cập nhật trạng thái đơn hàng thành công:", res.data);
        return res.data;
      })
      .catch((error) => {
        console.error("❌ Lỗi cập nhật trạng thái đơn hàng:", error);
        throw new Error("Cập nhật trạng thái đơn hàng thất bại.");
      }),

  // Hoàn trả tiền VNPay
  refundVNPay: (orderId: number) =>
    apiClient
      .post(`/refundvnpay/${orderId}`)
      .then((res) => {
        console.log("💰 Hoàn trả tiền thành công:", res.data);
        return res.data;
      })
      .catch((error) => {
        console.error("❌ Lỗi hoàn trả tiền:", error);
        throw new Error("Hoàn trả tiền thất bại.");
      }),

  // Lấy danh sách đơn hàng chờ xác nhận
  getPendingOrders: () =>
    apiClient
      .get("/qldonhang/dsdhchoxacnhan")
      .then((res) => {
        console.log("📋 Response từ API getPendingOrders:", res.data);

        // Kiểm tra cấu trúc response
        if (res.data.data && Array.isArray(res.data.data)) {
          // Trường hợp API trả về {message, data: [...]}
          return {
            don_hang: res.data.data,
            message:
              res.data.message ||
              "Lấy danh sách đơn hàng chờ xác nhận thành công",
          };
        } else if (res.data.don_hang && Array.isArray(res.data.don_hang)) {
          // Trường hợp API trả về {don_hang: [...]}
          return res.data;
        } else if (Array.isArray(res.data)) {
          // Trường hợp API trả về trực tiếp array
          return {
            don_hang: res.data,
            message: "Lấy danh sách đơn hàng chờ xác nhận thành công",
          };
        } else {
          // Fallback: trả về dữ liệu trống
          console.warn("⚠️ Cấu trúc response không như mong đợi:", res.data);
          return {
            don_hang: [],
            message: "Không tìm thấy đơn hàng chờ xác nhận nào",
          };
        }
      })
      .catch((error) => {
        console.error("❌ Lỗi khi lấy danh sách đơn hàng chờ xác nhận:", error);

        if (error.response?.status === 404) {
          // Trả về dữ liệu trống thay vì throw error
          return {
            don_hang: [],
            message: "Không có đơn hàng chờ xác nhận nào",
          };
        }

        throw new Error("Lấy danh sách đơn hàng chờ xác nhận thất bại.");
      }),

  // Cập nhật trạng thái đơn hàng cho quản lý
  updateOrderStatusQL: (orderId: number, status: string) =>
    apiClient
      .put(`/qldonhang/${orderId}`, { trang_thai: status })
      .then((res) => {
        console.log(
          "✅ Cập nhật trạng thái đơn hàng (QL) thành công:",
          res.data
        );
        return res.data;
      })
      .catch((error) => {
        console.error("❌ Lỗi cập nhật trạng thái đơn hàng (QL):", error);
        throw new Error("Cập nhật trạng thái đơn hàng thất bại.");
      }),

  // Yêu cầu hủy hoặc trả hàng
  requestCancelReturn: (
    orderId: number,
    requestData: { yeu_cau_huy_tra: string; ly_do_huy_tra: string }
  ) =>
    apiClient
      .post(`/ghn/yeucauhuytra/${orderId}`, requestData)
      .then((res) => {
        console.log("✅ Yêu cầu hủy/trả hàng thành công:", res.data);
        return res.data;
      })
      .catch((error) => {
        console.error("❌ Lỗi khi yêu cầu hủy/trả hàng:", error);
        throw new Error(
          error.response?.data?.message || "Yêu cầu hủy/trả hàng thất bại."
        );
      }),
};

// Export các hàm riêng lẻ để tương thích với code cũ
export const createOrder = orderApi.createOrder;
export const getOrderDetail = orderApi.getOrderDetail;
export const getOrdersByUserId = orderApi.getOrdersByUserId;
export const updateOrderStatus = orderApi.updateOrderStatus;
export const updateOrderStatusQL = orderApi.updateOrderStatusQL;
export const refundVNPay = orderApi.refundVNPay;
export const getPendingOrders = orderApi.getPendingOrders;
export const requestCancelReturn = orderApi.requestCancelReturn;

export default orderApi;
