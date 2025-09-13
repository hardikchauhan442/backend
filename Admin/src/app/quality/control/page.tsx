"use client";

import {
  EditOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;
const { Step } = Steps;

// Mock data for quality control checks
const qcChecks = [
  {
    id: "QC-2023-001",
    date: "2023-06-20",
    itemId: "PO-2023-012",
    itemName: "Diamond Ring",
    itemType: "Semi-Finished",
    category: "Rings",
    quantity: 1,
    status: "Passed",
    inspector: "John Smith",
    notes: "All quality parameters met",
    checks: [
      {
        name: "Weight Verification",
        status: "Passed",
        notes: "4.2g as specified",
      },
      { name: "Stone Setting", status: "Passed", notes: "All stones secure" },
      { name: "Finishing", status: "Passed", notes: "Smooth finish" },
      { name: "Engraving", status: "Passed", notes: "Clear and centered" },
    ],
  },
  {
    id: "QC-2023-002",
    date: "2023-06-18",
    itemId: "FG-2023-045",
    itemName: "Gold Chain",
    itemType: "Finished Good",
    category: "Necklaces",
    quantity: 1,
    status: "Failed",
    inspector: "Sarah Johnson",
    notes: "Chain link alignment issue",
    checks: [
      {
        name: "Weight Verification",
        status: "Passed",
        notes: "8.5g as specified",
      },
      {
        name: "Link Alignment",
        status: "Failed",
        notes: "Misaligned links at 3 points",
      },
      { name: "Clasp Function", status: "Passed", notes: "Working properly" },
      { name: "Finishing", status: "Passed", notes: "Good polish" },
    ],
  },
  {
    id: "QC-2023-003",
    date: "2023-06-15",
    itemId: "RM-2023-078",
    itemName: "18K Gold Sheet",
    itemType: "Raw Material",
    category: "Sheets",
    quantity: 5,
    status: "In Progress",
    inspector: "Mike Chen",
    notes: "Pending final review",
    checks: [
      { name: "Purity Test", status: "Passed", notes: "18K confirmed" },
      { name: "Thickness Check", status: "Pending", notes: "" },
      { name: "Surface Quality", status: "Pending", notes: "" },
    ],
  },
];

const itemTypes = ["Raw Material", "Semi-Finished", "Finished Good"];
const categories = [
  "Rings",
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Sheets",
  "Wires",
  "Other",
];
const statuses = ["In Progress", "Passed", "Failed", "On Hold"];
const checkStatuses = ["Pending", "Passed", "Failed"];

const statusColors = {
  "In Progress": "blue",
  Passed: "green",
  Failed: "red",
  "On Hold": "orange",
};

const checkStatusColors = {
  Pending: "default",
  Passed: "success",
  Failed: "error",
};

export default function QualityControlPage() {
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCheck, setCurrentCheck] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");

  // Filter data based on search and active tab
  const filteredData = qcChecks.filter((check) => {
    const matchesSearch =
      check.id.toLowerCase().includes(searchText.toLowerCase()) ||
      check.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
      check.itemId.toLowerCase().includes(searchText.toLowerCase());

    const matchesTab = activeTab === "all" || check.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleAddNew = () => {
    setCurrentCheck(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (check: any) => {
    setCurrentCheck(check);
    form.setFieldsValue({
      ...check,
      date: check.date ? new Date(check.date) : null,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    // In a real app, this would be an API call
    const action = currentCheck ? "updated" : "added";
    message.success(`Quality check ${action} successfully`);
    setIsModalVisible(false);
  };

  const calculateProgress = (checks: any[]) => {
    if (!checks?.length) return 0;
    const completed = checks.filter((c) => c.status !== "Pending").length;
    return Math.round((completed / checks.length) * 100);
  };

  const columns = [
    {
      title: "QC ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => (
        <a onClick={() => handleEdit(qcChecks.find((qc) => qc.id === text))}>
          {text}
        </a>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Item",
      key: "item",
      render: (record: any) => (
        <div>
          <div className="font-medium">{record.itemName}</div>
          <div className="text-xs text-gray-500">
            {record.itemType} • {record.itemId}
          </div>
        </div>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: any) => {
        const progress = calculateProgress(record.checks || []);
        return (
          <div>
            <div className="text-right text-sm mb-1">{progress}%</div>
            <Progress
              percent={progress}
              size="small"
              status={record.status === "Failed" ? "exception" : "active"}
            />
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>
          {status}
        </Tag>
      ),
      filters: statuses.map((status) => ({ text: status, value: status })),
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Inspector",
      dataIndex: "inspector",
      key: "inspector",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate QC statistics
  const qcStats = {
    total: qcChecks.length,
    passed: qcChecks.filter((c) => c.status === "Passed").length,
    failed: qcChecks.filter((c) => c.status === "Failed").length,
    inProgress: qcChecks.filter((c) => c.status === "In Progress").length,
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="mb-0">
          Quality Control
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          New QC Check
        </Button>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-2xl font-semibold">{qcStats.total}</div>
            <div className="text-gray-500">Total Checks</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-2xl font-semibold text-green-500">
              {qcStats.passed}
            </div>
            <div className="text-gray-500">Passed</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-2xl font-semibold text-red-500">
              {qcStats.failed}
            </div>
            <div className="text-gray-500">Failed</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-2xl font-semibold text-blue-500">
              {qcStats.inProgress}
            </div>
            <div className="text-gray-500">In Progress</div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Search
              placeholder="Search by ID, item, or reference..."
              allowClear
              enterButton={
                <Button type="primary">
                  <SearchOutlined />
                </Button>
              }
              onSearch={setSearchText}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button icon={<FilePdfOutlined />}>PDF</Button>
            <Button icon={<FileExcelOutlined />}>Excel</Button>
            <Button icon={<FilterOutlined />}>Filters</Button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "all", label: `All Checks (${qcChecks.length})` },
            ...statuses.map((status) => ({
              key: status,
              label: (
                <span>
                  <Tag
                    color={statusColors[status as keyof typeof statusColors]}
                    style={{ marginRight: 8 }}
                  />
                  {status} ({qcChecks.filter((c) => c.status === status).length}
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
              `${range[0]}-${range[1]} of ${total} checks`,
          }}
          scroll={{ x: true }}
          className="mt-4"
          onRow={(record) => ({
            onClick: () => handleEdit(record),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={`${currentCheck ? "Edit" : "New"} Quality Check`}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => form.submit()}>
            {currentCheck ? "Update" : "Create"} Check
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            date: new Date(),
            status: "In Progress",
            inspector: "Current User", // In real app, get from auth context
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Check Date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select>
                  {statuses.map((status) => (
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
          </Row>

          <Divider>Item Details</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="itemType"
                label="Item Type"
                rules={[{ required: true, message: "Please select item type" }]}
              >
                <Select placeholder="Select item type">
                  {itemTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="itemId"
                label="Item ID/Reference"
                rules={[
                  { required: true, message: "Please enter item reference" },
                ]}
              >
                <Input placeholder="e.g., PO-2023-012, RM-123" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="itemName"
                label="Item Name/Description"
                rules={[{ required: true, message: "Please enter item name" }]}
              >
                <Input placeholder="e.g., Diamond Ring, 18K Gold Sheet" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select placeholder="Select category">
                  {categories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="inspector"
                label="Inspector"
                rules={[
                  { required: true, message: "Please enter inspector name" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Quality Checks</Divider>

          <Form.List name="checks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="mb-4 p-4 border rounded">
                    <Row gutter={16}>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Check Name"
                          rules={[
                            {
                              required: true,
                              message: "Check name is required",
                            },
                          ]}
                        >
                          <Input placeholder="e.g., Weight Check, Purity Test" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "status"]}
                          label="Status"
                          initialValue="Pending"
                        >
                          <Select>
                            {checkStatuses.map((status) => (
                              <Option key={status} value={status}>
                                <Tag
                                  color={
                                    checkStatusColors[
                                      status as keyof typeof checkStatusColors
                                    ]
                                  }
                                >
                                  {status}
                                </Tag>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6} className="flex items-end">
                        <Button
                          type="text"
                          danger
                          onClick={() => remove(name)}
                          className="mb-4"
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, "notes"]}
                      label="Notes"
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Add notes about this check..."
                      />
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add({ status: "Pending" })}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Check
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="General Notes">
            <Input.TextArea
              rows={3}
              placeholder="Add any general notes about this quality check..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
