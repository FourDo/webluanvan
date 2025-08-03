import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const LOCAL_KEY = 'gioHangItems';
  const MAX_AGE_MS = 15 * 24 * 60 * 60 * 1000; // 15 ngày

  const getInitialItems = (): SanPhamGioHang[] => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return [];
      const { items, timestamp } = JSON.parse(raw);
      if (!Array.isArray(items) || typeof timestamp !== 'number') return [];
      if (Date.now() - timestamp > MAX_AGE_MS) {
        localStorage.removeItem(LOCAL_KEY);
        return [];
      }
      return items;
    } catch {
      return [];
    }
  };

  const [items, setItems] = useState<SanPhamGioHang[]>(getInitialItems);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ items, timestamp: Date.now() }));
  }, [items]);

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