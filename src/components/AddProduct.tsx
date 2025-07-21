import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableImage } from "./SortableImage";
import RichTextEditor from "./RichTextEditor";
import { productApi } from "../API/productApi";
import type { InputProduct, InputVariant } from "../types/Product";
import categoryApi from "../API/categoryApi";
import { colorApi } from "../API/colorApi";
import { sizeApi } from "../API/sizeApi";
import { Plus, Image, Trash2, ArrowLeft, Save, Sparkles } from "lucide-react";

interface Color {
  ten_mau_sac: string;
  hex_code: string;
}

interface Size {
  ten_kich_thuoc: string;
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [newProduct, setNewProduct] = useState<InputProduct>({
    ten_san_pham: "",
    mo_ta_ngan: "",
    chat_lieu: "",
    thuong_hieu: "",
    ten_danh_muc: "",
    trang_thai_hoat_dong: "hoat_dong",
    ma_khuyen_mai: null,
    bienthe: [],
  });

  const [newVariant, setNewVariant] = useState<InputVariant>({
    ten_mau_sac: "",
    hex_code: "",
    ten_kich_thuoc: "",
    gia_ban: 0,
    so_luong_ton: 0,
    trang_thai_hoat_dong_btsp: "hoat_dong",
    hinh_anh: [],
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"product" | "variants">("product");
  const [showAddVariantForm, setShowAddVariantForm] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchColors();
    fetchSizes();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.map((cat: any) => cat.ten_danh_muc));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await colorApi.fetchColors();
      setColors(response);
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await sizeApi.fetchSizes();
      setSizes(response);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  // AI Generate Description
  const generateAIDescription = async () => {
    if (!newProduct.ten_san_pham.trim()) {
      alert("Vui lòng nhập tên sản phẩm trước khi tạo mô tả AI!");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await axios.post(
        "https://luanvan-7wv1.onrender.com/api/ai/generate",
        {
          ten_san_pham: newProduct.ten_san_pham,
        },
        {
          timeout: 30000, // 30 seconds timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.mo_ta) {
        setNewProduct({
          ...newProduct,
          mo_ta_ngan: response.data.mo_ta,
        });
        alert("Đã tạo mô tả sản phẩm bằng AI thành công!");
      } else {
        alert("API không trả về mô tả sản phẩm. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error generating AI description:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message =
            error.response.data?.message ||
            error.response.data?.error ||
            "Unknown server error";

          switch (status) {
            case 500:
              alert(
                `Lỗi server (500): ${message}\n\nKiểm tra:\n- Server AI có đang chạy?\n- API key có hợp lệ?\n- Model AI có khả dụng?`
              );
              break;
            case 404:
              alert("API endpoint không tồn tại. Kiểm tra đường dẫn API.");
              break;
            case 400:
              alert(`Dữ liệu không hợp lệ: ${message}`);
              break;
            default:
              alert(`Lỗi API (${status}): ${message}`);
          }
        } else if (error.request) {
          // Network error
          alert(
            "Không thể kết nối đến server AI. Kiểm tra:\n- Server có đang chạy tại http://127.0.0.1:8000?\n- Kết nối mạng"
          );
        } else {
          alert(`Lỗi khi gửi request: ${error.message}`);
        }
      } else {
        alert("Lỗi không xác định khi tạo mô tả sản phẩm bằng AI!");
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(uploadToCloudinary);

    try {
      const urls = await Promise.all(uploadPromises);
      setNewVariant({
        ...newVariant,
        hinh_anh: [...newVariant.hinh_anh, ...urls],
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Lỗi khi tải ảnh lên!");
    } finally {
      setUploading(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "webluanvan_upload");
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dubtdbe8z/image/upload",
      formData
    );
    return response.data.secure_url;
  };

  const handleVariantImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = newVariant.hinh_anh.findIndex(
        (_, index) => `variant-image-${index}` === active.id
      );
      const newIndex = newVariant.hinh_anh.findIndex(
        (_, index) => `variant-image-${index}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        setNewVariant({
          ...newVariant,
          hinh_anh: arrayMove(newVariant.hinh_anh, oldIndex, newIndex),
        });
      }
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const colorName = e.target.value;
    const selectedColorObject = colors.find((c) => c.ten_mau_sac === colorName);
    setSelectedColor(colorName);
    setNewVariant({
      ...newVariant,
      ten_mau_sac: colorName,
      hex_code: selectedColorObject ? selectedColorObject.hex_code : "",
    });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sizeName = e.target.value;
    setSelectedSize(sizeName);
    setNewVariant({ ...newVariant, ten_kich_thuoc: sizeName });
  };

  const addVariant = () => {
    if (
      newVariant.ten_mau_sac &&
      newVariant.hex_code &&
      newVariant.ten_kich_thuoc &&
      newVariant.gia_ban > 0 &&
      newVariant.so_luong_ton >= 0 &&
      newVariant.hinh_anh.length > 0
    ) {
      const variantExists = newProduct.bienthe.some(
        (variant) =>
          variant.ten_mau_sac === newVariant.ten_mau_sac &&
          variant.ten_kich_thuoc === newVariant.ten_kich_thuoc
      );

      if (variantExists) {
        alert("Biến thể này đã tồn tại!");
        return;
      }

      setNewProduct({
        ...newProduct,
        bienthe: [...newProduct.bienthe, { ...newVariant }],
      });

      // Reset form và ẩn form thêm biến thể
      setNewVariant({
        ten_mau_sac: "",
        hex_code: "",
        ten_kich_thuoc: "",
        gia_ban: 0,
        so_luong_ton: 0,
        trang_thai_hoat_dong_btsp: "hoat_dong",
        hinh_anh: [],
      });
      setSelectedColor("");
      setSelectedSize("");
      setShowAddVariantForm(false); // Ẩn form thêm biến thể
      alert("Thêm biến thể thành công!");
    } else {
      alert("Vui lòng điền đầy đủ thông tin biến thể!");
    }
  };

  const removeVariant = (index: number) => {
    const updatedVariants = newProduct.bienthe.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, bienthe: updatedVariants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newProduct.ten_san_pham ||
      !newProduct.mo_ta_ngan ||
      !newProduct.chat_lieu ||
      !newProduct.thuong_hieu ||
      !newProduct.ten_danh_muc
    ) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm!");
      return;
    }

    if (newProduct.bienthe.length === 0) {
      alert("Vui lòng thêm ít nhất một biến thể!");
      return;
    }

    try {
      // Convert InputProduct to Product format for API
      const productForApi = {
        ...newProduct,
        bienthe: newProduct.bienthe.map((variant) => ({
          ...variant,
          gia_ban: variant.gia_ban.toString(),
        })),
      };

      await productApi.addProduct(productForApi);
      alert("Thêm sản phẩm thành công!");
      navigate("/admin/sanpham");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Lỗi khi thêm sản phẩm!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/sanpham")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Thêm sản phẩm mới
                </h1>
                <p className="text-sm text-gray-500">
                  Tạo sản phẩm với đầy đủ thông tin và biến thể
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate("/admin/sanpham")}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={uploading || newProduct.bienthe.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                Lưu sản phẩm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === "product" && (
                <>
                  {/* Thông tin cơ bản */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Thông tin cơ bản
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên sản phẩm *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nhập tên sản phẩm..."
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newProduct.ten_san_pham}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              ten_san_pham: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thương hiệu *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nhập thương hiệu..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newProduct.thuong_hieu}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              thuong_hieu: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mô tả sản phẩm */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Mô tả sản phẩm *
                      </label>
                      <button
                        type="button"
                        onClick={generateAIDescription}
                        disabled={
                          aiGenerating || !newProduct.ten_san_pham.trim()
                        }
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Sparkles
                          size={16}
                          className={aiGenerating ? "animate-spin" : ""}
                        />
                        {aiGenerating ? "Đang tạo..." : "AI Generate"}
                      </button>
                    </div>
                    <RichTextEditor
                      value={newProduct.mo_ta_ngan}
                      onChange={(value) =>
                        setNewProduct({
                          ...newProduct,
                          mo_ta_ngan: value,
                        })
                      }
                      placeholder="Viết mô tả chi tiết về sản phẩm..."
                      height="200px"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      Sử dụng editor để định dạng mô tả sản phẩm với HTML hoặc
                      nhấn nút AI Generate để tự động tạo mô tả.
                    </div>
                  </div>

                  {/* Chi tiết sản phẩm */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Chi tiết sản phẩm
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chất liệu *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="VD: 100% Cotton"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newProduct.chat_lieu}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              chat_lieu: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Danh mục *
                        </label>
                        <select
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newProduct.ten_danh_muc || ""}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              ten_danh_muc: e.target.value,
                            })
                          }
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((category, index) => (
                            <option
                              key={`category-${category}-${index}`}
                              value={category}
                            >
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "variants" && (
                <>
                  {/* Button thêm biến thể */}
                  {!showAddVariantForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Quản lý biến thể
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddVariantForm(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
                      >
                        <Plus size={16} />
                        Thêm biến thể mới
                      </button>
                    </div>
                  )}

                  {/* Form thêm biến thể */}
                  {showAddVariantForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Thêm biến thể mới
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Màu sắc *
                            </label>
                            <select
                              required
                              value={selectedColor}
                              onChange={handleColorChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Chọn màu sắc</option>
                              {colors.map((color, index) => (
                                <option
                                  key={`color-${color.ten_mau_sac}-${index}`}
                                  value={color.ten_mau_sac}
                                >
                                  {color.ten_mau_sac}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kích thước *
                            </label>
                            <select
                              required
                              value={selectedSize}
                              onChange={handleSizeChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Chọn kích thước</option>
                              {sizes.map((size, index) => (
                                <option
                                  key={`size-${size.ten_kich_thuoc}-${index}`}
                                  value={size.ten_kich_thuoc}
                                >
                                  {size.ten_kich_thuoc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Giá bán *
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="0"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={newVariant.gia_ban}
                              onChange={(e) =>
                                setNewVariant({
                                  ...newVariant,
                                  gia_ban: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Số lượng tồn *
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="0"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={newVariant.so_luong_ton}
                              onChange={(e) =>
                                setNewVariant({
                                  ...newVariant,
                                  so_luong_ton: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* Upload ảnh */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh biến thể *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-2">
                              <label className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-500">
                                  Tải ảnh lên
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageUpload}
                                  disabled={uploading}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>

                        {/* Image Preview with Drag & Drop */}
                        {newVariant.hinh_anh.length > 0 && (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleVariantImageDragEnd}
                          >
                            <SortableContext
                              items={newVariant.hinh_anh.map(
                                (_, index) => `variant-image-${index}`
                              )}
                              strategy={horizontalListSortingStrategy}
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {newVariant.hinh_anh.map((image, index) => (
                                  <SortableImage
                                    key={`variant-image-${index}`}
                                    id={`variant-image-${index}`}
                                    image={image}
                                    index={index}
                                    onRemove={(index) => {
                                      const updatedImages =
                                        newVariant.hinh_anh.filter(
                                          (_, i) => i !== index
                                        );
                                      setNewVariant({
                                        ...newVariant,
                                        hinh_anh: updatedImages,
                                      });
                                    }}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddVariantForm(false);
                              // Reset form khi hủy
                              setNewVariant({
                                ten_mau_sac: "",
                                hex_code: "",
                                ten_kich_thuoc: "",
                                gia_ban: 0,
                                so_luong_ton: 0,
                                trang_thai_hoat_dong_btsp: "hoat_dong",
                                hinh_anh: [],
                              });
                              setSelectedColor("");
                              setSelectedSize("");
                            }}
                            className="flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={addVariant}
                            disabled={uploading}
                            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={16} />
                            Thêm biến thể
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Danh sách biến thể */}
                  {newProduct.bienthe.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Danh sách biến thể ({newProduct.bienthe.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {newProduct.bienthe.map((variant, index) => (
                          <div
                            key={index}
                            className="p-6 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-4">
                              <img
                                src={variant.hinh_anh[0]}
                                alt={`${variant.ten_mau_sac} ${variant.ten_kich_thuoc}`}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {variant.ten_mau_sac} -{" "}
                                  {variant.ten_kich_thuoc}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Giá:{" "}
                                  {parseInt(
                                    variant.gia_ban.toString()
                                  ).toLocaleString()}
                                  đ • SL: {variant.so_luong_ton}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Hành động nhanh
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("product")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === "product"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    📝 Thông tin sản phẩm
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("variants")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === "variants"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    🎨 Biến thể ({newProduct.bienthe.length})
                  </button>
                </div>
              </div>

              {/* Trạng thái */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Cài đặt sản phẩm
                </h3>
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={newProduct.trang_thai_hoat_dong === "hoat_dong"}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          trang_thai_hoat_dong: e.target.checked
                            ? "hoat_dong"
                            : "khong_hoat_dong",
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Hiển thị sản phẩm
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Sản phẩm sẽ hiển thị trên trang web
                  </p>
                </div>
              </div>

              {/* Thống kê */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Thống kê
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Biến thể:</span>
                    <span className="font-medium">
                      {newProduct.bienthe.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tổng tồn kho:</span>
                    <span className="font-medium">
                      {newProduct.bienthe.reduce(
                        (total, variant) => total + variant.so_luong_ton,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
