import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

// Hàm gọi API tạo thanh toán MoMo
export const createMomoPayment = async (paymentData: {
  amount: string;
  orderInfo: string;
  redirectUrl?: string;
  ipnUrl?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/momo/create-payment`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Trả về dữ liệu từ response (bao gồm payUrl)
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API thanh toán MoMo:", error);
    throw new Error("Không thể tạo yêu cầu thanh toán MoMo");
  }
};
