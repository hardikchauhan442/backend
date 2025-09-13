"use client";

import { Card } from "@/ui";
import { TextArea } from "@/ui/forms/Input";
import { Drawer } from "@/ui/overlay";
import {
  CheckCircleOutlined,
  EditOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Extend dayjs with custom parse format
dayjs.extend(customParseFormat);

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

// Define types
type RejectionRecord = {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  itemType: string;
  category: string;
  quantity: number;
  unit: string;
  defectType: string;
  defectSeverity: string;
  reportedBy: string;
  status: string;
  notes: string;
  resolution: string;
  resolvedBy: string;
  resolvedDate: string;
};

type FormValues = Omit<RejectionRecord, "id"> & {
  date: Dayjs;
  resolvedDate: Dayjs;
};

type DrawerMode = "add" | "edit";

interface FilterState {
  itemTypes: string[];
  categories: string[];
  defectTypes: string[];
  severities: string[];
  statuses: string[];
  reportedBy: string[];
  dateRange: [string, string] | null;
  quantityRange: [number, number] | null;
}

// Mock data for rejection records
const rejectionData: RejectionRecord[] = [
  {
    id: "REJ-2023-001",
    date: "2023-06-18",
    itemId: "PO-2023-012",
    itemName: "Diamond Ring",
    itemType: "Semi-Finished",
    category: "Rings",
    quantity: 1,
    unit: "pcs",
    defectType: "Casting Defect",
    defectSeverity: "High",
    reportedBy: "John Smith",
    status: "Pending",
    notes: "Porosity in the band",
    resolution: "",
    resolvedBy: "",
    resolvedDate: "",
  },
  {
    id: "REJ-2023-002",
    date: "2023-06-15",
    itemId: "RM-2023-045",
    itemName: "18K Gold Chain",
    itemType: "Raw Material",
    category: "Chains",
    quantity: 2,
    unit: "meters",
    defectType: "Dimensional Issue",
    defectSeverity: "Medium",
    reportedBy: "Sarah Johnson",
    status: "In Review",
    notes: "Inconsistent thickness",
    resolution: "",
    resolvedBy: "",
    resolvedDate: "",
  },
  {
    id: "REJ-2023-003",
    date: "2023-06-10",
    itemId: "FG-2023-078",
    itemName: "Pearl Earrings",
    itemType: "Finished Good",
    category: "Earrings",
    quantity: 1,
    unit: "pair",
    defectType: "Quality Issue",
    defectSeverity: "Critical",
    reportedBy: "Mike Chen",
    status: "Resolved",
    notes: "Pearl not centered properly",
    resolution: "Item reworked and passed quality check",
    resolvedBy: "Jane Doe",
    resolvedDate: "2023-06-12",
  },
  {
    id: "REJ-2023-004",
    date: "2023-06-14",
    itemId: "SF-2023-089",
    itemName: "Gold Bracelet",
    itemType: "Semi-Finished",
    category: "Bracelets",
    quantity: 1,
    unit: "pcs",
    defectType: "Surface Finish",
    defectSeverity: "Low",
    reportedBy: "Alice Brown",
    status: "Rejected",
    notes: "Surface scratches",
    resolution: "Item scrapped due to irreparable damage",
    resolvedBy: "Jane Doe",
    resolvedDate: "2023-06-15",
  },
  {
    id: "REJ-2023-005",
    date: "2023-06-16",
    itemId: "RM-2023-067",
    itemName: "Platinum Wire",
    itemType: "Raw Material",
    category: "Other",
    quantity: 5,
    unit: "meters",
    defectType: "Material Defect",
    defectSeverity: "High",
    reportedBy: "Bob Wilson",
    status: "In Review",
    notes: "Wire breaks under normal stress",
    resolution: "",
    resolvedBy: "",
    resolvedDate: "",
  },
];

const itemTypes = ["Raw Material", "Semi-Finished", "Finished Good"];
const categories = [
  "Rings",
  "Chains",
  "Earrings",
  "Pendants",
  "Bracelets",
  "Other",
];
const defectTypes = [
  "Casting Defect",
  "Dimensional Issue",
  "Surface Finish",
  "Quality Issue",
  "Material Defect",
  "Other",
];
const severities = ["Low", "Medium", "High", "Critical"];
const statuses = ["Pending", "In Review", "Resolved", "Rejected"];
const units = ["pcs", "pairs", "meters", "kg", "g"];

const reportedByOptions = [
  "John Smith",
  "Sarah Johnson",
  "Mike Chen",
  "Alice Brown",
  "Bob Wilson",
];

const statusColors = {
  Pending: "orange",
  "In Review": "blue",
  Resolved: "green",
  Rejected: "red",
};

const severityColors = {
  Low: "green",
  Medium: "lime",
  High: "orange",
  Critical: "red",
};

export default function RejectionsPage() {
  const router = useRouter();

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [currentRecord, setCurrentRecord] = useState<RejectionRecord | null>(
    null
  );
  const [form] = Form.useForm();
  const { message } = App.useApp() || { message: {} as any };
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    itemTypes: [],
    categories: [],
    defectTypes: [],
    severities: [],
    statuses: [],
    reportedBy: [],
    dateRange: null,
    quantityRange: null,
  });

  // Filter data based on search, active tab, and filters
  const filteredData = rejectionData.filter((record) => {
    const matchesSearch =
      record.id.toLowerCase().includes(searchText.toLowerCase()) ||
      record.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.itemId.toLowerCase().includes(searchText.toLowerCase()) ||
      record.reportedBy.toLowerCase().includes(searchText.toLowerCase());

    const matchesTab = activeTab === "all" || record.status === activeTab;

    const matchesItemType =
      filters.itemTypes.length === 0 ||
      filters.itemTypes.includes(record.itemType);
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(record.category);
    const matchesDefectType =
      filters.defectTypes.length === 0 ||
      filters.defectTypes.includes(record.defectType);
    const matchesSeverity =
      filters.severities.length === 0 ||
      filters.severities.includes(record.defectSeverity);
    const matchesStatus =
      filters.statuses.length === 0 || filters.statuses.includes(record.status);
    const matchesReportedBy =
      filters.reportedBy.length === 0 ||
      filters.reportedBy.includes(record.reportedBy);

    let matchesDate = true;
    if (filters.dateRange) {
      const recordDate = new Date(record.date);
      const startDate = new Date(filters.dateRange[0]);
      const endDate = new Date(filters.dateRange[1]);
      matchesDate = recordDate >= startDate && recordDate <= endDate;
    }

    const matchesQuantity =
      !filters.quantityRange ||
      (record.quantity >= filters.quantityRange[0] &&
        record.quantity <= filters.quantityRange[1]);

    return (
      matchesSearch &&
      matchesTab &&
      matchesItemType &&
      matchesCategory &&
      matchesDefectType &&
      matchesSeverity &&
      matchesStatus &&
      matchesReportedBy &&
      matchesDate &&
      matchesQuantity
    );
  });

  const handleAddNew = () => {
    setDrawerMode("add");
    setCurrentRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: "Pending",
      unit: "pcs",
      date: dayjs(),
      defectSeverity: "Medium",
      reportedBy: "Current User", // In real app, get from auth context
    });
    setIsDrawerVisible(true);
  };

  const handleEdit = (record: RejectionRecord) => {
    if (!record) return;

    setDrawerMode("edit");
    setCurrentRecord(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : null,
      resolvedDate: record.resolvedDate ? dayjs(record.resolvedDate) : null,
    });
    setIsDrawerVisible(true);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const action = currentRecord ? "updated" : "added";
      console.log("Form submitted with values:", values);

      await new Promise((resolve) => setTimeout(resolve, 500));

      message.success(`Rejection record ${action} successfully`);
      setIsDrawerVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save rejection record");
    }
  };

  const handleResolve = (record: RejectionRecord) => {
    setDrawerMode("edit");
    setCurrentRecord(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      status: "Resolved",
      resolvedBy: "Current User", // In real app, get from auth context
      resolvedDate: dayjs(new Date()),
      date: record.date ? dayjs(record.date) : null,
    });
    setIsDrawerVisible(true);
  };

  const clearFilters = () => {
    setFilters({
      itemTypes: [],
      categories: [],
      defectTypes: [],
      severities: [],
      statuses: [],
      reportedBy: [],
      dateRange: null,
      quantityRange: null,
    });
  };

  const getDrawerTitle = () => {
    return drawerMode === "add"
      ? "New Rejection Record"
      : "Edit Rejection Record";
  };

  const exportToPDF = () => {
    message.info("PDF export functionality will be implemented");
  };

  const exportToExcel = () => {
    message.info("Excel export functionality will be implemented");
  };

  const columns: any = [
    {
      title: "Rejection ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => (
        <a
          onClick={() =>
            handleEdit(
              rejectionData.find((r) => r.id === text) as RejectionRecord
            )
          }
        >
          {text}
        </a>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: RejectionRecord, b: RejectionRecord) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Item",
      key: "item",
      render: (record: RejectionRecord) => (
        <div>
          <div className="font-medium">{record.itemName}</div>
          <div className="text-xs text-gray-500">
            {record.itemType} • {record.itemId}
          </div>
        </div>
      ),
    },
    {
      title: "Defect",
      key: "defect",
      render: (record: RejectionRecord) => (
        <div>
          <div>{record.defectType}</div>
          <Tag
            color={
              severityColors[
                record.defectSeverity as keyof typeof severityColors
              ]
            }
            className="mt-1"
          >
            {record.defectSeverity}
          </Tag>
        </div>
      ),
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (record: RejectionRecord) => `${record.quantity} ${record.unit}`,
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
      onFilter: (value: string, record: RejectionRecord) =>
        record.status === value,
    },
    {
      title: "Reported By",
      dataIndex: "reportedBy",
      key: "reportedBy",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: RejectionRecord) => (
        <Space>
          <Tooltip title="View/Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
            />
          </Tooltip>
          {record.status !== "Resolved" && record.status !== "Rejected" && (
            <Tooltip title="Mark as Resolved">
              <Button
                type="text"
                icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleResolve(record);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Calculate rejection statistics
  const rejectionStats = {
    total: rejectionData.length,
    byStatus: rejectionData.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySeverity: rejectionData.reduce((acc, curr) => {
      acc[curr.defectSeverity] = (acc[curr.defectSeverity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="mb-0">
          Quality Rejections
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          New Rejection
        </Button>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6" wrap={false}>
        <Col flex="1">
          <Card>
            <div className="text-2xl font-semibold">{rejectionStats.total}</div>
            <div className="text-gray-500">Total Rejections</div>
          </Card>
        </Col>

        {Object.entries(rejectionStats.byStatus).map(([status, count]) => (
          <Col flex="1" key={status}>
            <Card>
              <div className="text-2xl font-semibold">{count}</div>
              <div className="text-gray-500">
                <Tag color={statusColors[status as keyof typeof statusColors]}>
                  {status}
                </Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Search
              placeholder="Search by ID, item, reference, or reporter..."
              allowClear
              enterButton={
                <Button type="primary">
                  <SearchOutlined />
                </Button>
              }
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button icon={<FilePdfOutlined />} onClick={exportToPDF}>
              PDF
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
              Excel
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setIsFilterDrawerVisible(true)}
            >
              Filters
              {(filters.itemTypes.length +
                filters.categories.length +
                filters.defectTypes.length +
                filters.severities.length +
                filters.statuses.length +
                filters.reportedBy.length >
                0 ||
                filters.dateRange ||
                filters.quantityRange) && (
                <span className="ml-1 bg-red-500 text-white rounded-full w-2 h-2 inline-block"></span>
              )}
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "all", label: `All Rejections (${rejectionData.length})` },
            ...statuses.map((status) => ({
              key: status,
              label: (
                <span>
                  <Tag
                    color={statusColors[status as keyof typeof statusColors]}
                    style={{ marginRight: 8 }}
                  />
                  {status} ({rejectionStats.byStatus[status] || 0})
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
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} rejections`,
          }}
          scroll={{ x: true }}
          className="mt-4"
        />
      </Card>

      {/* Add/Edit Rejection Drawer */}
      <Drawer
        title={getDrawerTitle()}
        width={800}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {drawerMode === "add" ? "Save" : "Update"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Rejection Date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="itemName"
                label="Item Name"
                rules={[{ required: true, message: "Please enter item name" }]}
              >
                <Input placeholder="Enter item name" />
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
                <Input placeholder="Enter item reference" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                name="defectType"
                label="Defect Type"
                rules={[
                  { required: true, message: "Please select defect type" },
                ]}
              >
                <Select placeholder="Select defect type">
                  {defectTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
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
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: "Please select unit" }]}
              >
                <Select>
                  {units.map((unit) => (
                    <Option key={unit} value={unit}>
                      {unit}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="defectSeverity"
                label="Severity"
                rules={[{ required: true, message: "Please select severity" }]}
              >
                <Select>
                  {severities.map((severity) => (
                    <Option key={severity} value={severity}>
                      <Tag
                        color={
                          severityColors[
                            severity as keyof typeof severityColors
                          ]
                        }
                      >
                        {severity}
                      </Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reportedBy"
                label="Reported By"
                rules={[{ required: true, message: "Please select reporter" }]}
              >
                <Select placeholder="Select reporter">
                  {reportedByOptions.map((person) => (
                    <Option key={person} value={person}>
                      {person}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
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

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Add notes about the rejection..." />
          </Form.Item>

          {/* Conditional Resolution Fields */}
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.status !== curValues.status
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("status") === "Resolved" ||
              getFieldValue("status") === "Rejected" ? (
                <>
                  <Divider orientation="left">Resolution Details</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="resolvedBy"
                        label="Resolved By"
                        rules={[
                          {
                            required: true,
                            message: "Please enter resolver name",
                          },
                        ]}
                      >
                        <Input placeholder="Enter resolver name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="resolvedDate"
                        label="Resolution Date"
                        rules={[
                          {
                            required: true,
                            message: "Please select resolution date",
                          },
                        ]}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          format="YYYY-MM-DD"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="resolution"
                    label="Resolution Details"
                    rules={[
                      {
                        required: true,
                        message: "Please enter resolution details",
                      },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Describe how the issue was resolved..."
                    />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </Form>
      </Drawer>

      {/* Filter Drawer */}
      <Drawer
        title="Filters"
        width={400}
        onClose={() => setIsFilterDrawerVisible(false)}
        open={isFilterDrawerVisible}
        footer={
          <div className="flex justify-between">
            <Button onClick={clearFilters}>Clear All</Button>
            <div className="flex gap-2">
              <Button onClick={() => setIsFilterDrawerVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => setIsFilterDrawerVisible(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Item Types</label>
            <Select
              mode="multiple"
              placeholder="Select item types"
              value={filters.itemTypes}
              onChange={(value) => setFilters({ ...filters, itemTypes: value })}
              style={{ width: "100%" }}
            >
              {itemTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <Select
              mode="multiple"
              placeholder="Select categories"
              value={filters.categories}
              onChange={(value) =>
                setFilters({ ...filters, categories: value })
              }
              style={{ width: "100%" }}
            >
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Defect Types
            </label>
            <Select
              mode="multiple"
              placeholder="Select defect types"
              value={filters.defectTypes}
              onChange={(value) =>
                setFilters({ ...filters, defectTypes: value })
              }
              style={{ width: "100%" }}
            >
              {defectTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Severities</label>
            <Select
              mode="multiple"
              placeholder="Select severities"
              value={filters.severities}
              onChange={(value) =>
                setFilters({ ...filters, severities: value })
              }
              style={{ width: "100%" }}
            >
              {severities.map((severity) => (
                <Option key={severity} value={severity}>
                  <Tag
                    color={
                      severityColors[severity as keyof typeof severityColors]
                    }
                  >
                    {severity}
                  </Tag>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              mode="multiple"
              placeholder="Select status"
              value={filters.statuses}
              onChange={(value) => setFilters({ ...filters, statuses: value })}
              style={{ width: "100%" }}
            >
              {statuses.map((status) => (
                <Option key={status} value={status}>
                  <Tag
                    color={statusColors[status as keyof typeof statusColors]}
                  >
                    {status}
                  </Tag>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Reported By
            </label>
            <Select
              mode="multiple"
              placeholder="Select reporters"
              value={filters.reportedBy}
              onChange={(value) =>
                setFilters({ ...filters, reportedBy: value })
              }
              style={{ width: "100%" }}
            >
              {reportedByOptions.map((person) => (
                <Option key={person} value={person}>
                  {person}
                </Option>
              ))}
            </Select>
          </div>

          <Divider />

          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates, dateStrings) =>
                setFilters({
                  ...filters,
                  dateRange:
                    dateStrings[0] && dateStrings[1]
                      ? [dateStrings[0], dateStrings[1]]
                      : null,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Quantity Range
            </label>
            <div className="flex gap-2">
              <InputNumber
                placeholder="Min"
                value={filters.quantityRange?.[0]}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    quantityRange: [
                      value || 0,
                      filters.quantityRange?.[1] || 100,
                    ],
                  })
                }
                style={{ width: "100%" }}
              />
              <InputNumber
                placeholder="Max"
                value={filters.quantityRange?.[1]}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    quantityRange: [
                      filters.quantityRange?.[0] || 0,
                      value || 100,
                    ],
                  })
                }
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <Divider />

          {/* Filter Summary */}
          <div>
            <Title level={5}>Active Filters</Title>
            <div className="space-y-2">
              {filters.itemTypes.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Item Types: </span>
                  {filters.itemTypes.map((type) => (
                    <Tag key={type} className="mr-1">
                      {type}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.categories.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Categories: </span>
                  {filters.categories.map((cat) => (
                    <Tag key={cat} className="mr-1">
                      {cat}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.defectTypes.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Defect Types: </span>
                  {filters.defectTypes.map((type) => (
                    <Tag key={type} className="mr-1">
                      {type}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.severities.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Severities: </span>
                  {filters.severities.map((severity) => (
                    <Tag
                      key={severity}
                      className="mr-1"
                      color={
                        severityColors[severity as keyof typeof severityColors]
                      }
                    >
                      {severity}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.statuses.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Status: </span>
                  {filters.statuses.map((status) => (
                    <Tag
                      key={status}
                      className="mr-1"
                      color={statusColors[status as keyof typeof statusColors]}
                    >
                      {status}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.reportedBy.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Reported By: </span>
                  {filters.reportedBy.map((person) => (
                    <Tag key={person} className="mr-1">
                      {person}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.dateRange && (
                <div>
                  <span className="text-xs text-gray-500">Date Range: </span>
                  <Tag>
                    {filters.dateRange[0]} to {filters.dateRange[1]}
                  </Tag>
                </div>
              )}
              {filters.quantityRange && (
                <div>
                  <span className="text-xs text-gray-500">Quantity: </span>
                  <Tag>
                    {filters.quantityRange[0]} - {filters.quantityRange[1]}
                  </Tag>
                </div>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
