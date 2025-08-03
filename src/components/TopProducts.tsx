import React from "react";
import { Crown, TrendingUp, Package } from "lucide-react";
import type { TopProduct } from "../API/thongkeApi";

interface TopProductsProps {
  data: TopProduct[];
}

const TopProducts: React.FC<TopProductsProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("vi-VN").format(number || 0);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Sản Phẩm Bán Chạy</h3>
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div className="text-center py-8 text-gray-500">
          Chưa có dữ liệu sản phẩm bán chạy
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Sản Phẩm Bán Chạy</h3>
        <Package className="w-6 h-6 text-blue-600" />
      </div>

      <div className="space-y-4">
        {data.slice(0, 5).map((product, index) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold">
                {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {product.ten_san_pham}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(product.so_luong_ban)} đã bán
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(product.doanh_thu)}
              </p>
              <div className="flex items-center justify-end space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">
                  {product.ti_le_phan_tram
                    ? product.ti_le_phan_tram.toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Tổng doanh thu top 5
          </p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(
              data
                .slice(0, 5)
                .reduce((sum, product) => sum + product.doanh_thu, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopProducts;
