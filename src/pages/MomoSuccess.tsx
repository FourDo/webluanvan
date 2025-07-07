// src/pages/MomoSuccess.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const MomoSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Lấy các tham số từ URL
        const amount = searchParams.get('amount');
        const appid = searchParams.get('appid');
        const apptransid = searchParams.get('apptransid');
        const bankcode = searchParams.get('bankcode');
        const checksum = searchParams.get('checksum');
        const discountamount = searchParams.get('discountamount');
        const pmcid = searchParams.get('pmcid');
        const statusParam = searchParams.get('status');

        console.log('MoMo Callback Params:', {
          amount,
          appid,
          apptransid,
          bankcode,
          checksum,
          discountamount,
          pmcid,
          status: statusParam
        });

        // Kiểm tra trạng thái thanh toán
        if (statusParam === '1') {
          setStatus('success');
          setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xử lý.');
          
          // Lấy thông tin đơn hàng từ localStorage
          const pendingOrder = localStorage.getItem('pendingOrder');
          let orderData = {
            ma_don_hang: apptransid,
            trang_thai: 'thanh_toan_thanh_cong',
            tong_thanh_toan: amount,
            hinh_thuc_thanh_toan: 'MoMo'
          };
          
          if (pendingOrder) {
            try {
              const parsedOrder = JSON.parse(pendingOrder);
              orderData = { ...orderData, ...parsedOrder };
              localStorage.removeItem('pendingOrder');
            } catch (error) {
              console.error('Lỗi parse pending order:', error);
            }
          }
          
          // Xóa giỏ hàng sau khi thanh toán thành công
          localStorage.removeItem('cart');
          
          // Chuyển hướng về trang hóa đơn sau 3 giây
          setTimeout(() => {
            navigate('/hoa-don', { 
              state: { 
                order: orderData
              } 
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Thanh toán thất bại hoặc bị hủy.');
        }
      } catch (error) {
        console.error('Lỗi xử lý callback:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xử lý thanh toán.');
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Đang xử lý thanh toán...
            </h2>
            <p className="text-gray-600">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-700">
                Bạn sẽ được chuyển hướng về trang hóa đơn trong giây lát...
              </p>
            </div>
            <button
              onClick={() => navigate('/hoa-don')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Xem hóa đơn ngay
            </button>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/gio-hang')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Quay lại giỏ hàng
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MomoSuccess;
