import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Category } from "../types/category";
import type { Product } from "../types/Product";
import categoryApi from "../API/categoryApi";
import { productApi } from "../API/productApi";

interface CategoryProductContextType {
  categories: Category[];
  products: Product[];
  refresh: () => Promise<void>;
  loading: boolean;
}

const CategoryProductContext = createContext<
  CategoryProductContextType | undefined
>(undefined);

export const CategoryProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        categoryApi.getAll(),
        productApi.getProducts(),
      ]);

      // Xử lý danh mục
      if (catRes && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      } else {
        console.error("Dữ liệu danh mục không đúng định dạng:", {
          response: catRes,
          hasData: !!catRes?.data,
          isArray: Array.isArray(catRes?.data),
        });
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
        setProducts(productsWithImage);
      } else {
        console.error("Dữ liệu sản phẩm không đúng định dạng:", prodRes);
      }
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <CategoryProductContext.Provider
      value={{ categories, products, refresh: fetchData, loading }}
    >
      {children}
    </CategoryProductContext.Provider>
  );
};

export const useCategoryProduct = () => {
  const context = useContext(CategoryProductContext);
  if (!context) {
    throw new Error(
      "useCategoryProduct phải được dùng trong CategoryProductProvider"
    );
  }
  return context;
};
