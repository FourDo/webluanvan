import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { SanPhamGioHang, SanPham } from '../types/types';

interface GioHangContextType {
  items: SanPhamGioHang[];
  themVaoGio: (sanPham: SanPham, soLuong: number) => void;
  xoaKhoiGio: (sanPhamId: number) => void;
  capNhatSoLuong: (sanPhamId: number, soLuong: number) => void;
  xoaGioHang: () => void;
  tinhTongTien: () => number;
  demSoLuongSanPham: () => number;
}

const GioHangContext = createContext<GioHangContextType | undefined>(undefined);

export const GioHangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<SanPhamGioHang[]>([]);

  const themVaoGio = (sanPham: SanPham, soLuong: number) => {
    setItems(prevItems => {
      const sanPhamDaCo = prevItems.find(item => item.sanPham.id === sanPham.id);
      if (sanPhamDaCo) {
        return prevItems.map(item =>
          item.sanPham.id === sanPham.id
            ? { ...item, soLuong: item.soLuong + soLuong }
            : item
        );
      }
      return [...prevItems, { sanPham, soLuong }];
    });
  };

  const xoaKhoiGio = (sanPhamId: number) => {
    setItems(prevItems => prevItems.filter(item => item.sanPham.id !== sanPhamId));
  };

  const capNhatSoLuong = (sanPhamId: number, soLuong: number) => {
    if (soLuong <= 0) {
      xoaKhoiGio(sanPhamId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.sanPham.id === sanPhamId ? { ...item, soLuong } : item
      )
    );
  };

  const xoaGioHang = () => {
    setItems([]);
  };

  const tinhTongTien = () => {
    return items.reduce((tong, item) => tong + (item.sanPham.gia * item.soLuong), 0);
  };

  const demSoLuongSanPham = () => {
    return items.reduce((count, item) => count + item.soLuong, 0);
  };

  return (
    <GioHangContext.Provider
      value={{
        items,
        themVaoGio,
        xoaKhoiGio,
        capNhatSoLuong,
        xoaGioHang,
        tinhTongTien,
        demSoLuongSanPham
      }}
    >
      {children}
    </GioHangContext.Provider>
  );
};

export const useGioHang = () => {
  const context = useContext(GioHangContext);
  if (context === undefined) {
    throw new Error('useGioHang phải được sử dụng trong GioHangProvider');
  }
  return context;
};