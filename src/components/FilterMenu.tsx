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
  onResetFilters,
}) => {
  return (
    <div className="bg-white p-6 font-sans w-full rounded-lg shadow-sm border">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Filters</h3>
          <button
            onClick={onResetFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Reset
          </button>
        </div>

        <hr />

        {/* Phần Lọc Giá (Không đổi) */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Price</h3>
          <p className="text-gray-500 text-sm mb-6">
            Max price: ${maxPrice.toFixed(2)}
          </p>
          <div className="relative h-5 mb-6 px-2">
            <Range
              step={1}
              min={0}
              max={maxPrice}
              values={priceRange}
              onChange={(values) => onPriceChange(values as [number, number])}
              renderTrack={({ props, children }) => (
                <div {...props} className="h-1 bg-gray-200 rounded-full w-full">
                  <div
                    className="h-1 bg-green-600 rounded-full"
                    style={{
                      width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`,
                      marginLeft: `${(priceRange[0] / maxPrice) * 100}%`,
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
              <span>${priceRange[0]}</span>
            </div>
            <div className="w-1/2 text-center bg-gray-100 rounded-md py-2">
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        <hr />

        {/* SỬA PHẦN LỌC MÀU SẮC */}
        {allColors.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Color</h3>
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

        {/* Phần Lọc Danh mục (Không đổi) */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Category</h3>
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
