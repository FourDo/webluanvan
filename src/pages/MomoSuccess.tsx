// src/pages/MomoSuccess.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MomoSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resultCode = params.get("resultCode");

    if (resultCode === "0") {
      // Thành công
      alert("Thanh toán Momo thành công!");
      navigate("/dat-hang-thanh-cong");
    } else {
      alert("Thanh toán Momo thất bại hoặc bị hủy!");
      navigate("/gio-hang");
    }
  }, [location, navigate]);

  return <div>Đang xử lý kết quả thanh toán...</div>;
};

export default MomoSuccess;
