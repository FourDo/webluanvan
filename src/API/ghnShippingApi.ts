import axios from "axios";

const GHN_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2";
const GHN_TOKEN = "88ffa8dd-5b44-11f0-a16a-2e9c57086fef";
const GHN_SHOP_ID = 5878467;
const GHN_FROM_DISTRICT = 1446;
const GHN_FROM_WARD = "04412";

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

    const response = await axios.post(
      `${GHN_BASE_URL}/shipping-order/create`,
      {
        shop_id: GHN_SHOP_ID,
        ...payload,
      },
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
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = item.sanPham?.weight || 500; // Default 500g
    return sum + itemWeight * item.soLuong;
  }, 0);

  const maxLength = Math.max(
    ...items.map((item) => item.sanPham?.length || 20)
  );
  const maxWidth = Math.max(...items.map((item) => item.sanPham?.width || 15));
  const totalHeight = items.reduce((sum, item) => {
    const itemHeight = item.sanPham?.height || 5;
    return sum + itemHeight * item.soLuong;
  }, 0);

  return {
    weight: totalWeight,
    length: maxLength,
    width: maxWidth,
    height: Math.min(totalHeight, 200), // Max 200cm theo quy định GHN
  };
};
