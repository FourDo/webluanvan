import React from "react";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import type { DoanhThuTheoThoiGianData } from "../API/thongkeApi";

interface RevenueChartProps {
  data: DoanhThuTheoThoiGianData[];
  title: string;
  type: "thang" | "quy" | "nam";
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, title, type }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("vi-VN").format(number || 0);
  };

  // Kiểm tra data hợp lệ
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm">Không có dữ liệu</p>
          </div>
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
        <div className="text-center py-8 text-gray-500">
          Chưa có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((item) => item.doanh_thu || 0));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm">
            Tổng:{" "}
            {formatCurrency(
              data.reduce((sum, item) => sum + item.doanh_thu, 0)
            )}
          </p>
        </div>
        <BarChart3 className="w-6 h-6 text-blue-600" />
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage =
            maxRevenue > 0 ? ((item.doanh_thu || 0) / maxRevenue) * 100 : 0;
          const isGrowthPositive =
            item.tang_truong !== undefined && item.tang_truong >= 0;

          return (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.thang} {type !== "nam" && item.nam}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatNumber(item.don_hang || 0)} đơn hàng
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(item.doanh_thu || 0)}
                  </p>
                  {item.tang_truong !== undefined && (
                    <div className="flex items-center justify-end space-x-1">
                      {isGrowthPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isGrowthPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.abs(item.tang_truong || 0).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                >
                  <div className="h-full bg-gradient-to-r from-transparent to-white/20"></div>
                </div>
              </div>

              {/* Growth indicator */}
              {item.tang_truong !== undefined && (
                <div className="absolute -top-1 right-0">
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isGrowthPositive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isGrowthPositive ? "+" : ""}
                    {(item.tang_truong || 0).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Doanh thu TB</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(
                data.reduce((sum, item) => sum + (item.doanh_thu || 0), 0) /
                  data.length
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Đơn hàng TB</p>
            <p className="text-lg font-bold text-purple-600">
              {Math.round(
                data.reduce((sum, item) => sum + (item.don_hang || 0), 0) /
                  data.length
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
