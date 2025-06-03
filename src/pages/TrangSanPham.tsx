import React, { useState, useEffect } from "react";
import ProductSwiper from "../components/ProductSwiper";
import { Filter } from "lucide-react";
import FilterMenu from "../components/FilterMenu";
import ProductCard from "../components/ProductCard";

const TrangSanPham: React.FC = () => {
  interface Product {
    id: number; // Thêm id
    image: string;
    category: string;
    name: string;
    description: string;
    price: number;
  }

  const [selected, setSelected] = useState("Featured");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Mặc định 8 sản phẩm (2 sản phẩm/hàng x 4 hàng)

  const mockData: Product[] = [
    {
      id: 1,
      image: "/image/product1.png",
      category: "Kệ sách",
      name: "Kệ sách gỗ",
      description: "Sự kết hợp giữa gỗ và len",
      price: 63.47,
    },
    {
      id: 2,
      image: "/image/product2.png",
      category: "Ghế",
      name: "Ghế thẩm mỹ trắng",
      description: "Sự kết hợp giữa gỗ và len",
      price: 45.99,
    },
    {
      id: 3,
      image: "/image/product3.png",
      category: "Đèn",
      name: "Đèn thông minh Bardono",
      description: "Dễ sử dụng với kết nối Bluetooth",
      price: 78.23,
    },
    {
      id: 4,
      image: "/image/product4.png",
      category: "Sofa",
      name: "Sofa Empuk Banget",
      description: "Sử dụng chất liệu kapuk randu",
      price: 78.23,
    },
    {
      id: 5,
      image: "/image/product4.png",
      category: "Sofa",
      name: "Sofa Empuk Banget",
      description: "Sử dụng chất liệu kapuk randu",
      price: 78.23,
    },
    {
      id: 6,
      image: "/image/product5.png",
      category: "Bàn",
      name: "Bàn gỗ tự nhiên",
      description: "Gỗ sồi cao cấp",
      price: 99.99,
    },
    {
      id: 7,
      image: "/image/product6.png",
      category: "Tủ",
      name: "Tủ quần áo hiện đại",
      description: "Thiết kế tối giản",
      price: 150.0,
    },
    {
      id: 8,
      image: "/image/product7.png",
      category: "Đèn",
      name: "Đèn bàn LED",
      description: "Ánh sáng dịu nhẹ",
      price: 29.99,
    },
    {
      id: 9,
      image: "/image/product8.png",
      category: "Sofa",
      name: "Sofa da cao cấp",
      description: "Da thật 100%",
      price: 200.0,
    },
    {
      id: 10,
      image: "/image/product9.png",
      category: "Kệ sách",
      name: "Kệ sách treo tường",
      description: "Tiết kiệm không gian",
      price: 45.0,
    },
  ];

  const options = [
    "Featured",
    "Best selling",
    "Alphabetically, A–Z",
    "Alphabetically, Z–A",
    "Price, low to high",
    "Price, high to low",
    "Date, old to new",
    "Date, new to old",
  ];

  // Cập nhật itemsPerPage dựa trên breakpoint và isFilterMenuOpen
  useEffect(() => {
    const updateItemsPerPage = () => {
      const isMdOrAbove = window.innerWidth >= 768; // Breakpoint md
      const isLgOrAbove = window.innerWidth >= 1024; // Breakpoint lg
      if (isLgOrAbove) {
        setItemsPerPage(isFilterMenuOpen ? 12 : 16); // 3 hoặc 4 sản phẩm/hàng x 4 hàng
      } else if (isMdOrAbove) {
        setItemsPerPage(isFilterMenuOpen ? 8 : 12); // 2 hoặc 3 sản phẩm/hàng x 4 hàng
      } else {
        setItemsPerPage(8); // 2 sản phẩm/hàng x 4 hàng
      }
      setCurrentPage(1); // Reset về trang 1 khi itemsPerPage thay đổi
    };

    updateItemsPerPage(); // Cập nhật ngay khi mount
    window.addEventListener("resize", updateItemsPerPage); // Cập nhật khi resize

    return () => window.removeEventListener("resize", updateItemsPerPage); // Cleanup
  }, [isFilterMenuOpen]);

  // Tính toán số sản phẩm trên mỗi trang
  const totalPages = Math.ceil(mockData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = mockData.slice(startIndex, endIndex);

  // Hàm chuyển trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  return (
    <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col justify-center items-center mb-8 text-center">
          <h1 className="mt-10 mb-6 text-5xl font-bold">Products</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
            We display products based on the latest products we have, if you
            want to see our old products please enter the name of the item
          </p>
        </div>
      </div>
      <div className="w-full">
        <ProductSwiper />
      </div>
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Filter button - Ẩn trên màn hình nhỏ */}
          <button
            className={`hidden sm:flex items-center gap-2 ml-4 bg-[#518581] text-white rounded-lg shadow px-4 py-2 h-[44px] transition ${
              isFilterMenuOpen ? "bg-green-800" : "hover:bg-green-800"
            }`}
            onClick={toggleFilterMenu}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">
              {isFilterMenuOpen ? "Close Filter" : "Filter"}
            </span>
          </button>
          {/* Product count */}
          <span className="text-gray-600 font-medium whitespace-nowrap">
            {mockData.length} products
          </span>
          {/* Search box */}
          <div className="flex flex-1 items-center bg-white rounded-lg shadow px-4 py-2 max-w-xl w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 outline-none text-gray-700 text-base bg-transparent"
            />
            <button className="bg-[#518581] text-white rounded px-4 py-2 ml-2 hover:bg-green-800 transition">
              Search
            </button>
          </div>
          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium">Sort by:</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {options.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bố cục chính: FilterMenu và danh sách sản phẩm */}
        <div className="flex gap-6 mt-8">
          {/* FilterMenu bên trái */}
          <div
            className={`transition-all duration-300 ${
              isFilterMenuOpen ? "w-full sm:w-1/4" : "w-0"
            } overflow-hidden`}
          >
            {isFilterMenuOpen && <FilterMenu />}
          </div>

          {/* Danh sách sản phẩm bên phải */}
          <div className="flex-1">
            <div
              className={`grid gap-6 transition-all duration-300 ${
                isFilterMenuOpen
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
              }`}
            >
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id} // Sử dụng id làm key
                  id={product.id} // Truyền id vào ProductCard
                  image={product.image}
                  category={product.category}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                />
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  className={`px-4 py-2 bg-[#518581] text-white rounded-lg ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-800"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className={`px-4 py-2 bg-[#518581] text-white rounded-lg ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-800"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrangSanPham;
