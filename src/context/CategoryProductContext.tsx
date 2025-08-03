import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Category } from "../types/category";
import type { Product } from "../types/Product";
import { useCategoryProducts } from "../hooks/useCategoryProducts";

interface CategoryProductContextType {
  categories: Category[];
  products: Product[];
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  clearCache: () => void;
  isDataLoaded: boolean;
}

const CategoryProductContext = createContext<
  CategoryProductContextType | undefined
>(undefined);

export const CategoryProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data, loading, error, loadData, clearCache } = useCategoryProducts();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Wrapper để track việc đã load data chưa
  const handleLoadData = async () => {
    await loadData();
    setIsDataLoaded(true);
  };

  const categories = data?.categories || [];
  const products = data?.products || [];

  return (
    <CategoryProductContext.Provider
      value={{
        categories,
        products,
        loading,
        error,
        loadData: handleLoadData,
        clearCache,
        isDataLoaded,
      }}
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
