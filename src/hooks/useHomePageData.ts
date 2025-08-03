// src/hooks/useHomePageData.ts
import { useState, useCallback } from "react";
import type { Category } from "../types/category";
import type { Product } from "../types/Product";
import categoryApi from "../API/categoryApi";
import { productApi } from "../API/productApi";

// Simple cache utilities
const simpleCache = {
  get: (key: string, maxAge: number = 5 * 60 * 1000) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },
  set: (key: string, data: any) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch {
      // Ignore localStorage errors
    }
  },
};

interface HomePageData {
  categories: Category[];
  products: Product[];
}

interface UseHomePageDataReturn {
  data: HomePageData | null;
  loading: boolean;
  error: string | null;
  loadHomeData: () => Promise<void>;
  isDataLoaded: boolean;
}

/**
 * Hook chuyên dụng cho trang home
 * Chỉ load data khi được gọi, có cache để tránh duplicate calls
 */
export function useHomePageData(): UseHomePageDataReturn {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const loadHomeData = useCallback(async () => {
    // Kiểm tra cache trước
    const CACHE_KEY = "home_page_data";
    const CACHE_TIME = 5 * 60 * 1000; // 5 phút

    const cachedData = simpleCache.get(CACHE_KEY, CACHE_TIME);
    if (cachedData && !isDataLoaded) {
      setData(cachedData);
      setIsDataLoaded(true);
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [catRes, prodRes] = await Promise.all([
        categoryApi.getAll(),
        productApi.getProducts(),
      ]);

      let categories: Category[] = [];
      let products: Product[] = [];

      // Xử lý danh mục
      if (catRes && Array.isArray(catRes.data)) {
        categories = catRes.data;
      } else {
        console.error("Dữ liệu danh mục không đúng định dạng:", catRes);
      }

      // Xử lý sản phẩm - chỉ lấy những sản phẩm có hình ảnh
      if (prodRes && Array.isArray(prodRes.data)) {
        const productsWithImage = prodRes.data
          .filter((p: any) => {
            // Kiểm tra sản phẩm có biến thể và đang hoạt động
            if (
              !p.bienthe ||
              !Array.isArray(p.bienthe) ||
              p.bienthe.length === 0
            ) {
              return false;
            }

            // Kiểm tra trang thái hoạt động
            if (p.trang_thai_hoat_dong !== "hoat_dong") {
              return false;
            }

            return true; // Chấp nhận tất cả sản phẩm có variants và đang hoạt động
          })
          .map((p: any) => {
            // Tìm hình ảnh từ variant đầu tiên có hình
            let image = "/image/hetcuu3.png"; // Default fallback image

            // Tìm variant có hình ảnh
            const variantWithImage = p.bienthe.find(
              (variant: any) =>
                variant.hinh_anh &&
                Array.isArray(variant.hinh_anh) &&
                variant.hinh_anh.length > 0
            );

            if (variantWithImage && variantWithImage.hinh_anh[0]) {
              image = variantWithImage.hinh_anh[0];
            }

            return {
              ...p,
              image: image,
            };
          })
          .slice(0, 20); // Chỉ lấy 20 sản phẩm đầu tiên cho home page

        products = productsWithImage;
      } else {
        console.error("Dữ liệu sản phẩm không đúng định dạng:", prodRes);
      }

      const homeData = { categories, products };
      setData(homeData);
      setIsDataLoaded(true);

      // Cache data
      simpleCache.set(CACHE_KEY, homeData);
    } catch (e: any) {
      console.error("❌ Error loading home page data:", e);
      setError(e.message || "Không thể tải dữ liệu trang chủ");
    } finally {
      setLoading(false);
    }
  }, [loading, isDataLoaded]);

  return {
    data,
    loading,
    error,
    loadHomeData,
    isDataLoaded,
  };
}
