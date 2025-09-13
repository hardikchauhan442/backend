"use client";

import { useAuth } from "@/contexts/AuthContext";

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Mock data for semi-finished goods
const semiFinishedGoodsData = [
  {
    id: "SF-001",
    name: 'Gold Chain (24K, 18")',
    type: "Chain",
    material: "24K Gold",
    weight: 15.5,
    weightUnit: "g",
    quantity: 25,
    unit: "pcs",
    status: "In Stock",
    lastUpdated: "2023-06-10",
    location: "Shelf A-12",
  },
  {
    id: "SF-002",
    name: "Diamond Setting (Princess)",
    type: "Setting",
    material: "Platinum",
    weight: 2.3,
    weightUnit: "g",
    quantity: 48,
    unit: "pcs",
    status: "In Stock",
    lastUpdated: "2023-06-08",
    location: "Shelf B-05",
  },
  {
    id: "SF-003",
    name: "Ring Band (18K, Size 7)",
    type: "Band",
    material: "18K Gold",
    weight: 8.2,
    weightUnit: "g",
    quantity: 12,
    unit: "pcs",
    status: "Low Stock",
    lastUpdated: "2023-06-05",
    location: "Shelf C-08",
  },
  {
    id: "SF-004",
    name: "Pendant Base (Heart)",
    type: "Pendant",
    material: "Sterling Silver",
    weight: 5.7,
    weightUnit: "g",
    quantity: 32,
    unit: "pcs",
    status: "In Stock",
    lastUpdated: "2023-06-12",
    location: "Shelf A-15",
  },
  {
    id: "SF-005",
    name: "Earring Backs (Screw)",
    type: "Finding",
    material: "Surgical Steel",
    weight: 0.5,
    weightUnit: "g",
    quantity: 5,
    unit: "pairs",
    status: "Out of Stock",
    lastUpdated: "2023-06-15",
    location: "Shelf D-03",
  },
];

const semiFinishedTypes = [
  "Chain",
  "Setting",
  "Band",
  "Pendant",
  "Finding",
  "Bail",
  "Clasp",
  "Earwire",
  "Other",
];
const statusColors = {
  "In Stock": "green",
  "Low Stock": "orange",
  "Out of Stock": "red",
  "On Order": "blue",
  "In Production": "purple",
};

export default function SemiFinishedGoodsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<any>({});

  // Filter data based on search and filters
  const filteredData = semiFinishedGoodsData.filter((item: any) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.id.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key] === value;
    });

    const matchesTab = activeTab === "all" || item.status === activeTab;

    return matchesSearch && matchesFilters && matchesTab;
  });

  const handleAddNew = () => {
    setCurrentItem(null);
    form.resetFields();
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setCurrentItem(record);
    form.setFieldsValue({
      ...record,
      weight: record.weight.toString(),
      quantity: record.quantity.toString(),
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // In a real app, this would be an API call
    message.success(`Item ${id} deleted successfully`);
  };

  const handleSubmit = (values: any) => {
    // In a real app, this would be an API call
    const action = currentItem ? "updated" : "added";
    message.success(`Item ${action} successfully`);
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: any, b: any) => a.id.localeCompare(b.id),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">
            {record.material} • {record.weight}
            {record.weightUnit}
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: semiFinishedGoodsData
        .map((item) => item.type)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((type) => ({ text: type, value: type })),
      onFilter: (value: any, record: any) => record.type === value,
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (record: any) => (
        <div>
          <div className="font-medium">
            {record.quantity} {record.unit}
          </div>
          <div className="text-xs text-gray-500">
            {record.weight * record.quantity}
            {record.weightUnit} total
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.quantity - b.quantity,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={statusColors[status as keyof typeof statusColors] || "default"}
        >
          {status}
        </Tag>
      ),
      filters: [
        { text: "In Stock", value: "In Stock" },
        { text: "Low Stock", value: "Low Stock" },
        { text: "Out of Stock", value: "Out of Stock" },
        { text: "On Order", value: "On Order" },
        { text: "In Production", value: "In Production" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      sorter: (a: any, b: any) =>
        new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(`/inventory/semi-finished-goods/${record.id}`)
              }
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${record.name}?`
                  )
                ) {
                  handleDelete(record.id);
                }
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="mb-0">
            Semi-Finished Goods
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Add New
          </Button>
        </div>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Search
                placeholder="Search by name or ID..."
                allowClear
                enterButton={
                  <Button type="primary">
                    <SearchOutlined />
                  </Button>
                }
                onSearch={(value) => setSearchText(value)}
                className="w-full"
              />
            </div>
            <div>
              <Button icon={<FilterOutlined />}>More Filters</Button>
            </div>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "all",
                label: `All Items (${semiFinishedGoodsData.length})`,
              },
              ...Object.entries(statusColors).map(([status, color]) => ({
                key: status,
                label: (
                  <span>
                    <Tag color={color} style={{ marginRight: 8 }} />
                    {status} (
                    {
                      semiFinishedGoodsData.filter(
                        (item) => item.status === status
                      ).length
                    }
                    )
                  </span>
                ),
              })),
            ]}
          />

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: true }}
          />
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={`${currentItem ? "Edit" : "Add New"} Semi-Finished Good`}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: "Other",
            status: "In Stock",
            weightUnit: "g",
            unit: "pcs",
            quantity: 1,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Item Name"
                rules={[{ required: true, message: "Please enter item name" }]}
              >
                <Input placeholder={`e.g., Gold Chain (24K, 18\")`} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Item Type"
                rules={[{ required: true, message: "Please select item type" }]}
              >
                <Select placeholder="Select item type">
                  {semiFinishedTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="material"
                label="Material"
                rules={[{ required: true, message: "Please enter material" }]}
              >
                <Input placeholder="e.g., 24K Gold, Platinum, etc." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="weight"
                label="Weight"
                rules={[{ required: true, message: "Please enter weight" }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  addonAfter={
                    <Form.Item name="weightUnit" noStyle>
                      <Select style={{ width: 70 }}>
                        <Option value="g">g</Option>
                        <Option value="kg">kg</Option>
                        <Option value="oz">oz</Option>
                        <Option value="ct">ct</Option>
                      </Select>
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter={
                    <Form.Item name="unit" noStyle>
                      <Select style={{ width: 80 }}>
                        <Option value="pcs">pcs</Option>
                        <Option value="pairs">pairs</Option>
                        <Option value="sets">sets</Option>
                        <Option value="meters">meters</Option>
                      </Select>
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.keys(statusColors).map((status) => (
                    <Option key={status} value={status}>
                      <Tag
                        color={
                          statusColors[status as keyof typeof statusColors]
                        }
                      >
                        {status}
                      </Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input placeholder="e.g., Shelf A-12" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea
              rows={3}
              placeholder="Any additional notes about this item"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
