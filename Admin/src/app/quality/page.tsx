"use client";

import { Card } from "@/ui";
import { Table } from "@/ui/data-display";
import { TextArea } from "@/ui/forms/Input";
import { Drawer } from "@/ui/overlay";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App,
  Badge,
  Button,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Dropdown,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

type DrawerMode = "add" | "edit" | "view";

interface QualityCheck {
  id: string;
  product: string;
  productId?: string;
  batch: string;
  status: "passed" | "failed" | "pending" | "in-progress";
  checkedBy: string;
  checkedAt: string;
  notes: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  defectType?: string;
  testResults?: {
    dimensional: boolean;
    visual: boolean;
    functional: boolean;
    material: boolean;
  };
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  statuses: string[];
  priorities: string[];
  categories: string[];
  checkedBy: string[];
  dateRange: [string, string] | null;
}

// Enhanced mock data for quality checks
const qualityChecks: QualityCheck[] = [
  {
    id: "QC-2023-001",
    product: "Diamond Ring 18K",
    productId: "FG-001",
    batch: "B-2023-045",
    status: "passed",
    checkedBy: "John Doe",
    checkedAt: "2023-06-20T14:30:00",
    notes:
      "All quality parameters within acceptable limits. Excellent craftsmanship.",
    priority: "high",
    category: "Finished Product",
    testResults: {
      dimensional: true,
      visual: true,
      functional: true,
      material: true,
    },
    createdAt: "2023-06-20T09:00:00",
    updatedAt: "2023-06-20T14:30:00",
  },
  {
    id: "QC-2023-002",
    product: "Gold Chain 22K",
    productId: "FG-002",
    batch: "B-2023-046",
    status: "failed",
    checkedBy: "Jane Smith",
    checkedAt: "2023-06-19T11:15:00",
    notes: "Surface finish not meeting standards. Visible scratches on links.",
    priority: "medium",
    category: "Finished Product",
    defectType: "Surface Finish",
    testResults: {
      dimensional: true,
      visual: false,
      functional: true,
      material: true,
    },
    resolution: "Returned for re-polishing and quality check",
    createdAt: "2023-06-19T08:30:00",
    updatedAt: "2023-06-19T11:15:00",
  },
  {
    id: "QC-2023-003",
    product: "Silver Pendant",
    productId: "FG-003",
    batch: "B-2023-047",
    status: "pending",
    checkedBy: "",
    checkedAt: "",
    notes: "Awaiting inspection by quality control team",
    priority: "low",
    category: "Finished Product",
    createdAt: "2023-06-21T10:00:00",
    updatedAt: "2023-06-21T10:00:00",
  },
  {
    id: "QC-2023-004",
    product: "Platinum Wedding Band",
    productId: "FG-004",
    batch: "B-2023-048",
    status: "in-progress",
    checkedBy: "Mike Johnson",
    checkedAt: "2023-06-21T16:20:00",
    notes:
      "Currently undergoing comprehensive testing. Initial visual inspection passed.",
    priority: "high",
    category: "Finished Product",
    testResults: {
      dimensional: true,
      visual: true,
      functional: false,
      material: false,
    },
    createdAt: "2023-06-21T14:00:00",
    updatedAt: "2023-06-21T16:20:00",
  },
  {
    id: "QC-2023-005",
    product: "Pearl Earrings",
    productId: "FG-005",
    batch: "B-2023-049",
    status: "passed",
    checkedBy: "Sarah Wilson",
    checkedAt: "2023-06-18T13:45:00",
    notes: "Excellent quality pearls with perfect matching. All tests passed.",
    priority: "medium",
    category: "Finished Product",
    testResults: {
      dimensional: true,
      visual: true,
      functional: true,
      material: true,
    },
    createdAt: "2023-06-18T09:15:00",
    updatedAt: "2023-06-18T13:45:00",
  },
];

const qualityStatuses = [
  {
    value: "pending",
    label: "Pending",
    color: "processing",
    icon: <ClockCircleOutlined />,
  },
  {
    value: "in-progress",
    label: "In Progress",
    color: "warning",
    icon: <ClockCircleOutlined />,
  },
  {
    value: "passed",
    label: "Passed",
    color: "success",
    icon: <CheckCircleOutlined />,
  },
  {
    value: "failed",
    label: "Failed",
    color: "error",
    icon: <CloseCircleOutlined />,
  },
];

const priorities = [
  { value: "low", label: "Low", color: "green" },
  { value: "medium", label: "Medium", color: "orange" },
  { value: "high", label: "High", color: "red" },
  { value: "critical", label: "Critical", color: "magenta" },
];

const categories = [
  "Raw Material",
  "Semi-Finished",
  "Finished Product",
  "Packaging",
  "Tools & Equipment",
];

const defectTypes = [
  "Surface Finish",
  "Dimensional Issue",
  "Material Defect",
  "Assembly Issue",
  "Functional Problem",
  "Aesthetic Issue",
  "Other",
];

const inspectors = [
  "John Doe",
  "Jane Smith",
  "Mike Johnson",
  "Sarah Wilson",
  "David Brown",
];

const QualityPage = () => {
  const { message } = App.useApp?.() || { message: {} as any };

  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [currentCheck, setCurrentCheck] = useState<QualityCheck | null>(null);
  const [checks, setChecks] = useState<QualityCheck[]>(qualityChecks);
  const [filteredChecks, setFilteredChecks] =
    useState<QualityCheck[]>(qualityChecks);
  const [form] = Form.useForm();

  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    priorities: [],
    categories: [],
    checkedBy: [],
    dateRange: null,
  });

  // Update filtered checks whenever filters, search, or tab changes
  useEffect(() => {
    let filtered = checks.filter((check) => {
      const matchesTab = activeTab === "all" || check.status === activeTab;
      const matchesSearch =
        searchText === "" ||
        check.id.toLowerCase().includes(searchText.toLowerCase()) ||
        check.product.toLowerCase().includes(searchText.toLowerCase()) ||
        check.batch.toLowerCase().includes(searchText.toLowerCase()) ||
        check.checkedBy.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        filters.statuses.length === 0 ||
        filters.statuses.includes(check.status);
      const matchesPriority =
        filters.priorities.length === 0 ||
        filters.priorities.includes(check.priority);
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(check.category);
      const matchesInspector =
        filters.checkedBy.length === 0 ||
        filters.checkedBy.includes(check.checkedBy);

      let matchesDate = true;
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const checkDate = dayjs(check.createdAt);
        const startDate = dayjs(filters.dateRange[0]);
        const endDate = dayjs(filters.dateRange[1]);
        matchesDate =
          checkDate.isAfter(startDate.startOf("day")) &&
          checkDate.isBefore(endDate.endOf("day"));
      }

      return (
        matchesTab &&
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesInspector &&
        matchesDate
      );
    });

    setFilteredChecks(filtered);
  }, [checks, activeTab, searchText, filters]);

  const statusFilters = [
    { value: "all", label: "All", color: "default", count: checks.length },
    ...qualityStatuses.map((status) => ({
      ...status,
      count: checks.filter((c) => c.status === status.value).length,
    })),
  ];

  const handleNewQualityCheck = () => {
    setDrawerMode("add");
    setCurrentCheck(null);
    form.resetFields();
    form.setFieldsValue({
      status: "pending",
      priority: "medium",
      category: "Finished Product",
      checkedAt: dayjs(),
      testResults: {
        dimensional: false,
        visual: false,
        functional: false,
        material: false,
      },
    });
    setIsDrawerVisible(true);
  };

  const handleViewCheck = (check: QualityCheck) => {
    setDrawerMode("view");
    setCurrentCheck(check);
    setIsDrawerVisible(true);
  };

  // Fixed edit handler with proper prefilling
  const handleEditCheck = (check: QualityCheck) => {
    setDrawerMode("edit");
    setCurrentCheck(check);

    // Reset form completely first
    form.resetFields();

    // Wait for form to reset, then set values
    setTimeout(() => {
      form.setFieldsValue({
        product: check.product || "",
        batch: check.batch || "",
        category: check.category || "Finished Product",
        priority: check.priority || "medium",
        status: check.status || "pending",
        checkedBy: check.checkedBy || "",
        checkedAt: check.checkedAt ? dayjs(check.checkedAt) : dayjs(),
        notes: check.notes || "",
        defectType: check.defectType || undefined,
        resolution: check.resolution || "",
        testResults: {
          dimensional: check.testResults?.dimensional || false,
          visual: check.testResults?.visual || false,
          functional: check.testResults?.functional || false,
          material: check.testResults?.material || false,
        },
      });
    }, 100);

    setIsDrawerVisible(true);
  };

  const handleSubmit = (values: any) => {
    console.log("Form values:", values); // Debug log

    const checkData: QualityCheck = {
      ...values,
      id: currentCheck?.id || `QC-${Date.now()}`,
      checkedAt: values.checkedAt
        ? values.checkedAt.format("YYYY-MM-DDTHH:mm:ss")
        : "",
      createdAt: currentCheck?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (currentCheck) {
      setChecks(checks.map((c) => (c.id === currentCheck.id ? checkData : c)));
      message.success("Quality check updated successfully");
    } else {
      setChecks([checkData, ...checks]);
      message.success("Quality check created successfully");
    }

    setIsDrawerVisible(false);
    form.resetFields();
    setCurrentCheck(null);
  };

  const handleExportPDF = () => {
    message.info("Exporting quality checks to PDF...");
  };

  const handleExportExcel = () => {
    message.info("Exporting quality checks to Excel...");
  };

  // Fixed clear filters function
  const clearFilters = () => {
    setFilters({
      statuses: [],
      priorities: [],
      categories: [],
      checkedBy: [],
      dateRange: null,
    });
    setDateRange(null);
  };

  const getDrawerTitle = () => {
    switch (drawerMode) {
      case "add":
        return "New Quality Check";
      case "edit":
        return "Edit Quality Check";
      case "view":
        return "Quality Check Details";
      default:
        return "";
    }
  };

  const columns = [
    {
      title: "Check ID",
      dataIndex: "id",
      key: "id",
      render: (text: string, record: QualityCheck) => (
        <Space direction="vertical" size={0}>
          <Button
            type="link"
            onClick={() => handleViewCheck(record)}
            className="p-0 h-auto font-medium"
          >
            {text}
          </Button>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.checkedAt
              ? dayjs(record.checkedAt).format("MMM D, HH:mm")
              : "Not checked yet"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (text: string, record: QualityCheck) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Batch: {record.batch}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusInfo = qualityStatuses.find((s) => s.value === status);
        return (
          <Tag color={statusInfo?.color} icon={statusInfo?.icon}>
            {statusInfo?.label || status}
          </Tag>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => {
        const priorityInfo = priorities.find((p) => p.value === priority);
        return (
          <Tag color={priorityInfo?.color}>
            {priorityInfo?.label || priority}
          </Tag>
        );
      },
    },
    {
      title: "Checked By",
      dataIndex: "checkedBy",
      key: "checkedBy",
      render: (text: string) => text || "-",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 200 }} title={text}>
          {text}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: QualityCheck) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewCheck(record);
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEditCheck(record);
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-2">
        <Title level={4} className="mb-0">
          Quality Control
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewQualityCheck}
        >
          New Quality Check
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by ID, product, batch, or inspector..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%", maxWidth: 400 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              className="w-full md:w-auto"
            />
            <Button
              icon={<FilterOutlined />}
              onClick={() => setIsFilterDrawerVisible(true)}
            >
              Filters
              {(filters.statuses.length +
                filters.priorities.length +
                filters.categories.length +
                filters.checkedBy.length >
                0 ||
                filters.dateRange) && (
                <span className="ml-1 bg-red-500 text-white rounded-full w-2 h-2 inline-block"></span>
              )}
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "export-pdf",
                    label: "Export as PDF",
                    icon: <FilePdfOutlined />,
                    onClick: handleExportPDF,
                  },
                  {
                    key: "export-excel",
                    label: "Export as Excel",
                    icon: <FileExcelOutlined />,
                    onClick: handleExportExcel,
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Button>Export</Button>
            </Dropdown>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={statusFilters.map((filter) => ({
            key: filter.value,
            label: (
              <Badge count={filter.count} size="small" offset={[5, 0]}>
                <span style={{ marginRight: 8 }}>{filter.label}</span>
              </Badge>
            ),
          }))}
        />

        <Table
          columns={columns}
          dataSource={filteredChecks}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} quality checks`,
          }}
          rowClassName={(record) =>
            `quality-check-row quality-check-${record.status}`
          }
          onRow={(record) => ({
            onClick: () => handleViewCheck(record),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      {/* Quality Check Form/View Drawer */}
      <Drawer
        title={getDrawerTitle()}
        width={800}
        onClose={() => {
          setIsDrawerVisible(false);
          form.resetFields();
          setCurrentCheck(null);
        }}
        open={isDrawerVisible}
        footer={
          drawerMode !== "view" ? (
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsDrawerVisible(false);
                  form.resetFields();
                  setCurrentCheck(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={() => form.submit()}>
                {drawerMode === "add"
                  ? "Create Quality Check"
                  : "Update Quality Check"}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsDrawerVisible(false);
                  setCurrentCheck(null);
                }}
              >
                Close
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  handleEditCheck(currentCheck!);
                }}
              >
                Edit Quality Check
              </Button>
            </div>
          )
        }
      >
        {drawerMode === "view" ? (
          // View Mode - Read-only display
          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Product
                    </Text>
                    <Title level={4} className="mt-0">
                      {currentCheck?.product}
                    </Title>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Status
                    </Text>
                    <Tag
                      color={
                        qualityStatuses.find(
                          (s) => s.value === currentCheck?.status
                        )?.color
                      }
                      className="text-sm"
                      icon={
                        qualityStatuses.find(
                          (s) => s.value === currentCheck?.status
                        )?.icon
                      }
                    >
                      {
                        qualityStatuses.find(
                          (s) => s.value === currentCheck?.status
                        )?.label
                      }
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Priority
                    </Text>
                    <Tag
                      color={
                        priorities.find(
                          (p) => p.value === currentCheck?.priority
                        )?.color
                      }
                    >
                      {
                        priorities.find(
                          (p) => p.value === currentCheck?.priority
                        )?.label
                      }
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Category
                    </Text>
                    <Text strong>{currentCheck?.category}</Text>
                  </div>
                </Col>
              </Row>
            </div>

            <Descriptions title="Quality Check Details" bordered column={2}>
              <Descriptions.Item label="Check ID">
                {currentCheck?.id}
              </Descriptions.Item>
              <Descriptions.Item label="Batch">
                {currentCheck?.batch}
              </Descriptions.Item>
              <Descriptions.Item label="Checked By">
                {currentCheck?.checkedBy || "Not assigned"}
              </Descriptions.Item>
              <Descriptions.Item label="Checked At">
                {currentCheck?.checkedAt
                  ? dayjs(currentCheck.checkedAt).format("MMMM D, YYYY HH:mm")
                  : "Not checked"}
              </Descriptions.Item>
              <Descriptions.Item label="Notes" span={2}>
                {currentCheck?.notes}
              </Descriptions.Item>
              {currentCheck?.defectType && (
                <Descriptions.Item label="Defect Type" span={2}>
                  {currentCheck.defectType}
                </Descriptions.Item>
              )}
              {currentCheck?.resolution && (
                <Descriptions.Item label="Resolution" span={2}>
                  {currentCheck.resolution}
                </Descriptions.Item>
              )}
            </Descriptions>

            {currentCheck?.testResults && (
              <div className="mt-6">
                <Title level={5}>Test Results</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="flex items-center gap-2">
                      <Text>Dimensional Check:</Text>
                      <Tag
                        color={
                          currentCheck.testResults.dimensional
                            ? "success"
                            : "error"
                        }
                      >
                        {currentCheck.testResults.dimensional ? "PASS" : "FAIL"}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center gap-2">
                      <Text>Visual Inspection:</Text>
                      <Tag
                        color={
                          currentCheck.testResults.visual ? "success" : "error"
                        }
                      >
                        {currentCheck.testResults.visual ? "PASS" : "FAIL"}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center gap-2">
                      <Text>Functional Test:</Text>
                      <Tag
                        color={
                          currentCheck.testResults.functional
                            ? "success"
                            : "error"
                        }
                      >
                        {currentCheck.testResults.functional ? "PASS" : "FAIL"}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center gap-2">
                      <Text>Material Test:</Text>
                      <Tag
                        color={
                          currentCheck.testResults.material
                            ? "success"
                            : "error"
                        }
                      >
                        {currentCheck.testResults.material ? "PASS" : "FAIL"}
                      </Tag>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        ) : (
          // Edit/Add Mode - Form
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            preserve={false}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="product"
                  label="Product Name"
                  rules={[
                    { required: true, message: "Please enter product name" },
                  ]}
                >
                  <Input placeholder="Enter product name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="batch"
                  label="Batch Number"
                  rules={[
                    { required: true, message: "Please enter batch number" },
                  ]}
                >
                  <Input placeholder="B-YYYY-XXX" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[
                    { required: true, message: "Please select category" },
                  ]}
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
                  name="priority"
                  label="Priority"
                  rules={[
                    { required: true, message: "Please select priority" },
                  ]}
                >
                  <Select placeholder="Select priority">
                    {priorities.map((priority) => (
                      <Option key={priority.value} value={priority.value}>
                        <Tag color={priority.color}>{priority.label}</Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select status">
                    {qualityStatuses.map((status) => (
                      <Option key={status.value} value={status.value}>
                        <Tag color={status.color} icon={status.icon}>
                          {status.label}
                        </Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="checkedBy"
                  label="Inspector"
                  rules={[
                    { required: true, message: "Please select inspector" },
                  ]}
                >
                  <Select placeholder="Select inspector">
                    {inspectors.map((inspector) => (
                      <Option key={inspector} value={inspector}>
                        {inspector}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="checkedAt"
              label="Inspection Date & Time"
              rules={[
                { required: true, message: "Please select inspection date" },
              ]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
              rules={[
                { required: true, message: "Please enter inspection notes" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter detailed inspection notes..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item name="defectType" label="Defect Type (if applicable)">
              <Select placeholder="Select defect type" allowClear>
                {defectTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="resolution" label="Resolution (if defect found)">
              <TextArea
                rows={3}
                placeholder="Describe the resolution or corrective action taken..."
              />
            </Form.Item>

            <Divider>Test Results</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["testResults", "dimensional"]}
                  label="Dimensional Check"
                >
                  <Select placeholder="Select result">
                    <Option value={true}>
                      <Tag color="success">PASS</Tag>
                    </Option>
                    <Option value={false}>
                      <Tag color="error">FAIL</Tag>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["testResults", "visual"]}
                  label="Visual Inspection"
                >
                  <Select placeholder="Select result">
                    <Option value={true}>
                      <Tag color="success">PASS</Tag>
                    </Option>
                    <Option value={false}>
                      <Tag color="error">FAIL</Tag>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["testResults", "functional"]}
                  label="Functional Test"
                >
                  <Select placeholder="Select result">
                    <Option value={true}>
                      <Tag color="success">PASS</Tag>
                    </Option>
                    <Option value={false}>
                      <Tag color="error">FAIL</Tag>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["testResults", "material"]}
                  label="Material Test"
                >
                  <Select placeholder="Select result">
                    <Option value={true}>
                      <Tag color="success">PASS</Tag>
                    </Option>
                    <Option value={false}>
                      <Tag color="error">FAIL</Tag>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Drawer>

      {/* Filter Drawer */}
      <Drawer
        title="Quality Check Filters"
        width={400}
        onClose={() => setIsFilterDrawerVisible(false)}
        open={isFilterDrawerVisible}
        footer={
          <div className="flex justify-between">
            <Button onClick={clearFilters}>Clear All</Button>
            <div className="flex gap-2">
              <Button onClick={() => setIsFilterDrawerVisible(false)}>
                Close
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
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              mode="multiple"
              placeholder="Select statuses"
              value={filters.statuses}
              onChange={(value) => setFilters({ ...filters, statuses: value })}
              style={{ width: "100%" }}
            >
              {qualityStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  <Tag color={status.color} icon={status.icon}>
                    {status.label}
                  </Tag>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <Select
              mode="multiple"
              placeholder="Select priorities"
              value={filters.priorities}
              onChange={(value) =>
                setFilters({ ...filters, priorities: value })
              }
              style={{ width: "100%" }}
            >
              {priorities.map((priority) => (
                <Option key={priority.value} value={priority.value}>
                  <Tag color={priority.color}>{priority.label}</Tag>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
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
            <label className="block text-sm font-medium mb-2">Inspector</label>
            <Select
              mode="multiple"
              placeholder="Select inspectors"
              value={filters.checkedBy}
              onChange={(value) => setFilters({ ...filters, checkedBy: value })}
              style={{ width: "100%" }}
            >
              {inspectors.map((inspector) => (
                <Option key={inspector} value={inspector}>
                  {inspector}
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

          <Divider />

          {/* Filter Summary */}
          <div>
            <Title level={5}>Active Filters</Title>
            <div className="space-y-2">
              {filters.statuses.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Status: </span>
                  {filters.statuses.map((status) => (
                    <Tag
                      key={status}
                      className="mr-1"
                      color={
                        qualityStatuses.find((s) => s.value === status)?.color
                      }
                    >
                      {qualityStatuses.find((s) => s.value === status)?.label}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.priorities.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Priority: </span>
                  {filters.priorities.map((priority) => (
                    <Tag
                      key={priority}
                      className="mr-1"
                      color={
                        priorities.find((p) => p.value === priority)?.color
                      }
                    >
                      {priorities.find((p) => p.value === priority)?.label}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.categories.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Categories: </span>
                  {filters.categories.map((category) => (
                    <Tag key={category} className="mr-1">
                      {category}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.checkedBy.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Inspectors: </span>
                  {filters.checkedBy.map((inspector) => (
                    <Tag key={inspector} className="mr-1">
                      {inspector}
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
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default QualityPage;
