import axios from "axios";

const GHN_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2";
const GHN_TOKEN = "88ffa8dd-5b44-11f0-a16a-2e9c57086fef";
const GHN_SHOP_ID = 5878467;
const GHN_FROM_DISTRICT = 1446;
const GHN_FROM_WARD = "0441";

export interface GHNShippingItem {
  name: string;
  code?: string;
  quantity: number;
  price: number;
  length?: number;
  width?: number;
  weight?: number;
  height?: number;
  category?: {
    level1?: string;
    level2?: string;
    level3?: string;
  };
}

export interface GHNCreateOrderPayload {
  to_name: string;
  to_phone: string;
  to_address: string;
  to_ward_name: string;
  to_district_name: string;
  to_province_name: string;
  cod_amount: number;
  content: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  service_type_id: number; // 2: Hàng nhẹ, 5: Hàng nặng
  payment_type_id: number; // 1: Người gửi trả, 2: Người nhận trả
  required_note: string; // CHOTHUHANG, CHOXEMHANGKHONGTHU, KHONGCHOXEMHANG
  note?: string;
  client_order_code?: string;
  insurance_value?: number;
  items?: GHNShippingItem[];
  from_name?: string;
  from_phone?: string;
  from_address?: string;
  from_ward_name?: string;
  from_district_name?: string;
  from_province_name?: string;
}

export interface GHNCreateOrderResponse {
  code: number;
  message: string;
  data: {
    order_code: string;
    sort_code: string;
    trans_type: string;
    ward_encode: string;
    district_encode: string;
    fee: {
      main_service: number;
      insurance: number;
      cod_fee: number;
      station_do: number;
      station_pu: number;
      return: number;
      r2s: number;
      return_again: number;
      coupon: number;
      document_return: number;
      double_check: number;
      double_check_deliver: number;
      pick_remote_areas_fee: number;
      deliver_remote_areas_fee: number;
      pick_remote_areas_fee_return: number;
      deliver_remote_areas_fee_return: number;
      cod_failed_fee: number;
    };
    total_fee: number;
    expected_delivery_time: string;
  };
}

// Helper function để parse địa chỉ
export const parseAddress = (fullAddress: string) => {
  const parts = fullAddress.split(",").map((part) => part.trim());

  if (parts.length >= 4) {
    return {
      address: parts[0], // Địa chỉ cụ thể
      ward: parts[1], // Phường/Xã
      district: parts[2], // Quận/Huyện
      province: parts[3], // Tỉnh/Thành phố
    };
  }

  // Fallback nếu không parse được
  return {
    address: fullAddress,
    ward: "",
    district: "",
    province: "",
  };
};

// Tạo đơn hàng vận chuyển GHN
export async function createGHNShippingOrder(
  payload: GHNCreateOrderPayload
): Promise<GHNCreateOrderResponse> {
  try {
    console.log("🚚 Tạo đơn vận chuyển GHN:", payload);

    // Thêm thông tin người gửi mặc định nếu không có
    const finalPayload = {
      shop_id: GHN_SHOP_ID,
      from_name: payload.from_name || "Cửa hàng thời trang",
      from_phone: payload.from_phone || "0123456789",
      from_address: payload.from_address || "123 Đường ABC",
      from_ward_name: payload.from_ward_name || "Phường Tân Định",
      from_district_name: payload.from_district_name || "Quận 1",
      from_province_name: payload.from_province_name || "TP. Hồ Chí Minh",
      ...payload,
    };

    const response = await axios.post(
      `${GHN_BASE_URL}/shipping-order/create`,
      finalPayload,
      {
        headers: {
          Token: GHN_TOKEN,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("✅ GHN Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Lỗi tạo đơn GHN:", error);

    if (error.response) {
      console.error("📊 GHN Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      throw new Error(
        `GHN API Error ${error.response.status}: ${error.response.data?.message || "Unknown error"}`
      );
    } else if (error.request) {
      throw new Error("Không thể kết nối đến GHN API");
    } else {
      throw new Error(`GHN Error: ${error.message}`);
    }
  }
}

// Helper function để tính toán kích thước và trọng lượng đơn hàng
export const calculateOrderDimensions = (items: any[]) => {
  if (!items || items.length === 0) {
    return {
      weight: 500, // Default 500g
      length: 20, // Default 20cm
      width: 15, // Default 15cm
      height: 10, // Default 10cm
    };
  }

  const totalWeight = items.reduce((sum, item) => {
    // Estimate weight based on product type or use default
    const itemWeight = item.sanPham?.weight || 200; // Default 200g per item
    return sum + itemWeight * item.so_luong;
  }, 0);

  // Calculate package dimensions based on items
  const maxLength = Math.max(
    ...items.map((item) => item.sanPham?.length || 15),
    15
  );
  const maxWidth = Math.max(
    ...items.map((item) => item.sanPham?.width || 10),
    10
  );
  const totalHeight = items.reduce((sum, item) => {
    const itemHeight = item.sanPham?.height || 3; // Default 3cm per item
    return sum + itemHeight * item.so_luong;
  }, 0);

  return {
    weight: Math.min(totalWeight, 30000), // Max 30kg theo quy định GHN
    length: Math.min(maxLength, 150), // Max 150cm
    width: Math.min(maxWidth, 150), // Max 150cm
    height: Math.min(Math.max(totalHeight, 5), 150), // Min 5cm, Max 150cm
  };
};
