import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Category } from "../types/category";
import type { Product } from "../types/Product";
import categoryApi from "../API/categoryApi";
import { getProducts } from "../API/productApi";

interface CategoryProductContextType {
  categories: Category[];
  products: Product[];
  refresh: () => Promise<void>;
  loading: boolean;
}

const CategoryProductContext = createContext<CategoryProductContextType | undefined>(undefined);

export const CategoryProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await categoryApi.getAll();
      const prodRes = await getProducts();
      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
      if (Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
      }
    } catch (e) {
      // Có thể show toast lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <CategoryProductContext.Provider value={{ categories, products, refresh: fetchData, loading }}>
      {children}
    </CategoryProductContext.Provider>
  );
};

export const useCategoryProduct = () => {
  const context = useContext(CategoryProductContext);
  if (!context) {
    throw new Error("useCategoryProduct phải được dùng trong CategoryProductProvider");
  }
  return context;
}; 