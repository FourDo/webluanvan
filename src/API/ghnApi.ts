import axios from "axios";

const API_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";
const TOKEN = "5596bafe-44e4-11f0-9b81-222185cb68c8";

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
          shop_id: 196805,
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
        shop_id: 196805,
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
