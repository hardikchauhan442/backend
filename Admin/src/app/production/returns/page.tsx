"use client";

import { Card } from "@/ui";
import { Drawer } from "@/ui/overlay";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
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
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;

import {
  apiCreateReturnRecord,
  apiGetReturnRecords,
  apiUpdateReturnRecord,
  apiUpdateReturnStatus,
} from "@/services/ProjectService";

const categories = ["Metal", "Diamond", "Other"];
const statuses = ["Pending", "Approved", "Rejected"];

const statusColors = {
  Pending: "orange",
  Approved: "green",
  Rejected: "red",
};

type DrawerMode = "add" | "edit";

interface FilterState {
  categories: string[];
  processes: string[];
  statuses: string[];
  reportedBy: string[];
  dateRange: [string, string] | null;
  weightRange: [number, number] | null;
}

interface ApiReturnRecord {
  id: string;
  job_id: string | null;
  material_type_id: string;
  material_name_id: string;
  quantity: number;
  weight: string;
  notes: string;
  status: string;
  return_reason?: string;
  return_date?: string;
  created_by: string;
  updated_by: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  job_data: {
    id: string;
    product_name: string;
    job_code: string;
    customer_name: string;
    priority: string;
    due_date: string;
    cost_estimate: number;
    manufacturer_id: string;
    job_description: string;
    special_instructions: string;
    file_path: string | null;
    status: string;
    created_by: string;
    updated_by: string;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  } | null;
  material_type: {
    id: string;
    name: string;
    code: string;
    groupName: string;
    [key: string]: any;
  };
  material_name: {
    id: string;
    name: string;
    code: string;
    [key: string]: any;
  };
}

type ReturnRecord = ApiReturnRecord;

interface ApiResponse {
  data: {
    status: number;
    message: string;
    data: ApiReturnRecord[];
    decrypted_data: ApiReturnRecord[];
    // Add pagination metadata
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  status: number;
  statusText: string;
  [key: string]: any;
}

export default function ReturnPage() {
  const router = useRouter();

  const [returnData, setReturnData] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Add pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} records`,
  });

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [currentRecord, setCurrentRecord] = useState<ReturnRecord | null>(null);
  const [form] = Form.useForm();

  const { message } = App.useApp?.() || { message: {} as any };
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    processes: [],
    statuses: [],
    reportedBy: [],
    dateRange: null,
    weightRange: null,
  });

  // Fetch return data
  const fetchReturnData = useCallback(async () => {
    try {
      setLoading(true);

      const apiParams: Record<string, unknown> = {
        // Add pagination parameters
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (searchText) {
        apiParams.search = searchText;
      }

      if (activeTab !== "all") {
        apiParams.status = activeTab;
      }

      if (filters.categories.length > 0) {
        apiParams.categories = filters.categories.join(",");
      }
      if (filters.processes.length > 0) {
        apiParams.processes = filters.processes.join(",");
      }
      if (filters.statuses.length > 0) {
        apiParams.statuses = filters.statuses.join(",");
      }
      if (filters.reportedBy.length > 0) {
        apiParams.reportedBy = filters.reportedBy.join(",");
      }
      if (filters.dateRange) {
        apiParams.startDate = filters.dateRange[0];
        apiParams.endDate = filters.dateRange[1];
      }
      if (filters.weightRange) {
        apiParams.minWeight = filters.weightRange[0];
        apiParams.maxWeight = filters.weightRange[1];
      }

      const response = (await apiGetReturnRecords(apiParams)) as ApiResponse;

      console.log("API Response:", response);

      if (response?.data?.data && Array.isArray(response.data.data)) {
        setReturnData(response.data.data);

        // Update pagination state with server response
        setPagination((prev) => ({
          ...prev,
          total: response.data.total || response.data.data.length,
          current: response.data.page || prev.current,
        }));

        console.log("Data set:", response.data.data);
        console.log("Pagination info:", {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
        });
      } else {
        message.error("Invalid response format from server");
        setReturnData([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error("Error fetching return data:", error);
      message.error("Failed to load return data. Please try again.");
      setReturnData([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchText,
    activeTab,
    filters,
    pagination.current,
    pagination.pageSize,
    message,
  ]);

  // Handle pagination changes
  const handleTableChange = (paginationConfig: any) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  // Reset pagination when filters change
  const resetPagination = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchReturnData();
  }, [fetchReturnData]);

  // Debounce search and reset pagination
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== "") {
        resetPagination(); // Reset to first page when searching
        fetchReturnData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // Reset pagination when active tab changes
  useEffect(() => {
    resetPagination();
  }, [activeTab]);

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [filters]);

  const handleAdd = () => {
    setDrawerMode("add");
    setCurrentRecord(null);
    form.resetFields();
    setIsDrawerVisible(true);
  };

  const handleEdit = (record: ReturnRecord) => {
    if (!record) return;

    setDrawerMode("edit");
    setCurrentRecord(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      return_date: record.return_date ? dayjs(record.return_date) : dayjs(),
      weight: parseFloat(record.weight) || 0,
    });
    setIsDrawerVisible(true);
  };

  const handleStatusUpdate = async (recordId: string, newStatus: string) => {
    try {
      const updateData = {
        status: newStatus,
      };

      console.log("Updating status:", { recordId, updateData });

      const response: any = await apiUpdateReturnStatus(recordId, updateData);

      console.log("Status update response:", response);

      // Check if the response indicates success
      if (response && !response.error) {
        message.success(`Return record status updated to ${newStatus}`);
        await fetchReturnData();
      } else {
        message.error(response?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const submitData = {
        ...values,
        return_date: values.return_date
          ? values.return_date.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        weight: values.weight?.toString() || "0",
      };

      console.log("Submitting data:", submitData);

      let response: any;
      if (drawerMode === "add") {
        response = await apiCreateReturnRecord(submitData);
      } else {
        response = await apiUpdateReturnRecord(currentRecord!.id, submitData);
      }

      if (response && !response.error) {
        message.success(
          `Return record ${
            drawerMode === "add" ? "created" : "updated"
          } successfully`
        );
        setIsDrawerVisible(false);
        form.resetFields();
        await fetchReturnData();
      } else {
        message.error(response?.message || "Failed to save return record");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Please check all required fields");
    }
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      processes: [],
      statuses: [],
      reportedBy: [],
      dateRange: null,
      weightRange: null,
    });
  };

  const exportToPDF = () => {
    message.info("PDF export functionality will be implemented");
  };

  const exportToExcel = () => {
    message.info("Excel export functionality will be implemented");
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const applyFilters = () => {
    setIsFilterDrawerVisible(false);
    resetPagination();
    fetchReturnData();
  };

  const columns = [
    {
      title: "Job ID",
      key: "job_id",
      render: (record: ReturnRecord) => (
        <div>
          {record.job_id ? (
            <a onClick={() => router.push(`/jobs/${record.job_id}`)}>
              {record.job_data?.job_code || record.job_id.slice(0, 8) + "..."}
            </a>
          ) : (
            <span className="text-gray-400">No Job</span>
          )}
        </div>
      ),
    },
    {
      title: "Return Date",
      dataIndex: "return_date",
      key: "return_date",
      render: (return_date: string, record: ReturnRecord) =>
        dayjs(return_date || record.created_at).format("DD/MM/YYYY"),
      sorter: (a: ReturnRecord, b: ReturnRecord) =>
        dayjs(a.return_date || a.created_at).unix() -
        dayjs(b.return_date || b.created_at).unix(),
    },
    {
      title: "Job Details",
      key: "jobDetails",
      render: (record: ReturnRecord) => (
        <div>
          {record.job_data ? (
            <>
              <div className="font-medium">{record.job_data.product_name}</div>
              <div className="text-xs text-gray-500">
                Customer: {record.job_data.customer_name}
              </div>
              <div className="text-xs text-gray-500">
                Priority: {record.job_data.priority}
              </div>
            </>
          ) : (
            <span className="text-gray-400">No job details</span>
          )}
        </div>
      ),
    },
    {
      title: "Material",
      key: "material",
      render: (record: ReturnRecord) => (
        <div>
          <div className="font-medium">
            {record.material_type?.name || "Unknown Material"}
          </div>
          <div className="text-xs text-gray-500">
            {record.material_type?.groupName || "Other"} •{" "}
            {parseFloat(record.weight) || record.quantity || 0}
            {record.material_type?.groupName === "Diamond" ? "ct" : "g"}
          </div>
          <div className="text-xs text-gray-400">
            Code: {record.material_type?.code || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Weight/Quantity",
      key: "weight",
      render: (record: ReturnRecord) => (
        <div>
          <span className="font-medium">
            {parseFloat(record.weight) || record.quantity || 0}
          </span>
          <span className="text-xs text-gray-500 ml-1">
            {record.material_type?.groupName === "Diamond" ? "ct" : "g"}
          </span>
        </div>
      ),
      sorter: (a: ReturnRecord, b: ReturnRecord) =>
        (parseFloat(a.weight) || a.quantity || 0) -
        (parseFloat(b.weight) || b.quantity || 0),
    },
    {
      title: "Return Reason",
      dataIndex: "return_reason",
      key: "return_reason",
      render: (reason: string) => (
        <div className="max-w-xs">
          <Tooltip title={reason}>
            <span className="truncate block">
              {reason || "No reason specified"}
            </span>
          </Tooltip>
        </div>
      ),
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
      onFilter: (value: any, record: ReturnRecord) => record.status === value,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => (
        <div className="max-w-xs">
          <Tooltip title={notes}>
            <span className="truncate block">{notes || "No notes"}</span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ReturnRecord) => (
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

          {record.status === "Pending" && (
            <>
              <Popconfirm
                title="Approve Return"
                description="Are you sure you want to approve this return record?"
                onConfirm={() => handleStatusUpdate(record.id, "Approved")}
                okText="Yes, Approve"
                cancelText="Cancel"
                okType="primary"
              >
                <Tooltip title="Approve">
                  <Button
                    type="text"
                    style={{ color: "green" }}
                    icon={<CheckOutlined />}
                  />
                </Tooltip>
              </Popconfirm>

              <Popconfirm
                title="Reject Return"
                description="Are you sure you want to reject this return record?"
                onConfirm={() => handleStatusUpdate(record.id, "Rejected")}
                okText="Yes, Reject"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Reject">
                  <Button type="text" danger icon={<CloseOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Calculate total returns by category
  const totalReturns = returnData.reduce((acc, curr) => {
    const value = parseFloat(curr.weight) || curr.quantity || 0;
    const category = curr.material_type?.groupName || "Other";
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="mb-0">
          Material Returns
        </Title>
        <div className="flex gap-2">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Return
          </Button>
          <Button
            icon={<SyncOutlined />}
            onClick={fetchReturnData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {Object.entries(totalReturns).map(([category, weight]) => (
          <Col xs={24} sm={12} md={6} key={category}>
            <Card>
              <div className="text-2xl font-semibold">
                {weight.toFixed(2)}
                {category === "Diamond" ? "ct" : "g"}
              </div>
              <div className="text-gray-500">{category} Returns</div>
            </Card>
          </Col>
        ))}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-2xl font-semibold">
              {Object.values(totalReturns)
                .reduce((a, b) => a + b, 0)
                .toFixed(2)}
            </div>
            <div className="text-gray-500">Total Returns</div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Search
              placeholder="Search by ID, material, job, customer, or product..."
              allowClear
              enterButton={
                <Button type="primary">
                  <SearchOutlined />
                </Button>
              }
              onSearch={handleSearch}
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
              {(filters.categories.length +
                filters.processes.length +
                filters.statuses.length +
                filters.reportedBy.length >
                0 ||
                filters.dateRange ||
                filters.weightRange) && (
                <span className="ml-1 bg-red-500 text-white rounded-full w-2 h-2 inline-block"></span>
              )}
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            { key: "all", label: `All Records` },
            ...statuses.map((status) => ({
              key: status,
              label: (
                <span>
                  <Tag
                    color={statusColors[status as keyof typeof statusColors]}
                    style={{ marginRight: 8 }}
                  />
                  {status}
                </span>
              ),
            })),
          ]}
        />

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={returnData}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: true }}
            className="mt-4"
          />
        </Spin>
      </Card>

      {/* Add/Edit Drawer */}
      <Drawer
        title={`${drawerMode === "add" ? "Add" : "Edit"} Return Record`}
        width={500}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>
              {drawerMode === "add" ? "Create" : "Update"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="space-y-4">
          <Form.Item name="job_id" label="Job ID" rules={[{ required: false }]}>
            <Input placeholder="Enter job ID (optional)" />
          </Form.Item>

          <Form.Item
            name="material_type_id"
            label="Material Type"
            rules={[{ required: true, message: "Please select material type" }]}
          >
            <Select placeholder="Select material type">
              <Option value="metal">Metal</Option>
              <Option value="diamond">Diamond</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="weight"
            label="Weight/Quantity"
            rules={[
              { required: true, message: "Please enter weight/quantity" },
            ]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Enter weight or quantity"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="return_date"
            label="Return Date"
            rules={[{ required: true, message: "Please select return date" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              defaultValue={dayjs()}
            />
          </Form.Item>

          <Form.Item
            name="return_reason"
            label="Return Reason"
            rules={[{ required: true, message: "Please enter return reason" }]}
          >
            <TextArea rows={3} placeholder="Enter reason for material return" />
          </Form.Item>

          <Form.Item name="notes" label="Additional Notes">
            <TextArea
              rows={3}
              placeholder="Enter any additional notes (optional)"
            />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="Pending">
            <Select>
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
              <Button type="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
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

          <Divider />

          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
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
              Weight/Quantity Range
            </label>
            <div className="flex gap-2">
              <InputNumber
                placeholder="Min"
                value={filters.weightRange?.[0]}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    weightRange: [value || 0, filters.weightRange?.[1] || 100],
                  })
                }
                style={{ width: "100%" }}
              />
              <InputNumber
                placeholder="Max"
                value={filters.weightRange?.[1]}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    weightRange: [filters.weightRange?.[0] || 0, value || 100],
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
              {filters.dateRange && (
                <div>
                  <span className="text-xs text-gray-500">Date Range: </span>
                  <Tag>
                    {filters.dateRange[0]} to {filters.dateRange[1]}
                  </Tag>
                </div>
              )}
              {filters.weightRange && (
                <div>
                  <span className="text-xs text-gray-500">Weight: </span>
                  <Tag>
                    {filters.weightRange[0]} - {filters.weightRange[1]}
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
