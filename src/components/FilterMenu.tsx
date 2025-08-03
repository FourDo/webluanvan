// src/components/FilterMenu.tsx

import React from "react";
import { Range } from "react-range";

interface FilterMenuProps {
  priceRange: [number, number];
  onPriceChange: (values: [number, number]) => void;
  maxPrice: number;

  // SỬA ĐỊNH DẠNG Ở ĐÂY: allColors giờ có thêm 'hex'
  allColors: { name: string; count: number; hex: string }[];
  selectedColors: string[];
  onColorChange: (colorName: string) => void;

  allCategories: { name: string; count: number }[];
  selectedCategories: string[];
  onCategoryChange: (categoryName: string) => void;

  allBrands: { name: string; count: number }[];
  selectedBrands: string[];
  onBrandChange: (brandName: string) => void;

  onResetFilters: () => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  priceRange,
  onPriceChange,
  maxPrice,
  allColors,
  selectedColors,
  onColorChange,
  allCategories,
  selectedCategories,
  onCategoryChange,
  allBrands,
  selectedBrands,
  onBrandChange,
  onResetFilters,
}) => {
  // Đảm bảo maxPrice luôn hợp lệ để tránh lỗi với react-range
  const safeMaxPrice = Math.max(maxPrice, 1);
  const safePriceRange: [number, number] = [
    Math.min(priceRange[0], safeMaxPrice - 1),
    Math.min(priceRange[1], safeMaxPrice),
  ];

  return (
    <div className="bg-white p-6 font-sans w-full rounded-lg shadow-sm border">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Bộ lọc</h3>
          <button
            onClick={onResetFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Đặt lại
          </button>
        </div>

        <hr />

        {/* Phần Lọc Giá */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Giá</h3>
          <p className="text-gray-500 text-sm mb-6">
            Giá tối đa: {safeMaxPrice.toLocaleString("vi-VN")} VND
          </p>
          <div className="relative h-5 mb-6 px-2">
            <Range
              step={1}
              min={0}
              max={safeMaxPrice}
              values={safePriceRange}
              onChange={(values) => onPriceChange(values as [number, number])}
              renderTrack={({ props, children }) => (
                <div {...props} className="h-1 bg-gray-200 rounded-full w-full">
                  <div
                    className="h-1 bg-green-600 rounded-full"
                    style={{
                      width: `${((safePriceRange[1] - safePriceRange[0]) / safeMaxPrice) * 100}%`,
                      marginLeft: `${(safePriceRange[0] / safeMaxPrice) * 100}%`,
                    }}
                  />
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...rest } = props;
                return (
                  <div
                    key={key} // ✅ truyền trực tiếp key
                    {...rest} // ✅ phần còn lại
                    className="w-5 h-5 bg-white border-2 border-green-600 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                );
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-4 text-md">
            <div className="w-1/2 text-center bg-gray-100 rounded-md py-2">
              <span>{safePriceRange[0].toLocaleString("vi-VN")} VND</span>
            </div>
            <div className="w-1/2 text-center bg-gray-100 rounded-md py-2">
              <span>{safePriceRange[1].toLocaleString("vi-VN")} VND</span>
            </div>
          </div>
        </div>

        <hr />

        {/* Phần Lọc Màu Sắc */}
        {allColors.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Màu sắc</h3>
            <div className="space-y-3">
              {allColors.map((color) => (
                <div
                  key={color.name}
                  className={`flex justify-between items-center cursor-pointer p-2 rounded-md transition-colors ${
                    selectedColors.includes(color.name)
                      ? "font-semibold bg-green-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onColorChange(color.name)}
                >
                  {/* Cụm hiển thị màu và tên */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <span className="text-base text-gray-800">
                      {color.name}
                    </span>
                  </div>

                  {/* Số lượng */}
                  <span className="text-gray-500 bg-gray-200 px-2 rounded-full text-xs">
                    {color.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr />

        {/* Phần Lọc Thương hiệu */}
        {allBrands.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Thương hiệu</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {allBrands.map((brand) => (
                <div
                  key={brand.name}
                  className="flex justify-between items-center"
                >
                  <label className="flex items-center gap-3 cursor-pointer text-base text-gray-700">
                    <input
                      type="checkbox"
                      className="w-5 h-5 border-gray-400 rounded text-green-600 focus:ring-green-500"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={() => onBrandChange(brand.name)}
                    />
                    <span>{brand.name}</span>
                  </label>
                  <span className="text-gray-500 bg-gray-200 px-2 rounded-full text-xs">
                    {brand.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr />

        {/* Phần Lọc Danh mục */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {allCategories.map((category) => (
              <div
                key={category.name}
                className="flex justify-between items-center"
              >
                <label className="flex items-center gap-3 cursor-pointer text-base text-gray-700">
                  <input
                    type="checkbox"
                    className="w-5 h-5 border-gray-400 rounded text-green-600 focus:ring-green-500"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => onCategoryChange(category.name)}
                  />
                  <span>{category.name}</span>
                </label>
                <span className="text-gray-500 bg-gray-200 px-2 rounded-full text-xs">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
