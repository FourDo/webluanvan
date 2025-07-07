import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, User } from "lucide-react";
import type { Account } from "../types/Account";

const ITEMS_PER_PAGE = 5;

// Dữ liệu giả lập phù hợp với kiểu Account
const mockAccounts: Account[] = [
  {
    ma_tai_khoan: 1,
    ten_tai_khoan: "admin",
    email: "admin@example.com",
    vai_tro: "Admin",
    ngay_tao: "2025-06-01T10:00:00Z",
  },
  {
    ma_tai_khoan: 2,
    ten_tai_khoan: "user1",
    email: "user1@example.com",
    vai_tro: "User",
    ngay_tao: "2025-06-02T12:00:00Z",
  },
];

const QLTaiKhoan = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [loading] = useState(false);
  const [editingItem, setEditingItem] = useState<Account | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ten_tai_khoan: "",
    email: "",
    vai_tro: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => {
    setFormData({
      ten_tai_khoan: "",
      email: "",
      vai_tro: "",
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const startEdit = (account: Account) => {
    setEditingItem(account);
    setShowAddForm(true);
    setFormData({
      ten_tai_khoan: account.ten_tai_khoan,
      email: account.email,
      vai_tro: account.vai_tro,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này?")) {
      const updatedAccounts = accounts.filter(
        (account) => account.ma_tai_khoan !== id
      );
      setAccounts(updatedAccounts);
      const totalPages = Math.ceil(updatedAccounts.length / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (updatedAccounts.length === 0) {
        setCurrentPage(1);
      }
      alert("Xóa tài khoản thành công!");
    }
  };

  const handleSave = () => {
    // Kiểm tra dữ liệu form
    if (
      !formData.ten_tai_khoan.trim() ||
      !formData.email.trim() ||
      !formData.vai_tro.trim()
    ) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Email không hợp lệ!");
      return;
    }

    const newAccount: Account = {
      ...formData,
      ma_tai_khoan: editingItem
        ? editingItem.ma_tai_khoan
        : accounts.length > 0
          ? Math.max(...accounts.map((a) => a.ma_tai_khoan)) + 1
          : 1,
      ngay_tao: editingItem ? editingItem.ngay_tao : new Date().toISOString(),
    };

    if (editingItem) {
      setAccounts(
        accounts.map((account) =>
          account.ma_tai_khoan === editingItem.ma_tai_khoan
            ? newAccount
            : account
        )
      );
      alert("Cập nhật tài khoản thành công!");
    } else {
      const newAccounts = [...accounts, newAccount];
      setAccounts(newAccounts);
      const newTotalPages = Math.ceil(newAccounts.length / ITEMS_PER_PAGE);
      setCurrentPage(newTotalPages);
      alert("Thêm tài khoản thành công!");
    }
    resetForm();
  };

  const totalPages = Math.ceil(accounts.length / ITEMS_PER_PAGE);
  const lastItemIndex = currentPage * ITEMS_PER_PAGE;
  const firstItemIndex = lastItemIndex - ITEMS_PER_PAGE;
  const currentAccounts = accounts.slice(firstItemIndex, lastItemIndex);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <User className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý Tài khoản
          </h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm tài khoản
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? "Sửa tài khoản" : "Thêm tài khoản mới"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên tài khoản *
              </label>
              <input
                type="text"
                value={formData.ten_tai_khoan}
                onChange={(e) =>
                  setFormData({ ...formData, ten_tai_khoan: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên tài khoản..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập email..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò *
              </label>
              <input
                type="text"
                value={formData.vai_tro}
                onChange={(e) =>
                  setFormData({ ...formData, vai_tro: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập vai trò (VD: Admin, User)..."
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingItem ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên tài khoản
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAccounts.map((account) => (
                  <tr key={account.ma_tai_khoan} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.ma_tai_khoan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center text-blue-800 text-sm font-medium mr-3">
                          {account.ten_tai_khoan}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.vai_tro}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(account.ngay_tao).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(account)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account.ma_tai_khoan)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentAccounts.length === 0 && accounts.length > 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Không có dữ liệu trên trang này
                </h3>
              </div>
            )}

            {accounts.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa có tài khoản nào
                </h3>
                <p className="text-gray-500">
                  Nhấn nút "Thêm tài khoản" để bắt đầu
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <span className="text-sm text-gray-700">
                Hiển thị {firstItemIndex + 1}-
                {Math.min(lastItemIndex, accounts.length)} trên tổng số{" "}
                {accounts.length} tài khoản
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                <span className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QLTaiKhoan;
