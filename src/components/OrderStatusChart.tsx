import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface OrderStatusChartProps {
  data: {
    tong_don_hang: number;
    don_thanh_cong: number;
    don_huy: number;
    don_cho_xu_ly: number;
    don_dang_giao: number;
  };
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const chartData = [
    { name: "Thành công", value: data.don_thanh_cong, color: "#10B981" },
    { name: "Đang giao", value: data.don_dang_giao, color: "#3B82F6" },
    { name: "Chờ xử lý", value: data.don_cho_xu_ly, color: "#F59E0B" },
    { name: "Đã hủy", value: data.don_huy, color: "#EF4444" },
  ];

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / data.tong_don_hang) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Trạng thái đơn hàng
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [value, "Đơn hàng"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.name}: </span>
            <span className="text-sm font-semibold ml-1">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusChart;
