// src/components/HomeDataLoader.tsx
import React, { useEffect } from "react";
import { useHomePageData } from "../hooks/useHomePageData";

interface HomeDataLoaderProps {
  children: (data: {
    categories: any[];
    products: any[];
    loading: boolean;
    error: string | null;
    loadData: () => Promise<void>;
  }) => React.ReactNode;
}

/**
 * Component wrapper để load data cho trang home
 * Sử dụng render prop pattern để truyền data xuống children
 */
const HomeDataLoader: React.FC<HomeDataLoaderProps> = ({ children }) => {
  const { data, loading, error, loadHomeData, isDataLoaded } =
    useHomePageData();

  // Auto load data khi component mount (chỉ một lần)
  useEffect(() => {
    if (!isDataLoaded && !loading) {
      console.log("🏠 Auto-loading home page data...");
      loadHomeData();
    }
  }, [isDataLoaded, loading, loadHomeData]);

  return (
    <>
      {children({
        categories: data?.categories || [],
        products: data?.products || [],
        loading,
        error,
        loadData: loadHomeData,
      })}
    </>
  );
};

export default HomeDataLoader;
