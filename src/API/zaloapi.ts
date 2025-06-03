import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export const createZaloPayPayment = async (paymentData: {
  amount: number;
  userId: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/zalopay/create-order`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Trả về dữ liệu từ response (bao gồm order_url)
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API thanh toán ZaloPay:", error);
    throw new Error("Không thể tạo yêu cầu thanh toán ZaloPay");
  }
};
