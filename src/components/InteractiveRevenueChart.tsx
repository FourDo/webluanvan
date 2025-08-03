import React, { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import type { DoanhThuTheoThoiGianData } from "../API/thongkeApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface InteractiveRevenueChartProps {
  data: DoanhThuTheoThoiGianData[];
  title: string;
  type: "thang" | "quy" | "nam";
}

const InteractiveRevenueChart: React.FC<InteractiveRevenueChartProps> = ({
  data,
  title,
  type,
}) => {
  const chartRef = useRef<ChartJS<"bar">>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      compactDisplay: "short",
    }).format(amount || 0);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("vi-VN").format(number || 0);
  };

  // Prepare chart data
  const chartData = {
    labels: data.map((item) => {
      if (type === "nam") return `Năm ${item.nam}`;
      if (type === "quy") return `${item.thang} ${item.nam}`;
      return `${item.thang}/${item.nam}`;
    }),
    datasets: [
      {
        label: "Doanh thu",
        data: data.map((item) => item.doanh_thu || 0),
        backgroundColor: data.map((_, index) => {
          const colors = [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(168, 85, 247, 0.8)",
            "rgba(14, 165, 233, 0.8)",
            "rgba(132, 204, 22, 0.8)",
            "rgba(234, 88, 12, 0.8)",
          ];
          return colors[index % colors.length];
        }),
        borderColor: data.map((_, index) => {
          const colors = [
            "rgba(59, 130, 246, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(139, 92, 246, 1)",
            "rgba(236, 72, 153, 1)",
            "rgba(34, 197, 94, 1)",
            "rgba(249, 115, 22, 1)",
            "rgba(168, 85, 247, 1)",
            "rgba(14, 165, 233, 1)",
            "rgba(132, 204, 22, 1)",
            "rgba(234, 88, 12, 1)",
          ];
          return colors[index % colors.length];
        }),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const dataIndex = context[0].dataIndex;
            const item = data[dataIndex];
            return `${item.thang} ${type !== "nam" ? item.nam : ""}`;
          },
          label: (context) => {
            const dataIndex = context.dataIndex;
            const item = data[dataIndex];
            return [
              `Doanh thu: ${formatCurrency(item.doanh_thu || 0)}`,
              `Đơn hàng: ${formatNumber(item.don_hang || 0)}`,
              `Tăng trưởng: ${(item.tang_truong || 0).toFixed(1)}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 500,
          },
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6b7280",
          callback: function (value) {
            return formatCurrency(value as number);
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
    hover: {
      mode: "index",
      intersect: false,
    },
    onHover: (event, elements) => {
      if (event.native?.target) {
        (event.native.target as HTMLElement).style.cursor =
          elements.length > 0 ? "pointer" : "default";
      }
    },
  };

  // Calculate stats
  const totalRevenue = data.reduce(
    (sum, item) => sum + (item.doanh_thu || 0),
    0
  );
  const totalOrders = data.reduce((sum, item) => sum + (item.don_hang || 0), 0);
  const avgRevenue = totalRevenue / (data.length || 1);
  const avgOrders = totalOrders / (data.length || 1);

  // Calculate growth trend
  const latestGrowth =
    data.length > 0 ? data[data.length - 1].tang_truong || 0 : 0;
  const isGrowthPositive = latestGrowth >= 0;

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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600 text-sm">
              Tổng: {formatCurrency(totalRevenue)}
            </p>
            <div className="flex items-center space-x-1">
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
                {isGrowthPositive ? "+" : ""}
                {latestGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        <BarChart3 className="w-6 h-6 text-blue-600" />
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
          <p className="text-lg font-bold text-green-600">
            {formatNumber(totalOrders)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Doanh thu TB</p>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(avgRevenue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Đơn hàng TB</p>
          <p className="text-lg font-bold text-orange-600">
            {Math.round(avgOrders)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveRevenueChart;
