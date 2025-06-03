import React from 'react';
import { Link } from 'react-router-dom';
import type { SanPham } from '../types/types';
import { useGioHang } from '../context/GioHangContext';

interface SanPhamCardProps {
  sanPham: SanPham;
}

const SanPhamCard: React.FC<SanPhamCardProps> = ({ sanPham }) => {
  const { themVaoGio } = useGioHang();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/san-pham/${sanPham.id}`}>
        <img 
          src={sanPham.hinhAnh} 
          alt={sanPham.ten} 
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/san-pham/${sanPham.id}`}>
          <h3 className="text-lg font-medium text-gray-900">{sanPham.ten}</h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2">{sanPham.loai}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">{sanPham.gia.toLocaleString('vi-VN')} đ</span>
          <button 
            onClick={() => themVaoGio(sanPham, 1)}
            disabled={!sanPham.conHang}
            className={`${
              sanPham.conHang 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            } text-white text-sm py-1 px-3 rounded`}
          >
            {sanPham.conHang ? 'Thêm vào giỏ' : 'Hết hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SanPhamCard;