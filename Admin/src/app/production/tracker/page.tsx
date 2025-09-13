"use client";

import { useSubMasterOptions } from "@/hooks/useSubMasterOptions";
import {
  apiGetProductionCounts,
  apiGetProductionTrackers,
  apiUpdateProductionJobStatus,
} from "@/services/ProjectService";
import { useAppSelector } from "@/store/hooks";
import { Card } from "@/ui";
import { Table } from "@/ui/data-display";
import { Drawer, Modal } from "@/ui/overlay";
import { formatDate } from "@/utils/formatDate";
import { MASTERS } from "@/utils/master";
import { Status } from "@/utils/status";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FilterOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
  SyncOutlined,
  ToolOutlined,
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
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useCallback, useEffect, useState } from "react";

const { useApp } = App;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const statusColors = {
  "In Progress": "processing",
  QC: "warning",
  "On Hold": "default",
  Completed: "success",
  Cancelled: "error",
};

const priorityColors = {
  High: "red",
  Medium: "orange",
  Low: "green",
};

const productionStatuses = [
  Status.Pending,
  Status.Qc,
  Status.OnHold,
  Status.Completed,
  Status.Cancelled,
];

interface FilterState {
  statuses: string[];
  priorities: string[];
  assignees: string[];
  dateRange: [string, string] | null;
}

interface ProductionOrder {
  job_code: any;
  id: string;
  job_id: string;
  jobId: string;
  product: string;
  productId: string;
  quantity: number;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  assignedTo: string;
  manufacturerName: string;
  progress: number;
  currentStage: string;
  materials?: any[];
  stages?: any[];
  jobData?: any;
}

// Add interface for counts
interface ProductionCounts {
  all: number;
  [Status.Pending]: number;
  [Status.Qc]: number;
  [Status.OnHold]: number;
  [Status.Completed]: number;
  [Status.Cancelled]: number;
}

export default function ProductionTrackerPage() {
  const metalTypeOptions = useSubMasterOptions(MASTERS.METAL);
  const diamondTypeOptions = useSubMasterOptions(MASTERS.DIAMOND);

  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(
    null
  );
  const [submitLoading, setSubmitLoading] = useState(false);

  // Add state for counts
  const [counts, setCounts] = useState<ProductionCounts>({
    all: 0,
    [Status.Pending]: 0,
    [Status.Qc]: 0,
    [Status.OnHold]: 0,
    [Status.Completed]: 0,
    [Status.Cancelled]: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [isStatusUpdateModalVisible, setIsStatusUpdateModalVisible] =
    useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [showMaterialTabs, setShowMaterialTabs] = useState(false);
  const [activeMaterialTab, setActiveMaterialTab] = useState("return");
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    priorities: [],
    assignees: [],
    dateRange: null,
  });

  const [statusForm] = Form.useForm();
  const { message, modal } = useApp();
  const masters = useAppSelector((state) => state.user.masters);

  const metalId = masters?.find((item) => item?.code === MASTERS?.METAL)?.id;
  const diamodId = masters?.find((item) => item?.code === MASTERS?.DIAMOND)?.id;
  // Function to fetch counts
  const fetchProductionCounts = useCallback(async () => {
    try {
      setCountsLoading(true);

      const apiParams: Record<string, unknown> = {};

      // Apply the same filters to counts as to the main data
      if (searchText) {
        apiParams.search = searchText;
      }

      if (filters.statuses.length > 0) {
        apiParams.statuses = filters.statuses.join(",");
      }
      if (filters.priorities.length > 0) {
        apiParams.priorities = filters.priorities.join(",");
      }
      if (filters.assignees.length > 0) {
        apiParams.assignees = filters.assignees.join(",");
      }
      if (filters.dateRange) {
        apiParams.startDate = filters.dateRange[0];
        apiParams.endDate = filters.dateRange[1];
      }

      const response: any = await apiGetProductionCounts<{
        data: ProductionCounts;
        success: boolean;
        message?: string;
      }>(apiParams);

      if (response.data.data) {
        setCounts({
          ...response.data.data.statusCounts,
          all: response.data.data.total,
        });
      } else {
        message.error(response.message || "Failed to fetch production counts");
        // Set default counts on error
        setCounts({
          all: 0,
          [Status.Pending]: 0,
          [Status.Qc]: 0,
          [Status.OnHold]: 0,
          [Status.Completed]: 0,
          [Status.Cancelled]: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching production counts:", error);
      message.error("Failed to load production counts.");
      // Set default counts on error
      setCounts({
        all: 0,
        [Status.Pending]: 0,
        [Status.Qc]: 0,
        [Status.OnHold]: 0,
        [Status.Completed]: 0,
        [Status.Cancelled]: 0,
      });
    } finally {
      setCountsLoading(false);
    }
  }, [searchText, filters, message]);

  const fetchProductionData = useCallback(async () => {
    try {
      setLoading(true);

      const apiParams: Record<string, unknown> = {};

      if (searchText) {
        apiParams.search = searchText;
      }

      if (activeTab !== "all") {
        apiParams.status = activeTab;
      }

      if (filters.statuses.length > 0) {
        apiParams.statuses = filters.statuses.join(",");
      }
      if (filters.priorities.length > 0) {
        apiParams.priorities = filters.priorities.join(",");
      }
      if (filters.assignees.length > 0) {
        apiParams.assignees = filters.assignees.join(",");
      }
      if (filters.dateRange) {
        apiParams.startDate = filters.dateRange[0];
        apiParams.endDate = filters.dateRange[1];
      }

      const response: any = await apiGetProductionTrackers<{
        data: {
          data: ProductionOrder[];
        };
        success: boolean;
        message?: string;
      }>(apiParams);

      if (response.data.data) {
        setProductionOrders(response.data.data);
      } else {
        message.error(response.message || "Failed to fetch production data");
        setProductionOrders([]);
      }
    } catch (error) {
      console.error("Error fetching production data:", error);
      message.error("Failed to load production data. Please try again.");
      setProductionOrders([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, activeTab, filters, message]);

  // Function to fetch both data and counts
  const fetchAllData = useCallback(async () => {
    await Promise.all([fetchProductionData(), fetchProductionCounts()]);
  }, [fetchProductionData, fetchProductionCounts]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== "") {
        fetchAllData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // Filter data based on current filters (client-side filtering as backup)
  const filteredData = productionOrders.filter((order) => {
    const matchesSearch =
      !searchText ||
      order.id.toLowerCase().includes(searchText.toLowerCase()) ||
      order.product.toLowerCase().includes(searchText.toLowerCase()) ||
      order.assignedTo.toLowerCase().includes(searchText.toLowerCase()) ||
      order.manufacturerName.toLowerCase().includes(searchText.toLowerCase());

    const matchesTab = activeTab === "all" || order.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
        return <SyncOutlined spin />;
      case "QC":
        return <CheckCircleOutlined />;
      case "On Hold":
        return <PauseCircleOutlined />;
      case "Completed":
        return <CheckCircleOutlined />;
      case "Cancelled":
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // Updated Material Form Item Component
  const MaterialFormItem = ({
    fieldKey,
    name,
    restField,
    remove,
    type,
  }: {
    fieldKey: number;
    name: number;
    restField: any;
    remove: (index: number) => void;
    type: string;
  }) => {
    const fieldName =
      type === "return" ? "return_materials" : "wastage_materials";
    const watchedValues = Form.useWatch(fieldName, statusForm);
    const currentMaterialType = watchedValues?.[name]?.material_name_id;

    return (
      <div
        key={fieldKey}
        className="border border-gray-200 rounded-lg p-4 mb-4"
      >
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-medium">
            {type === "return" ? "Return" : "Wastage"} Material {name + 1}
          </h5>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => remove(name)}
          />
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              {...restField}
              name={[name, "material_name_id"]}
              label="Material Type"
              rules={[
                { required: true, message: "Please select material type" },
              ]}
            >
              <Select
                placeholder="Select material type"
                onChange={(value) => {
                  // Reset the material_type_id when material_name_id changes
                  const currentValues =
                    statusForm.getFieldValue(fieldName) || [];
                  currentValues[name] = {
                    ...currentValues[name],
                    material_name_id: value,
                    material_type_id: undefined, // Reset sub-type
                  };
                  statusForm.setFieldsValue({
                    [fieldName]: currentValues,
                  });
                }}
              >
                <Option value={metalId}>Metal</Option>
                <Option value={diamodId}>Diamond</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            {currentMaterialType === metalId && (
              <Form.Item
                {...restField}
                name={[name, "material_type_id"]}
                label="Metal Type"
                rules={[
                  { required: true, message: "Please select metal type" },
                ]}
              >
                <Select
                  placeholder="Select metal type"
                  options={metalTypeOptions}
                />
              </Form.Item>
            )}

            {currentMaterialType === diamodId && (
              <Form.Item
                {...restField}
                name={[name, "material_type_id"]}
                label="Diamond Type"
                rules={[
                  { required: true, message: "Please select diamond type" },
                ]}
              >
                <Select
                  placeholder="Select diamond type"
                  options={diamondTypeOptions}
                />
              </Form.Item>
            )}

            {!currentMaterialType && (
              <Form.Item label="Sub Type">
                <Select placeholder="Select material type first" disabled />
              </Form.Item>
            )}
          </Col>
        </Row>

        <Row gutter={16}>
          {currentMaterialType === metalId && (
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "weight"]}
                label="Weight (gm)"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter weight"
                  step={0.01}
                  precision={2}
                  min={0}
                  addonAfter="gm"
                />
              </Form.Item>
            </Col>
          )}

          {currentMaterialType === diamodId && (
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "quantity"]}
                label="Quantity (gm)"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter quantity"
                  min={0}
                  step={0.01}
                  precision={2}
                  addonAfter="gm"
                />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item {...restField} name={[name, "notes"]} label="Notes">
              <Input placeholder="Optional notes" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  const handleUpdateStatus = (record: ProductionOrder) => {
    setSelectedOrder(record);
    setShowMaterialTabs(false);
    setActiveMaterialTab("return");

    // Initialize form with current status
    statusForm.setFieldsValue({
      status: record.status,
      return_materials: [],
      wastage_materials: [],
      notes: "",
    });

    setIsStatusUpdateModalVisible(true);
  };

  const handleCancelOrder = (record: ProductionOrder) => {
    console.log("Cancel order:", record);

    modal.confirm({
      title: "Cancel Production Order",
      content: "Are you sure you want to cancel this production order?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // TODO: Call API to cancel order
        message.success("Production order cancelled successfully");
        fetchAllData(); // Refresh both data and counts
      },
    });
  };

  const handleMenuClick = (action: string, record: ProductionOrder) => {
    switch (action) {
      case "status":
        handleUpdateStatus(record);
        break;
      case "cancel":
        handleCancelOrder(record);
        break;
      case "wastage":
        message.info("Wastage submission feature");
        break;
    }
  };

  const handleOpenFilters = () => {
    setIsFilterDrawerVisible(true);
  };

  const clearFilters = () => {
    setFilters({
      statuses: [],
      priorities: [],
      assignees: [],
      dateRange: null,
    });
  };

  // Watch for status change to show/hide material tabs
  const handleStatusChange = (value: string) => {
    if (value === "Completed") {
      setShowMaterialTabs(true);
      // Initialize with default materials for both tabs
      statusForm.setFieldsValue({
        return_materials: [
          {
            material_name_id: metalId,
            material_type_id: undefined,
            quantity: 0,
            weight: 0,
            notes: "",
          },
        ],
        wastage_materials: [
          {
            material_name_id: metalId,
            material_type_id: undefined,
            quantity: 0,
            weight: 0,
            notes: "",
          },
        ],
      });
    } else {
      setShowMaterialTabs(false);
      statusForm.setFieldsValue({
        return_materials: [],
        wastage_materials: [],
      });
    }
  };

  // Form submission handlers
  const handleStatusUpdateSubmit = async (values: any) => {
    if (!selectedOrder) return;

    try {
      setSubmitLoading(true);

      // Prepare the data for API
      const updateData: any = {
        status: values.status,
        notes: values.notes || "",
      };

      // If status is completed and materials are provided
      if (values.status === "Completed" && showMaterialTabs) {
        if (values.return_materials?.length > 0) {
          updateData.return_materials = values.return_materials;
        }
        if (values.wastage_materials?.length > 0) {
          updateData.wastage_materials = values.wastage_materials;
        }
      }

      // Call the API
      const response: any = await apiUpdateProductionJobStatus(
        selectedOrder.job_id,
        updateData
      );

      if (response.data) {
        const returnCount = values.return_materials?.length || 0;
        const wastageCount = values.wastage_materials?.length || 0;

        message.success(
          `Production order ${selectedOrder.job_code} status updated to ${
            values.status
          }${
            returnCount > 0 || wastageCount > 0
              ? ` with ${returnCount} return materials and ${wastageCount} wastage materials`
              : ""
          }`
        );

        // Close modal and reset form
        setIsStatusUpdateModalVisible(false);
        statusForm.resetFields();
        setSelectedOrder(null);
        setShowMaterialTabs(false);
        setActiveMaterialTab("return");

        fetchProductionCounts();

        // Refresh both data and counts
        await fetchAllData();
      }
    } catch (error: any) {
      console.error("Error updating production status:", error);
      message.error(
        error.response.data.message ||
          "Failed to update production status. Please try again."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Handle tab change and refresh data
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // Apply filters and close drawer
  const applyFilters = () => {
    setIsFilterDrawerVisible(false);
    fetchAllData(); // Refresh both data and counts
  };

  // Update refresh function to fetch both data and counts
  const handleRefresh = () => {
    fetchAllData();
  };

  // Add material function
  const addMaterial = (type: string) => {
    const fieldName =
      type === "return" ? "return_materials" : "wastage_materials";
    const materials = statusForm.getFieldValue(fieldName) || [];
    statusForm.setFieldsValue({
      [fieldName]: [
        ...materials,
        {
          material_name_id: metalId,
          material_type_id: undefined,
          quantity: 0,
          weight: 0,
          notes: "",
        },
      ],
    });
  };

  // Table columns
  const columns = [
    {
      title: "Job ID",
      key: "id",
      render: (record: ProductionOrder) => (
        <span className="font-medium">{record.jobData.job_code}</span>
      ),
    },
    {
      title: "Product",
      key: "product",
      render: (record: ProductionOrder) => (
        <div> {record?.jobData?.product_name}</div>
      ),
    },
    {
      title: "Manufacturer Name",
      key: "manufacturer",
      render: (record: ProductionOrder) => (
        <div>{record?.jobData?.manufacturer?.manufacturerName}</div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          icon={getStatusIcon(status)}
          color={statusColors[status as keyof typeof statusColors]}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Priority",
      key: "priority",
      render: (record: ProductionOrder) => (
        <Tag
          color={
            priorityColors[
              record.jobData.priority as keyof typeof priorityColors
            ]
          }
        >
          {record.jobData.priority}
        </Tag>
      ),
    },
    {
      title: "Due Date",
      key: "dueDate",
      render: (record: ProductionOrder) => {
        const due = new Date(record.jobData.due_date);
        const today = new Date();
        const isOverdue = due < today && record.status !== "Completed";
        return (
          <div className={isOverdue ? "text-red-500" : ""}>
            {formatDate(record.jobData.due_date)}
            {isOverdue && <div className="text-xs">Overdue</div>}
          </div>
        );
      },
      sorter: (a: ProductionOrder, b: ProductionOrder) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ProductionOrder) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<SyncOutlined />}
            onClick={() => handleMenuClick("status", record)}
          />

          {record.status === "Completed" && (
            <Button
              type="default"
              size="small"
              icon={<ToolOutlined />}
              onClick={() => handleMenuClick("wastage", record)}
            />
          )}

          <Popconfirm
            title="Are you sure to cancel this order?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleMenuClick("cancel", record)}
          >
            <Button
              type="default"
              size="small"
              danger
              icon={<StopOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
      width: 150,
      fixed: "right",
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-2">
        <Title level={4} className="mb-0">
          Production Tracker
        </Title>
        <Button
          icon={<SyncOutlined />}
          onClick={handleRefresh}
          loading={loading || countsLoading}
        >
          Refresh
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Search
              placeholder="Search by order ID, product, assignee, or manufacturer..."
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
          <Button icon={<FilterOutlined />} onClick={handleOpenFilters}>
            Filters
            {(filters.statuses.length +
              filters.priorities.length +
              filters.assignees.length >
              0 ||
              filters.dateRange) && (
              <span className="ml-1 bg-red-500 text-white rounded-full w-2 h-2 inline-block"></span>
            )}
          </Button>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: "all",
              label: countsLoading ? (
                <span>
                  <Spin size="small" style={{ marginRight: 8 }} />
                  All Orders (-)
                </span>
              ) : (
                `All Orders (${counts.all})`
              ),
            },
            ...productionStatuses.map((status) => ({
              key: status,
              label: countsLoading ? (
                <span>
                  <Tag
                    color={statusColors[status as keyof typeof statusColors]}
                    style={{ marginRight: 8 }}
                  />
                  <Spin size="small" style={{ marginRight: 8 }} />
                  {status} (-)
                </span>
              ) : (
                <span>
                  <Tag
                    color={statusColors[status as keyof typeof statusColors]}
                    style={{ marginRight: 8 }}
                  />
                  {status} ({counts[status as keyof ProductionCounts] || 0})
                </span>
              ),
            })),
          ]}
        />

        <Spin spinning={loading}>
          <Table
            columns={columns as []}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: 1500 }}
            className="mt-4"
          />
        </Spin>
      </Card>

      {/* Status Update Modal */}
      <Modal
        title={`Update Production Status - ${selectedOrder?.jobData?.product_name}`}
        width={showMaterialTabs ? 900 : 500}
        onCancel={() => {
          setIsStatusUpdateModalVisible(false);
          statusForm.resetFields();
          setSelectedOrder(null);
          setShowMaterialTabs(false);
          setActiveMaterialTab("return");
        }}
        open={isStatusUpdateModalVisible}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsStatusUpdateModalVisible(false);
              statusForm.resetFields();
              setSelectedOrder(null);
              setShowMaterialTabs(false);
              setActiveMaterialTab("return");
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={() => statusForm.submit()}
          >
            Update Status
          </Button>,
        ]}
      >
        {selectedOrder && (
          <Form
            form={statusForm}
            layout="vertical"
            onFinish={handleStatusUpdateSubmit}
            preserve={true}
            initialValues={{
              status: selectedOrder.status,
              return_materials: [],
              wastage_materials: [],
              notes: "",
            }}
          >
            <div className="bg-gray-50 p-2 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Current Status</h4>
              <Tag
                icon={getStatusIcon(selectedOrder.status)}
                color={
                  statusColors[
                    selectedOrder.status as keyof typeof statusColors
                  ]
                }
                className="px-3 py-1"
              >
                {selectedOrder.status}
              </Tag>
            </div>

            <Form.Item
              name="status"
              label="New Status"
              rules={[{ required: true, message: "Please select a status" }]}
            >
              <Select
                size="middle"
                placeholder="Select new status"
                onChange={handleStatusChange}
              >
                {productionStatuses.map((status) => (
                  <Option key={status} value={status}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span>{status}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Material Tabs Section - FIXED VERSION */}
            {showMaterialTabs && (
              <>
                <Divider>Material Management</Divider>

                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  {/* Custom Tab Headers */}
                  <div className="flex border-b border-gray-200 mb-4">
                    <button
                      type="button"
                      className={`px-4 py-2 cursor-pointer font-medium transition-colors ${
                        activeMaterialTab === "return"
                          ? "border-b-2 border-gray-500 text-gray-600 bg-gray-50"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveMaterialTab("return")}
                    >
                      <ToolOutlined className="mr-2" />
                      Return Materials
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 font-medium ml-4 transition-colors ${
                        activeMaterialTab === "wastage"
                          ? "border-b-2 cursor-pointer border-gray-500 text-gray-600 bg-gray-50"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveMaterialTab("wastage")}
                    >
                      <DeleteOutlined className="mr-2" />
                      Wastage Materials
                    </button>
                  </div>

                  {/* Return Materials Content */}
                  <div
                    style={{
                      display:
                        activeMaterialTab === "return" ? "block" : "none",
                    }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">
                        Return Materials
                      </h4>
                      <Button
                        type="default"
                        onClick={() => addMaterial("return")}
                        icon={<PlusOutlined />}
                      >
                        Add Return Material
                      </Button>
                    </div>

                    <Form.List name="return_materials">
                      {(fields, { add, remove }) => (
                        <div className="space-y-4">
                          {fields.map(({ key, name, ...restField }) => (
                            <MaterialFormItem
                              key={key}
                              fieldKey={key}
                              name={name}
                              restField={restField}
                              remove={remove}
                              type="return"
                            />
                          ))}
                          {fields.length === 0 && (
                            <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                              <ToolOutlined className="text-2xl mb-2 text-gray-400" />
                              <p>No return materials added yet.</p>
                              <p className="text-sm">
                                {`  Click "Add Return Material" to specify return
                                materials for this completed order.`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </Form.List>
                  </div>

                  {/* Wastage Materials Content */}
                  <div
                    style={{
                      display:
                        activeMaterialTab === "wastage" ? "block" : "none",
                    }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">
                        Wastage Materials
                      </h4>
                      <Button
                        type="default"
                        onClick={() => addMaterial("wastage")}
                        icon={<PlusOutlined />}
                      >
                        Add Wastage Material
                      </Button>
                    </div>

                    <Form.List name="wastage_materials">
                      {(fields, { add, remove }) => (
                        <div className="space-y-4">
                          {fields.map(({ key, name, ...restField }) => (
                            <MaterialFormItem
                              key={key}
                              fieldKey={key}
                              name={name}
                              restField={restField}
                              remove={remove}
                              type="wastage"
                            />
                          ))}
                          {fields.length === 0 && (
                            <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                              <DeleteOutlined className="text-2xl mb-2 text-gray-400" />
                              <p>No wastage materials added yet.</p>
                              <p className="text-sm">
                                {`Click "Add Wastage Material" to specify wastage
                                  materials for this completed order.`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </Form.List>
                  </div>
                </div>
              </>
            )}
          </Form>
        )}
      </Modal>

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
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              mode="multiple"
              placeholder="Select status"
              value={filters.statuses}
              onChange={(value) => setFilters({ ...filters, statuses: value })}
              style={{ width: "100%" }}
            >
              {productionStatuses.map((status) => (
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
            <label className="block text-sm font-medium mb-2">Priority</label>
            <Select
              mode="multiple"
              placeholder="Select priority"
              value={filters.priorities}
              onChange={(value) =>
                setFilters({ ...filters, priorities: value })
              }
              style={{ width: "100%" }}
            >
              {Object.keys(priorityColors).map((priority) => (
                <Option key={priority} value={priority}>
                  <Tag
                    color={
                      priorityColors[priority as keyof typeof priorityColors]
                    }
                  >
                    {priority}
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
        </div>
      </Drawer>
    </div>
  );
}
