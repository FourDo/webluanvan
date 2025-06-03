import axios from "axios";

const API_BASE_URL = "http://localhost:3000"; // Thay đổi URL nếu backend chạy trên host/port khác

// Hàm gọi API tạo thanh toán VNPay
export const createVNPayPayment = async (paymentData: {
  amount: number; // Sử dụng number cho amount
  orderInfo: string;
  orderType: string;
  bankCode?: string;
  ipAddr?: string; // Có thể lấy từ client hoặc để backend xử lý
  language?: string;
  billingMobile?: string;
  billingEmail?: string;
  billingFullName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  billingState?: string;
  invPhone?: string;
  invEmail?: string;
  invCustomer?: string;
  invAddress?: string;
  invCompany?: string;
  invTaxCode?: string;
  invType?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/vnpay/create-payment`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Trả về dữ liệu từ response (bao gồm paymentUrl)
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API thanh toán VNPay:", error);
    throw new Error("Không thể tạo yêu cầu thanh toán VNPay");
  }
};
