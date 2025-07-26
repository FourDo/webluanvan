import React, { useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductSearch } from "../hooks/useProductSearch";
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";

interface SearchBoxProps {
  placeholder?: string;
  showDropdown?: boolean;
  maxResults?: number;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = "Tìm kiếm sản phẩm",
  showDropdown = true,
  maxResults = 5,
  className = "",
}) => {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    searchError,
    performSearch,
    clearSearch,
    navigateToProductsWithSearch,
  } = useProductSearch();

  const { trackSearchProduct } = useBehaviorTracking();

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
        setIsDropdownOpen(true);
      }, 300);
    } else {
      setIsDropdownOpen(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    navigateToProductsWithSearch();
  };

  const handleClear = () => {
    clearSearch();
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleProductClick = (productId: number) => {
    // Track behavior tìm kiếm khi user click vào sản phẩm
    trackSearchProduct(productId, searchTerm);

    setIsDropdownOpen(false);
    clearSearch();
  };

  const getProductDisplayInfo = (product: any) => {
    const mainVariant = product.bienthe?.[0];
    return {
      id: product.ma_san_pham,
      name: product.ten_san_pham,
      price: mainVariant ? parseFloat(mainVariant.gia_ban) : 0,
      image: mainVariant?.hinh_anh?.[0] || "",
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none text-gray-700 text-sm sm:text-base md:text-lg bg-transparent pr-20"
          />
          <div className="absolute right-0 flex items-center gap-2">
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="bg-[#518581] text-white rounded px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 hover:bg-green-800 transition-colors flex items-center gap-2"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown Results */}
      {showDropdown && isDropdownOpen && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isSearching && (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#518581]"></div>
              <span className="ml-2">Đang tìm kiếm...</span>
            </div>
          )}

          {searchError && (
            <div className="p-4 text-center text-red-500">{searchError}</div>
          )}

          {!isSearching && !searchError && searchResults.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Không tìm thấy sản phẩm nào cho "{searchTerm}"
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <>
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">
                  Tìm thấy {searchResults.length} sản phẩm
                </p>
              </div>

              {searchResults.slice(0, maxResults).map((product) => {
                const displayInfo = getProductDisplayInfo(product);
                return (
                  <Link
                    key={displayInfo.id}
                    to={`/sanpham/${displayInfo.id}`}
                    onClick={() => handleProductClick(displayInfo.id)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {displayInfo.image ? (
                        <img
                          src={displayInfo.image}
                          alt={displayInfo.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Search size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {displayInfo.name}
                      </h4>
                      <p className="text-sm text-[#518581] font-semibold">
                        {formatPrice(displayInfo.price)}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </Link>
                );
              })}

              {searchResults.length > maxResults && (
                <button
                  onClick={() => {
                    navigateToProductsWithSearch();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full p-3 text-center text-[#518581] hover:bg-gray-50 transition-colors border-t border-gray-100 font-medium"
                >
                  Xem tất cả {searchResults.length} sản phẩm
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
