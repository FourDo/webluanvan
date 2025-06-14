import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Space,
  message,
  Tag,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload";
import type { ColumnsType } from "antd/es/table";

// Import ReactQuill và CSS của nó
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import theme CSS cho editor

// ----- ĐỊNH NGHĨA CÁC INTERFACE (TYPE) CHO DỮ LIỆU TỪ API -----

// Dữ liệu trả về cho 1 hình ảnh
interface HinhAnh {
  ma_hinh_anh: number;
  ma_san_pham: number;
  url_hinh_anh: string;
  mo_ta_hinh_anh: string | null;
  ngay_tao: string;
}

// Dữ liệu trả về cho 1 biến thể
interface BienTheAPI {
  ma_bien_the: number;
  ma_san_pham: number;
  ma_kich_thuoc: number;
  ma_mau_sac: number;
  so_luong_ton: number;
  gia_ban: string; // API trả về string
  ngay_tao: string;
}

// Dữ liệu trả về cho 1 danh mục
interface DanhMuc {
  ma_danh_muc: number;
  ten_danh_muc: string;
  mo_ta: string;
  ngay_tao: string;
}

// Dữ liệu trả về cho 1 sản phẩm hoàn chỉnh
interface SanPhamAPI {
  ma_san_pham: number;
  ten_san_pham: string;
  thuong_hieu: string;
  mo_ta_ngan: string;
  mo_ta_chi_tiet: string;
  chat_lieu: string;
  trang_thai: "co_san" | "het_hang" | "ngung_kinh_doanh";
  ngay_tao: string;
  ngay_cap_nhat: string;
  danhmuc: DanhMuc;
  khuyenmai: any | null;
  bienthe: BienTheAPI[];
  hinhanh: HinhAnh[];
}

// Định nghĩa base URL cho API để dễ dàng quản lý
const API_BASE_URL = "http://luanvan-7wv1.onrender.com/api";

const QLSanPham = () => {
  // ----- STATE MANAGEMENT -----
  const [products, setProducts] = useState<SanPhamAPI[]>([]);
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SanPhamAPI | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // State để quản lý trạng thái loading
  const [form] = Form.useForm();

  // State để lưu danh sách file ảnh cho form
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // ----- CẤU HÌNH CHO EDITOR -----
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  // ----- CÁC HÀM GỌI API -----

  // Hàm lấy danh sách sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/san-pham`);
      // API của bạn có thể trả về trong response.data.data
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      message.error("Lỗi khi tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/danh-muc`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách danh mục:", error);
      message.error("Không thể tải danh sách danh mục!");
    }
  };

  // Sử dụng useEffect để gọi API khi component được mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ----- CÁC HÀM XỬ LÝ SỰ KIỆN (CRUD) -----

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields(); // Reset form
    setFileList([]); // Reset danh sách file
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  // Hàm xử lý khi submit form (Thêm mới / Cập nhật)
  const onFinish = async (values: any) => {
    // Lấy token từ localStorage (Giả định đã lưu sau khi admin đăng nhập)
    // !!! QUAN TRỌNG: Bạn cần có cơ chế đăng nhập và lưu token.
    const token = localStorage.getItem("admin_token");
    if (!token) {
      message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại!");
      return;
    }

    // Tạo đối tượng FormData để gửi dữ liệu và file
    const formData = new FormData();

    // 1. Thêm các trường dữ liệu vào formData
    formData.append("ma_danh_muc", values.ma_danh_muc);
    formData.append("ten_san_pham", values.ten_san_pham);
    formData.append("thuong_hieu", values.thuong_hieu);
    formData.append("mo_ta_ngan", values.mo_ta_ngan || "");
    // Xử lý giá trị từ ReactQuill
    const moTaChiTiet =
      values.mo_ta_chi_tiet === "<p><br></p>" ? "" : values.mo_ta_chi_tiet;
    formData.append("mo_ta_chi_tiet", moTaChiTiet || "");
    formData.append("trang_thai", values.trang_thai);
    formData.append("chat_lieu", values.chat_lieu);

    // 2. Thêm mảng biến thể vào formData theo định dạng yêu cầu
    values.bienthe.forEach((variant: any, index: number) => {
      formData.append(`bienthe[${index}][mau_sac]`, variant.mau_sac);
      formData.append(`bienthe[${index}][kich_thuoc]`, variant.kich_thuoc);
      formData.append(`bienthe[${index}][gia]`, variant.gia);
      formData.append(`bienthe[${index}][so_luong]`, variant.so_luong);
    });

    // 3. Thêm file hình ảnh vào formData
    // `fileList` là state của component Upload
    fileList.forEach((file) => {
      // originFileObj là đối tượng File thực sự
      if (file.originFileObj) {
        formData.append("hinh_anh[]", file.originFileObj);
      }
    });

    // Đặt lại tiêu đề cho request
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      setLoading(true);
      if (editingProduct) {
        // Logic cập nhật (POST hoặc PUT đến /api/san-pham/{id})
        // await axios.post(`${API_BASE_URL}/san-pham/${editingProduct.ma_san_pham}`, formData, config);
        // message.success("Cập nhật sản phẩm thành công!");
      } else {
        // Logic thêm mới
        await axios.post(`${API_BASE_URL}/san-pham`, formData, config);
        message.success("Thêm sản phẩm thành công!");
      }
      setIsModalVisible(false);
      fetchProducts(); // Tải lại danh sách sản phẩm sau khi thêm/sửa thành công
    } catch (error: any) {
      console.error("Lỗi khi gửi dữ liệu:", error.response?.data || error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra, không thể thêm sản phẩm!"
      );
    } finally {
      setLoading(false);
    }
  };

  // ----- ĐỊNH NGHĨA CÁC CỘT CHO BẢNG -----
  const columns: ColumnsType<SanPhamAPI> = [
    {
      title: "ID",
      dataIndex: "ma_san_pham",
      key: "ma_san_pham",
      width: 60,
      fixed: "left",
    },
    {
      title: "Ảnh",
      dataIndex: "hinhanh",
      key: "hinhanh",
      render: (hinhanh: HinhAnh[]) =>
        hinhanh && hinhanh.length > 0 ? (
          <img
            src={hinhanh[0].url_hinh_anh}
            alt="product"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ) : (
          "N/A"
        ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "ten_san_pham",
      key: "ten_san_pham",
      width: 250,
    },
    {
      title: "Danh mục",
      dataIndex: ["danhmuc", "ten_danh_muc"],
      key: "danhmuc",
      render: (ten_danh_muc) => ten_danh_muc || "N/A",
    },
    { title: "Thương hiệu", dataIndex: "thuong_hieu", key: "thuong_hieu" },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status: string) => {
        let color = "geekblue";
        if (status === "co_san") color = "green";
        else if (status === "het_hang") color = "volcano";
        else if (status === "ngung_kinh_doanh") color = "grey";
        return (
          <Tag color={color}>{status?.replace("_", " ").toUpperCase()}</Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_: any, record: SanPhamAPI) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => record}>
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => record.ma_san_pham}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // ----- CẤU HÌNH CHO COMPONENT UPLOAD -----
  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // Thêm file vào state thay vì upload ngay lập tức
      setFileList([...fileList, file]);
      return false; // Ngăn chặn việc tự động upload
    },
    fileList,
    listType: "picture-card",
    multiple: true,
  };

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Quản Lý Sản Phẩm</h1>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: 16 }}
      >
        Thêm mới sản phẩm
      </Button>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="ma_san_pham"
        loading={loading} // Hiển thị loading khi đang tải dữ liệu
        scroll={{ x: 1300 }} // Cho phép cuộn ngang nếu bảng quá rộng
      />

      <Modal
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
        open={isModalVisible}
        onCancel={handleCancel}
        width={900}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            {editingProduct ? "Cập nhật" : "Thêm mới"}
          </Button>,
        ]}
        destroyOnClose={true} // Reset form khi modal đóng
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            trang_thai: "co_san",
            bienthe: [
              {
                mau_sac: "",
                kich_thuoc: "",
                gia: undefined,
                so_luong: undefined,
              },
            ],
          }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="ten_san_pham"
                label="Tên sản phẩm"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
              >
                <Input placeholder="VD: Áo thun thể thao Nike" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ma_danh_muc"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select placeholder="Chọn danh mục sản phẩm">
                  {categories.map((cat) => (
                    <Select.Option
                      key={cat.ma_danh_muc}
                      value={cat.ma_danh_muc}
                    >
                      {cat.ten_danh_muc}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="thuong_hieu"
                label="Thương hiệu"
                rules={[
                  { required: true, message: "Vui lòng nhập thương hiệu!" },
                ]}
              >
                <Input placeholder="VD: Nike" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="chat_lieu"
                label="Chất liệu"
                rules={[
                  { required: true, message: "Vui lòng nhập chất liệu!" },
                ]}
              >
                <Input placeholder="VD: Cotton" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="trang_thai"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select>
                  <Select.Option value="co_san">Có sẵn</Select.Option>
                  <Select.Option value="het_hang">Hết hàng</Select.Option>
                  <Select.Option value="ngung_kinh_doanh">
                    Ngừng kinh doanh
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="mo_ta_ngan" label="Mô tả ngắn">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về sản phẩm" />
          </Form.Item>

          <Form.Item name="mo_ta_chi_tiet" label="Mô tả chi tiết">
            <ReactQuill
              theme="snow"
              modules={quillModules}
              style={{ height: "200px", marginBottom: "50px" }}
            />
          </Form.Item>

          <Form.Item label="Hình ảnh sản phẩm">
            <Upload {...uploadProps}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <hr style={{ margin: "20px 0" }} />

          <h3>Các biến thể sản phẩm</h3>
          <Form.List name="bienthe">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "mau_sac"]}
                      rules={[{ required: true, message: "Nhập màu!" }]}
                    >
                      <Input placeholder="Màu sắc (VD: Đỏ)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "kich_thuoc"]}
                      rules={[{ required: true, message: "Nhập size!" }]}
                    >
                      <Input placeholder="Kích thước (VD: L)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "gia"]}
                      rules={[{ required: true, message: "Nhập giá!" }]}
                    >
                      <InputNumber
                        placeholder="Giá bán"
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        min={0}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "so_luong"]}
                      rules={[{ required: true, message: "Nhập SL!" }]}
                    >
                      <InputNumber placeholder="Số lượng" min={0} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm biến thể
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default QLSanPham;
