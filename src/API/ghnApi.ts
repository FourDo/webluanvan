import axios from "axios";

const API_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";
const TOKEN = "b880bd44-5bbe-11f0-9b81-222185cb68c8"; // Updated to working token
const SHOP_ID = 197047; // Updated to working shop ID

// Hàm helper để lấy ward code hợp lệ cho Quận 1
export const getValidFromWardCode = async (districtId: number) => {
  try {
    const wards = await getWards(districtId);
    // Tìm phường đầu tiên có sẵn trong Quận 1
    const firstWard = wards[0];
    return firstWard ? firstWard.WardCode : "21211"; // Fallback ward code
  } catch (error) {
    console.error("Lỗi khi lấy ward code:", error);
    return "21211"; // Fallback ward code
  }
};

// Hàm helper để lấy district ID hợp lệ cho địa chỉ gửi hàng (TP.HCM)
export const getValidFromDistrictId = async () => {
  try {
    // Lấy danh sách tỉnh để tìm TP.HCM
    const provinces = await getProvinces();
    const hcmProvince = provinces.find(
      (province: any) =>
        province.ProvinceName.includes("Hồ Chí Minh") ||
        province.ProvinceID === 202
    );

    if (!hcmProvince) {
      console.warn("Không tìm thấy TP.HCM, sử dụng district ID mặc định");
      return 1442; // Fallback district ID
    }

    // Lấy danh sách quận của TP.HCM
    const districts = await getDistricts(hcmProvince.ProvinceID);
    const district1 = districts.find(
      (district: any) =>
        district.DistrictName.includes("Quận 1") || district.DistrictID === 1442
    );

    return district1 ? district1.DistrictID : 1442; // Fallback nếu không tìm thấy
  } catch (error) {
    console.error("Lỗi khi lấy district ID:", error);
    return 1442; // Fallback district ID cho Quận 1
  }
};

export const getProvinces = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/master-data/province`, {
      headers: {
        Token: TOKEN,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tỉnh thành:", error);
    throw new Error("Không thể lấy danh sách tỉnh thành");
  }
};

export const getDistricts = async (provinceId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/master-data/district`, {
      headers: {
        Token: TOKEN,
      },
      params: {
        province_id: provinceId,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quận huyện:", error);
    throw new Error("Không thể lấy danh sách quận huyện");
  }
};

export const getWards = async (districtId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/master-data/ward`, {
      headers: {
        Token: TOKEN,
      },
      params: {
        district_id: districtId,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phường xã:", error);
    throw new Error("Không thể lấy danh sách phường xã");
  }
};

export const getServices = async (
  fromDistrictId: number,
  toDistrictId: number
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/v2/shipping-order/available-services`,
      {
        headers: {
          Token: TOKEN,
        },
        params: {
          shop_id: SHOP_ID,
          from_district: fromDistrictId,
          to_district: toDistrictId,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy danh sách dịch vụ:",
      error.response?.data || error.message
    );
    throw new Error("Không thể lấy danh sách dịch vụ");
  }
};

export const calculateGhnFee = async (feeData: {
  service_id: number;
  insurance_value?: number;
  coupon?: string;
  from_district_id: number;
  from_ward_code: string;
  to_district_id: number;
  to_ward_code: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  cod_value?: number;
}) => {
  try {
    // Kiểm tra các tham số bắt buộc
    if (
      !feeData.from_district_id ||
      !feeData.to_district_id ||
      !feeData.from_ward_code ||
      !feeData.to_ward_code ||
      !feeData.service_id
    ) {
      throw new Error(
        "Thiếu các tham số bắt buộc: from_district_id, to_district_id, from_ward_code, to_ward_code, service_id"
      );
    }

    const response = await axios.post(
      `${API_BASE_URL}/v2/shipping-order/fee`,
      {
        ...feeData,
        shop_id: SHOP_ID,
      },
      {
        headers: {
          Token: TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi gọi API tính phí GHN:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.code_message_value ||
        "Không thể tính phí vận chuyển GHN"
    );
  }
};
