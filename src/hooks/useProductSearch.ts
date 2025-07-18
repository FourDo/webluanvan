import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../API/productApi";
import type { Product } from "../types/Product";

interface UseProductSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Product[];
  isSearching: boolean;
  searchError: string | null;
  performSearch: () => void;
  clearSearch: () => void;
  navigateToProductsWithSearch: () => void;
}

export const useProductSearch = (): UseProductSearchReturn => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await productApi.searchProducts(searchTerm.trim());
      if (response.message && Array.isArray(response.data)) {
        // Lọc chỉ lấy sản phẩm có biến thể và hình ảnh hợp lệ
        const validProducts = response.data.filter(
          (product) =>
            product.trang_thai_hoat_dong === "hoat_dong" &&
            Array.isArray(product.bienthe) &&
            product.bienthe.length > 0 &&
            product.bienthe[0].hinh_anh &&
            Array.isArray(product.bienthe[0].hinh_anh) &&
            product.bienthe[0].hinh_anh.length > 0
        );
        setSearchResults(validProducts);
      } else {
        setSearchResults([]);
        setSearchError("Không tìm thấy sản phẩm nào.");
      }
    } catch (error) {
      setSearchError((error as Error).message || "Lỗi khi tìm kiếm sản phẩm.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchError(null);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  const navigateToProductsWithSearch = useCallback(() => {
    if (searchTerm.trim()) {
      // Chuyển hướng đến trang sản phẩm với query parameter
      navigate(`/sanpham?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/sanpham");
    }
  }, [searchTerm, navigate]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    searchError,
    performSearch,
    clearSearch,
    navigateToProductsWithSearch,
  };
};
