import { useState, useEffect } from "react";
import { User, Lock, Unlock, Search, Eye, RefreshCw } from "lucide-react";
import type { Account } from "../types/Account";
import { accountApi } from "../API/accountApi";

const ITEMS_PER_PAGE = 10;

const QLTaiKhoan = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountApi.fetchAccounts();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAccounts(data);
      } else if (
        data &&
        typeof data === "object" &&
        Array.isArray((data as any).data)
      ) {
        // Handle case where API returns { data: [...] }
        setAccounts((data as any).data);
      } else {
        console.error("API response is not an array:", data);
        setAccounts([]);
        setError("Dữ liệu trả về không đúng định dạng!");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]); // Ensure accounts is always an array
      setError("Không thể tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "khoa" ? "hoat_dong" : "khoa";
    const confirmMessage =
      newStatus === "khoa"
        ? "Bạn có chắc muốn khóa tài khoản này?"
        : "Bạn có chắc muốn mở khóa tài khoản này?";

    if (window.confirm(confirmMessage)) {
      try {
        await accountApi.updateAccountStatus(id, newStatus);
        if (Array.isArray(accounts)) {
          setAccounts(
            accounts.map((account) =>
              account.ma_nguoi_dung === id
                ? { ...account, trang_thai: newStatus }
                : account
            )
          );
        }
        alert(
          `${newStatus === "khoa" ? "Khóa" : "Mở khóa"} tài khoản thành công!`
        );
      } catch (error) {
        alert("Cập nhật trạng thái thất bại!");
      }
    }
  };

  const handleUpdateRole = async (id: number, newRole: string) => {
    if (window.confirm("Bạn có chắc muốn thay đổi quyền tài khoản này?")) {
      try {
        await accountApi.updateAccountRole(id, newRole);
        if (Array.isArray(accounts)) {
          setAccounts(
            accounts.map((account) =>
              account.ma_nguoi_dung === id
                ? { ...account, vai_tro: newRole }
                : account
            )
          );
        }
        alert("Cập nhật quyền tài khoản thành công!");
      } catch (error) {
        alert("Cập nhật quyền thất bại!");
      }
    }
  };

  const allFilteredAccounts = accounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (account.ho_ten || "").toLowerCase().includes(searchLower) ||
      (account.email || "").toLowerCase().includes(searchLower) ||
      (account.so_dien_thoai || "").toLowerCase().includes(searchLower) ||
      (account.dia_chi || "").toLowerCase().includes(searchLower) ||
      (account.vai_tro || "").toLowerCase().includes(searchLower)
    );
  });

  // const allFilteredAccounts = accounts.filter((account) => {
  //   // Hàm chuẩn hóa chuỗi: viết thường + trim + bỏ thừa khoảng trắng
  //   const normalize = (str: string) =>
  //     str.toLowerCase().trim().replace(/\s+/g, " ");

  //   const searchLower = normalize(searchTerm);

  //   // Nếu search term rỗng, hiển thị tất cả
  //   if (!searchLower) return true;

  //   return (
  //     normalize(account.ho_ten || "").includes(searchLower) ||
  //     normalize(account.email || "").includes(searchLower) ||
  //     normalize(account.so_dien_thoai || "").includes(searchLower) ||
  //     normalize(account.dia_chi || "").includes(searchLower) ||
  //     normalize(account.vai_tro || "").includes(searchLower)
  //   );
  // });
  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(allFilteredAccounts.length / ITEMS_PER_PAGE);
  const lastItemIndex = currentPage * ITEMS_PER_PAGE;
  const firstItemIndex = lastItemIndex - ITEMS_PER_PAGE;
  const currentAccounts = allFilteredAccounts.slice(
    firstItemIndex,
    lastItemIndex
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Quản lý Tài khoản
                </h1>
                <p className="text-gray-500 mt-1">
                  Quản lý toàn bộ tài khoản người dùng trong hệ thống.
                </p>
              </div>
            </div>
            <button
              onClick={fetchAccounts}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng tài khoản</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.length}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hiển thị</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allFilteredAccounts.length}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại, địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p className="font-bold">Đã có lỗi xảy ra</p>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : currentAccounts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm
                ? "Không tìm thấy tài khoản"
                : "Chưa có tài khoản nào"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Vui lòng thử lại với từ khóa khác."
                : "Không có dữ liệu tài khoản để hiển thị."}
            </p>
          </div>
        ) : (
          <>
            {/* Table View */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Họ tên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Địa chỉ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentAccounts.map((account, index) => (
                    <tr
                      key={account.ma_nguoi_dung}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {firstItemIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-blue-600 hover:text-blue-900">
                            {account.ho_ten}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.so_dien_thoai}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="line-clamp-2 truncate">
                          {account.dia_chi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={account.vai_tro}
                          onChange={(e) =>
                            handleUpdateRole(
                              account.ma_nguoi_dung,
                              e.target.value
                            )
                          }
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            account.trang_thai === "hoat_dong"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {account.trang_thai === "hoat_dong"
                            ? "Hoạt động"
                            : "Khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(account.ngay_tao).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                account.ma_nguoi_dung,
                                account.trang_thai
                              )
                            }
                            className={`p-2 rounded-lg transition-all ${
                              account.trang_thai === "hoat_dong"
                                ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              account.trang_thai === "hoat_dong"
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                          >
                            {account.trang_thai === "hoat_dong" ? (
                              <Lock size={18} />
                            ) : (
                              <Unlock size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 mt-6">
                <span className="text-sm text-gray-700">
                  Hiển thị {firstItemIndex + 1}-
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    allFilteredAccounts.length
                  )}{" "}
                  trên tổng số {allFilteredAccounts.length} tài khoản
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((c) => c - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((c) => c + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QLTaiKhoan;
