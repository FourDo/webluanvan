import { useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { ColumnsType } from "antd/es/table";

// ----- ĐỊNH NGHĨA CÁC TYPE CHO DỮ LIỆU (QUAN TRỌNG VỚI TYPESCRIPT) -----

interface BienThe {
  mau_sac: string;
  kich_thuoc: string;
  gia: number;
  so_luong: number;
}

interface Product {
  id: number; // Thêm ID để định danh duy nhất cho mỗi sản phẩm
  ma_danh_muc: number;
  ten_san_pham: string;
  thuong_hieu: string;
  mo_ta_ngan: string;
  mo_ta_chi_tiet: string;
  trang_thai: "co_san" | "het_hang" | "ngung_kinh_doanh";
  chat_lieu: string;
  bienthe: BienThe[];
  hinh_anh?: UploadFile[]; // Dùng cho việc hiển thị và quản lý file upload
}

// ----- DỮ LIỆU GIẢ (MOCK DATA) ĐỂ HIỂN THỊ -----
// Trong thực tế, bạn sẽ fetch dữ liệu này từ API
const mockProducts: Product[] = [
  {
    id: 1,
    ma_danh_muc: 1,
    ten_san_pham: "Áo thun thể thao Nike Dri-FIT",
    thuong_hieu: "Nike",
    mo_ta_ngan: "Chất liệu cotton thoáng mát, thấm hút mồ hôi.",
    mo_ta_chi_tiet:
      "Chi tiết: Áo thun thể thao chính hãng Nike, chất vải thoáng khí, co giãn tốt, phù hợp cho mọi hoạt động thể chất.",
    trang_thai: "co_san",
    chat_lieu: "Cotton",
    bienthe: [
      { mau_sac: "Đen", kich_thuoc: "L", gia: 350000, so_luong: 10 },
      { mau_sac: "Trắng", kich_thuoc: "M", gia: 350000, so_luong: 20 },
    ],
  },
  {
    id: 2,
    ma_danh_muc: 2,
    ten_san_pham: "Quần Jeans Levi's 501",
    thuong_hieu: "Levi's",
    mo_ta_ngan: "Kiểu dáng classic, bền bỉ theo thời gian.",
    mo_ta_chi_tiet:
      "Quần Jeans Levi's 501 Original Fit, chất liệu denim cao cấp, không co giãn, form đứng.",
    trang_thai: "co_san",
    chat_lieu: "Denim",
    bienthe: [
      { mau_sac: "Xanh đậm", kich_thuoc: "32", gia: 1250000, so_luong: 5 },
    ],
  },
];

// Dữ liệu giả cho danh mục và các lựa chọn khác
const mockCategories = [
  { id: 1, name: "Áo thể thao" },
  { id: 2, name: "Quần Jeans" },
  { id: 3, name: "Giày Sneaker" },
];

const QLSanPham = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form] = Form.useForm();

  // ----- CÁC HÀM XỬ LÝ CRUD -----

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields(); // Reset form trước khi mở modal thêm mới
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // setFieldsValue sẽ điền dữ liệu vào form
    form.setFieldsValue({
      ...product,
      // Antd Upload component cần một cấu trúc file đặc biệt
      hinh_anh: product.hinh_anh || [],
    });
    setIsModalVisible(true);
  };

  const handleDelete = (productId: number) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa sản phẩm này?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setProducts(products.filter((p) => p.id !== productId));
        message.success("Xóa sản phẩm thành công!");
      },
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  // Hàm được gọi khi submit form (cả Thêm mới và Cập nhật)
  const onFinish = (values: any) => {
    // Xử lý dữ liệu hình ảnh trước khi lưu
    // `values.hinh_anh.fileList` chứa danh sách các file đã upload
    const finalValues = {
      ...values,
      hinh_anh: values.hinh_anh?.fileList || [],
    };

    if (editingProduct) {
      // Chế độ Cập nhật
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...finalValues, id: p.id } : p
        )
      );
      message.success("Cập nhật sản phẩm thành công!");
    } else {
      // Chế độ Thêm mới
      const newProduct = {
        ...finalValues,
        id: Date.now(), // Tạo ID tạm thời, trong thực tế sẽ do backend trả về
      };
      setProducts([newProduct, ...products]);
      message.success("Thêm sản phẩm thành công!");
    }
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  // ----- ĐỊNH NGHĨA CÁC CỘT CHO BẢNG -----

  const columns: ColumnsType<Product> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "ten_san_pham",
      key: "ten_san_pham",
    },
    {
      title: "Thương hiệu",
      dataIndex: "thuong_hieu",
      key: "thuong_hieu",
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status: string) => {
        let color = "geekblue";
        let text = status.toUpperCase();
        if (status === "co_san") {
          color = "green";
          text = "CÓ SẴN";
        } else if (status === "het_hang") {
          color = "volcano";
          text = "HẾT HÀNG";
        } else if (status === "ngung_kinh_doanh") {
          color = "grey";
          text = "NGƯNG KINH DOANH";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

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

      {/* Bảng hiển thị danh sách sản phẩm */}
      <Table columns={columns} dataSource={products} rowKey="id" />

      {/* Modal cho việc Thêm/Sửa sản phẩm */}
      <Modal
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
        visible={isModalVisible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingProduct ? "Cập nhật" : "Thêm mới"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            bienthe: [{ mau_sac: "", kich_thuoc: "", gia: 0, so_luong: 0 }],
          }}
        >
          {/* ----- CÁC TRƯỜNG THÔNG TIN CƠ BẢN ----- */}
          <Form.Item
            name="ten_san_pham"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
          </Form.Item>

          <Space align="start" wrap>
            <Form.Item
              name="ma_danh_muc"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            >
              <Select style={{ width: 200 }}>
                {mockCategories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="thuong_hieu"
              label="Thương hiệu"
              rules={[
                { required: true, message: "Vui lòng nhập thương hiệu!" },
              ]}
            >
              <Input style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              name="chat_lieu"
              label="Chất liệu"
              rules={[{ required: true, message: "Vui lòng nhập chất liệu!" }]}
            >
              <Input style={{ width: 150 }} />
            </Form.Item>
            <Form.Item
              name="trang_thai"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select style={{ width: 200 }}>
                <Select.Option value="co_san">Có sẵn</Select.Option>
                <Select.Option value="het_hang">Hết hàng</Select.Option>
                <Select.Option value="ngung_kinh_doanh">
                  Ngừng kinh doanh
                </Select.Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item name="mo_ta_ngan" label="Mô tả ngắn">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="mo_ta_chi_tiet" label="Mô tả chi tiết">
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* ----- PHẦN UPLOAD HÌNH ẢNH ----- */}
          <Form.Item
            name="hinh_anh"
            label="Hình ảnh sản phẩm (có thể chọn nhiều ảnh)"
            valuePropName="fileList"
            // `getValueFromEvent` giúp chuẩn hóa dữ liệu từ Upload component
            getValueFromEvent={(e: { fileList: any }) =>
              Array.isArray(e) ? e : e && e.fileList
            }
          >
            <Upload
              multiple
              listType="picture-card"
              beforeUpload={() => false} // Ngăn việc tự động upload
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <hr style={{ margin: "20px 0" }} />

          {/* ----- PHẦN QUẢN LÝ BIẾN THỂ (DÙNG Form.List) ----- */}
          <h3>Các biến thể sản phẩm</h3>
          <Form.List name="bienthe">
            {(
              fields: { [x: string]: any; key: any; name: any }[],
              { add, remove }: any
            ) => (
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
                      <Input placeholder="Màu sắc (VD: Đen)" />
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
                        placeholder="Giá"
                        style={{ width: "100%" }}
                        formatter={(value: any) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value: any) =>
                          value!.replace(/\$\s?|(,*)/g, "")
                        }
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
