// src/hooks/useCategoryProducts.ts
import { useState, useCallback } from "react";
import type { Category } from "../types/category";
import type { Product } from "../types/Product";
import categoryApi from "../API/categoryApi";
import { productApi } from "../API/productApi";

interface CategoryProductData {
  categories: Category[];
  products: Product[];
}

interface UseCategoryProductsReturn {
  data: CategoryProductData | null;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook để load categories và products chỉ khi cần thiết
 * Sử dụng cache để tránh gọi API trùng lặp
 */
export function useCategoryProducts(): UseCategoryProductsReturn {
  const [data, setData] = useState<CategoryProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data function
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Loading categories and products...");

      const [catRes, prodRes] = await Promise.all([
        categoryApi.getAll(),
        productApi.getProducts(),
      ]);

      let categories: Category[] = [];
      let products: Product[] = [];

      // Xử lý danh mục
      if (catRes && Array.isArray(catRes.data)) {
        categories = catRes.data;
        console.log(`📋 Loaded ${categories.length} categories`);
      } else {
        console.error("Dữ liệu danh mục không đúng định dạng:", catRes);
      }

      // Xử lý sản phẩm
      if (prodRes && Array.isArray(prodRes.data)) {
        const productsWithImage = prodRes.data
          .filter((p: any) => {
            // Chỉ lấy sản phẩm có biến thể và có hình ảnh
            return (
              p.bienthe &&
              Array.isArray(p.bienthe) &&
              p.bienthe.length > 0 &&
              p.bienthe[0].hinh_anh &&
              Array.isArray(p.bienthe[0].hinh_anh) &&
              p.bienthe[0].hinh_anh.length > 0
            );
          })
          .map((p: any) => ({
            ...p,
            image: p.bienthe[0].hinh_anh[0],
          }));

        products = productsWithImage;
        console.log(`📦 Loaded ${products.length} products with images`);
      } else {
        console.error("Dữ liệu sản phẩm không đúng định dạng:", prodRes);
      }

      setData({ categories, products });
      console.log("✅ Successfully loaded categories and products");
    } catch (e: any) {
      console.error("❌ Error loading categories and products:", e);
      setError(e.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cache function
  const clearCache = useCallback(() => {
    setData(null);
    console.log("🗑️ Cleared category products cache");
  }, []);

  return {
    data,
    loading,
    error,
    loadData,
    clearCache,
  };
}

/**
 * Hook để lấy chỉ categories (không sử dụng - để tương lai)
 */
export function useCategories() {
  // TODO: Implement nếu cần thiết
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

/**
 * Hook để lấy chỉ products (không sử dụng - để tương lai)
 */
export function useProducts() {
  // TODO: Implement nếu cần thiết
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}
