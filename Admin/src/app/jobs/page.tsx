"use client";

import { useIsClient } from "@/hooks";
import { useSubMasterOptions } from "@/hooks/useSubMasterOptions";
import { useVendorsManufacturers } from "@/hooks/useVendorsManufacturers";
import {
  apiCreateJob,
  apiDeleteJob,
  apiGetJobs,
  apiUpdateJob,
  apiUpdateJobStatus, // Added status update API
} from "@/services/ProjectService";
import { useAppSelector } from "@/store/hooks";
import { MASTERS } from "@/utils/master";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  InboxOutlined,
  MoreOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App,
  Checkbox,
  Collapse,
  DatePicker,
  Form,
  Input,
  InputNumber,
  List,
  Radio,
  Select,
  Slider,
  Space,
  Statistic,
  Upload,
} from "antd";
import type { RcFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// UI Components
import Button from "@/ui/components/Button";
import Table, { ColumnType } from "@/ui/data-display/Table";
import Tag from "@/ui/data-display/Tag";
import Search from "@/ui/forms/Search";
import Card from "@/ui/layout/Card";
import { Col, Row } from "@/ui/layout/Grid";
import Tabs from "@/ui/navigation/Tabs";
import Drawer from "@/ui/overlay/Drawer";
import Dropdown from "@/ui/overlay/Dropdown";
import Modal from "@/ui/overlay/Modal";
import { formatDate } from "@/utils/formatDate";

// Enhanced material item interface for job materials
interface MaterialItem {
  id?: string;
  material_name_id: string; // UUID of master (metal/diamond)
  material_type_id: string; // UUID of sub-master type
  unit_id: string; // UUID of unit
  quantity: number;
  weight?: number;
  notes?: string;
  // Display purposes - populated from relations
  materialNameData?: { name: string };
  materialTypeData?: { name: string };
  unitData?: { name: string };
}

interface DesignFile extends Omit<RcFile, "type"> {
  type: string;
  url?: string;
  status?: "uploading" | "done" | "error" | "removed";
  percent?: number;
  response?: any;
  error?: any;
  linkProps?: any;
  preview?: string;
}

interface StatusHistory {
  id: string;
  status: string;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

interface JobType {
  job_code: string;
  manufacturer_name: string;
  id: string;
  product_name: string;
  customer_name: string;
  status: "Pending" | "In Progress" | "Completed" | "On Hold"; // Updated to match backend
  priority: "High" | "Medium" | "Low";
  progress: number;
  due_date: string;
  manufacturer_id?: string;
  manufacturerName?: string;
  department?:
    | "Design"
    | "Casting"
    | "Polishing"
    | "Final Shape"
    | "Due For QC";
  cost_estimate?: number;
  actualCost?: number;
  qualityRating?: number;
  notes?: string;
  job_description?: string;
  special_instructions?: string;
  file_path?: string;
  materials: MaterialItem[];
  designFiles?: DesignFile[];
  statusHistory?: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

interface JobFormValues {
  product_name: string;
  customer_name: string;
  status: "Pending" | "In Progress" | "Completed" | "On Hold"; // Updated to match backend
  priority: "High" | "Medium" | "Low";
  due_date: string;
  manufacturer_id?: string;
  department?:
    | "Design"
    | "Casting"
    | "Polishing"
    | "Final Shape"
    | "Due For QC";
  cost_estimate?: number;
  job_description: string;
  special_instructions?: string;
  materials: MaterialItem[];
}

interface AdvancedFilters {
  dueDateRange: [string, string] | null;
  costRange: [number, number];
  progressRange: [number, number];
  createdDateRange: [string, string] | null;
  manufacturers: string[];
  qualityRating: number | null;
  hasNotes: boolean;
  overdue: boolean;
}

// Job Drawer State Interface
interface JobDrawerState {
  visible: boolean;
  mode: "create" | "edit";
  editingJob: JobType | null;
}

// Mock manufacturer data
const manufacturerData = [
  {
    id: "MFG-001",
    name: "Elite Jewelry Craftsmen",
    rating: 4.5,
    specialty: "Gold Work & Custom Design",
  },
  {
    id: "MFG-002",
    name: "Precious Metals Inc.",
    rating: 4.8,
    specialty: "Platinum & Diamonds",
  },
  {
    id: "MFG-003",
    name: "Master Jewelers Co",
    rating: 4.2,
    specialty: "Gemstone Setting",
  },
  {
    id: "MFG-004",
    name: "Artisan Metals Inc",
    rating: 4.6,
    specialty: "Silver & Custom Design",
  },
];

// Updated status colors to match backend enum
const statusColors = {
  Pending: "orange",
  "In Progress": "blue",
  Completed: "green",
  "On Hold": "yellow",
};

const priorityColors = {
  High: "red",
  Medium: "orange",
  Low: "green",
};

// Updated status icon function
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Pending":
      return <ClockCircleOutlined />;
    case "In Progress":
      return <SyncOutlined spin />;
    case "Completed":
      return <CheckCircleOutlined />;
    case "On Hold":
      return <PauseCircleOutlined />;
    default:
      return null;
  }
};

const JobsPageContent = () => {
  // Hooks for material options
  const metalTypeOptions = useSubMasterOptions(MASTERS.METAL);
  const diamondTypeOptions = useSubMasterOptions(MASTERS.DIAMOND);
  const unitOptions = useSubMasterOptions(MASTERS.UNITOFMEASURE);
  const { manufacturerOptions } = useVendorsManufacturers();

  // Get masters for determining metal/diamond IDs
  const masters = useAppSelector((state) => state.user.masters);
  const metalId = masters?.find((item) => item?.code === MASTERS?.METAL)?.id;
  const diamondId = masters?.find(
    (item) => item?.code === MASTERS?.DIAMOND
  )?.id;

  // State management for jobs
  const [jobData, setJobData] = useState<JobType[]>([]);
  console.log(jobData, "jobData");

  const [jobsLoading, setJobsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [manufacturerFilter, setManufacturerFilter] = useState<string | null>(
    null
  );

  // Unified Job Drawer State
  const [jobDrawerState, setJobDrawerState] = useState<JobDrawerState>({
    visible: false,
    mode: "create",
    editingJob: null,
  });

  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [isStatusUpdateModalVisible, setIsStatusUpdateModalVisible] =
    useState(false);
  const [isAdvancedFiltersVisible, setIsAdvancedFiltersVisible] =
    useState(false);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);

  const [form] = Form.useForm<JobFormValues>();
  const [statusForm] = Form.useForm();
  const [filtersForm] = Form.useForm();

  // Material selection states
  const [selectedMaterialTypes, setSelectedMaterialTypes] = useState<{
    [key: number]: string;
  }>({});

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    dueDateRange: null,
    costRange: [0, 10000],
    progressRange: [0, 100],
    createdDateRange: null,
    manufacturers: [],
    qualityRating: null,
    hasNotes: false,
    overdue: false,
  });

  const isClient = useIsClient();
  const { message, modal } = App.useApp();

  // Updated fetchJobs function with query parameters
  const fetchJobs = async (page = 1, pageSize = 10) => {
    setJobsLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
      };

      // Add filters to params
      if (manufacturerFilter && manufacturerFilter !== "all") {
        params.manufacturer = manufacturerFilter;
      }
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (priorityFilter && priorityFilter !== "all") {
        params.priority = priorityFilter;
      }

      const res: any = await apiGetJobs<{
        data: JobType[];
        total: number;
      }>(params);

      setJobData(res.data.data.rows || []);
      setPagination({
        current: res.data.data.page || 1,
        pageSize: res.data.data.limit || 10,
        total: res.data.data.count || 0,
      });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add useEffect to handle filter changes
  useEffect(() => {
    fetchJobs(1, pagination.pageSize); // Reset to page 1 when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturerFilter, statusFilter, priorityFilter]);

  // Unified Drawer Handlers
  const showCreateDrawer = () => {
    form.resetFields();
    setSelectedMaterialTypes({});
    setJobDrawerState({
      visible: true,
      mode: "create",
      editingJob: null,
    });
  };

  const showEditDrawer = (job: JobType) => {
    setSelectedMaterialTypes({});

    // Initialize material types based on existing materials
    const initialMaterialTypes: { [key: number]: string } = {};
    job.materials.forEach((material, index) => {
      if (material.material_name_id === metalId) {
        initialMaterialTypes[index] = metalId;
      } else if (material.material_name_id === diamondId) {
        initialMaterialTypes[index] = diamondId;
      }
    });
    setSelectedMaterialTypes(initialMaterialTypes);

    // Prefill form with job data including status
    form.setFieldsValue({
      product_name: job.product_name,
      customer_name: job.customer_name,
      status: job.status, // Added status field
      priority: job.priority,
      due_date: dayjs(job.due_date) as any,
      manufacturer_id: job.manufacturer_id,
      department: job.department,
      cost_estimate: job.cost_estimate,
      job_description: job.job_description,
      special_instructions: job.special_instructions,
      materials: job.materials,
    });

    setJobDrawerState({
      visible: true,
      mode: "edit",
      editingJob: job,
    });
  };

  const handleDrawerClose = () => {
    setJobDrawerState({
      visible: false,
      mode: "create",
      editingJob: null,
    });
    setSelectedMaterialTypes({});
    form.resetFields();
  };

  // Handle material type change for dynamic sub-type selection
  const handleMaterialTypeChange = (
    materialIndex: number,
    value: string,
    formInstance: any
  ) => {
    setSelectedMaterialTypes((prev) => ({
      ...prev,
      [materialIndex]: value,
    }));

    // Reset material_type_id when main type changes
    const materials = formInstance.getFieldValue("materials") || [];
    materials[materialIndex] = {
      ...materials[materialIndex],
      material_name_id: value,
      material_type_id: undefined,
    };
    formInstance.setFieldsValue({ materials });
  };

  // Material form item component
  const MaterialFormItem = ({
    fieldKey,
    name,
    restField,
    remove,
    formInstance,
  }: {
    fieldKey: number;
    name: number;
    restField: any;
    remove: (index: number) => void;
    formInstance: any;
  }) => {
    const currentMaterialType = selectedMaterialTypes[name];

    return (
      <div
        key={fieldKey}
        className="border border-gray-200 rounded-lg p-4 mb-4"
      >
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-medium">Material {name + 1}</h5>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              remove(name);
              // Clean up material type state
              setSelectedMaterialTypes((prev) => {
                const newState = { ...prev };
                delete newState[name];
                return newState;
              });
            }}
            aria-label="Remove material"
          />
        </div>

        <Row gutter={16}>
          {/* Material Type (Metal/Diamond) */}
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
                onChange={(value) =>
                  handleMaterialTypeChange(name, value, formInstance)
                }
              >
                <Option value={metalId}>Metal</Option>
                <Option value={diamondId}>Diamond</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Material Sub-Type */}
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

            {currentMaterialType === diamondId && (
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
          {/* Quantity/Weight based on material type */}
          {currentMaterialType === metalId && (
            <Col span={8}>
              <Form.Item
                {...restField}
                name={[name, "weight"]}
                label="Weight"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter weight"
                  step={0.01}
                  precision={2}
                  min={0}
                />
              </Form.Item>
            </Col>
          )}

          {currentMaterialType === diamondId && (
            <Col span={8}>
              <Form.Item
                {...restField}
                name={[name, "quantity"]}
                label="Quantity"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter quantity"
                  min={0}
                  step={1}
                  precision={0}
                />
              </Form.Item>
            </Col>
          )}

          {!currentMaterialType && (
            <Col span={8}>
              <Form.Item label="Quantity/Weight">
                <InputNumber
                  placeholder="Select material type first"
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Unit */}
          <Col span={8}>
            <Form.Item
              {...restField}
              name={[name, "unit_id"]}
              label="Unit"
              rules={[{ required: true, message: "Please select unit" }]}
            >
              <Select
                placeholder="Select unit"
                options={unitOptions}
                disabled={!currentMaterialType}
              />
            </Form.Item>
          </Col>

          {/* Notes */}
          <Col span={8}>
            <Form.Item {...restField} name={[name, "notes"]} label="Notes">
              <Input placeholder="Optional notes" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  const showDetailDrawer = (job: JobType) => {
    setSelectedJob(job);
    setIsDetailDrawerVisible(true);
  };

  const showStatusUpdateModal = (job: JobType) => {
    setSelectedJob(job);
    statusForm.setFieldsValue({
      status: job.status,
    });
    setIsStatusUpdateModalVisible(true);
  };

  const showAdvancedFilters = () => {
    setIsAdvancedFiltersVisible(true);
  };

  // Unified Job Submit Handler
  const handleJobSubmit = () => {
    form
      .validateFields()
      .then(async (values: JobFormValues) => {
        try {
          console.log(`${jobDrawerState.mode} form values:`, values);

          // Transform date to proper format
          const jobData = {
            ...values,
            cost_estimate: Number(values.cost_estimate) || 0,
            due_date: values.due_date
              ? dayjs(values.due_date).format("YYYY-MM-DD")
              : null,
          };

          console.log(jobData, "jobData-payload");

          if (jobDrawerState.mode === "create") {
            await apiCreateJob(jobData);
            message.success("Job created successfully!");
          } else {
            if (!jobDrawerState.editingJob?.id) {
              message.error("Job ID is missing");
              return;
            }
            await apiUpdateJob(jobDrawerState.editingJob.id, jobData);
            message.success("Job updated successfully!");
          }

          form.resetFields();
          setSelectedMaterialTypes({});
          setJobDrawerState({
            visible: false,
            mode: "create",
            editingJob: null,
          });

          // Refresh job list
          fetchJobs(pagination.current, pagination.pageSize);
        } catch (error: any) {
          console.error(`${jobDrawerState.mode} job error:`, error);
          message.error(
            error?.response?.data?.message ||
              `Failed to ${jobDrawerState.mode} job`
          );
        }
      })
      .catch((info: any) => {
        console.log("Validate Failed:", info);
      });
  };

  // Updated status update handler - only sends status field
  const handleStatusUpdate = () => {
    statusForm
      .validateFields()
      .then(async (values) => {
        try {
          if (!selectedJob?.id) {
            message.error("Job ID is missing");
            return;
          }

          // Only send status field
          const statusData = {
            status: values.status,
          };

          await apiUpdateJobStatus(selectedJob.id, statusData);
          message.success("Job status updated successfully!");

          setIsStatusUpdateModalVisible(false);
          statusForm.resetFields();
          setSelectedJob(null);

          // Refresh job list
          fetchJobs(pagination.current, pagination.pageSize);
        } catch (error: any) {
          console.error("Status update error:", error);
          message.error(
            error?.response?.data?.message || "Failed to update job status"
          );
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleDetailDrawerClose = () => {
    setIsDetailDrawerVisible(false);
    setSelectedJob(null);
  };

  const handleStatusCancel = () => {
    setIsStatusUpdateModalVisible(false);
    statusForm.resetFields();
    setSelectedJob(null);
  };

  const handleAdvancedFiltersClose = () => {
    setIsAdvancedFiltersVisible(false);
  };

  const handleAdvancedFiltersApply = () => {
    filtersForm
      .validateFields()
      .then((values) => {
        setAdvancedFilters(values);
        setIsAdvancedFiltersVisible(false);
        message.success("Advanced filters applied successfully!");
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleAdvancedFiltersReset = () => {
    const resetFilters: AdvancedFilters = {
      dueDateRange: null,
      costRange: [0, 10000],
      progressRange: [0, 100],
      createdDateRange: null,
      manufacturers: [],
      qualityRating: null,
      hasNotes: false,
      overdue: false,
    };
    setAdvancedFilters(resetFilters);
    filtersForm.setFieldsValue(resetFilters);
    message.success("Advanced filters reset successfully!");
  };

  // Updated Menu Click Handler
  const handleMenuClick = (action: string, record: JobType) => {
    switch (action) {
      case "view":
        showDetailDrawer(record);
        break;
      case "status":
        showStatusUpdateModal(record);
        break;
      case "edit":
        showEditDrawer(record);
        break;
      case "delete":
        modal.confirm({
          title: "Delete Job",
          content: "Are you sure you want to delete this job?",
          okText: "Yes",
          okType: "danger",
          cancelText: "No",
          onOk: async () => {
            try {
              await apiDeleteJob(record.id);
              message.success("Job deleted successfully");
              // Refresh job list
              fetchJobs(pagination.current, pagination.pageSize);
            } catch (error: any) {
              console.error("Delete job error:", error);
              message.error(
                error?.response?.data?.message || "Failed to delete job"
              );
            }
          },
        });
        break;
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Enhanced filter logic with advanced filters
  const filteredData = (jobData || []).filter((job: JobType) => {
    if (!job) return false;

    const searchLower = (searchText || "").toLowerCase();
    const jobId = job.id || "";
    const jobProduct = job.product_name || "";
    const jobCustomer = job.customer_name || "";
    const manufacturerName = job.manufacturerName || "";

    const matchesSearch =
      jobId.toLowerCase().includes(searchLower) ||
      jobProduct.toLowerCase().includes(searchLower) ||
      jobCustomer.toLowerCase().includes(searchLower) ||
      manufacturerName.toLowerCase().includes(searchLower);

    return matchesSearch;
  }) as JobType[];

  // Updated columns with proper status filters
  const columns: ColumnType<JobType>[] = [
    {
      title: "Job Code",
      dataIndex: "job_code",
      key: "job_code",
      sorter: (a: JobType, b: JobType) => a.job_code.localeCompare(b.job_code),
      width: 200,
    },
    {
      title: "Product",
      dataIndex: "product_name",
      key: "product_name",
      sorter: (a: JobType, b: JobType) =>
        a.product_name.localeCompare(b.product_name),
      width: 200,
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
      sorter: (a: JobType, b: JobType) =>
        a.customer_name.localeCompare(b.customer_name),
      width: 150,
    },
    {
      title: "Manufacturer",
      key: "manufacturer",
      render: (_, record: JobType) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="font-medium">{record.manufacturer_name}</span>
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        isClient ? (
          <Tag
            icon={getStatusIcon(status)}
            color={statusColors[status as keyof typeof statusColors]}
          >
            {status}
          </Tag>
        ) : (
          <span>{status}</span>
        ),
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "In Progress", value: "In Progress" },
        { text: "Completed", value: "Completed" },
        { text: "On Hold", value: "On Hold" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      width: 130,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) =>
        isClient ? (
          <Tag color={priorityColors[priority as keyof typeof priorityColors]}>
            {priority}
          </Tag>
        ) : (
          <span>{priority}</span>
        ),
      filters: [
        { text: "High", value: "High" },
        { text: "Medium", value: "Medium" },
        { text: "Low", value: "Low" },
      ],
      onFilter: (value: any, record: any) => record.priority === value,
      width: 100,
    },
    {
      title: "Cost",
      key: "cost",
      render: (_, record: JobType) => (
        <div className="text-sm">
          <div className="font-medium">
            Est: ${record.cost_estimate?.toLocaleString()}
          </div>
          {record.actualCost && (
            <div className="text-gray-500">
              Act: ${record.actualCost.toLocaleString()}
            </div>
          )}
        </div>
      ),
      sorter: (a: JobType, b: JobType) =>
        (a.cost_estimate || 0) - (b.cost_estimate || 0),
      width: 120,
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date: string) => formatDate(date),
      sorter: (a: JobType, b: JobType) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: JobType) => {
        const items = [
          {
            key: "view",
            label: "View Details",
            icon: <EyeOutlined />,
            onClick: () => handleMenuClick("view", record),
          },
          {
            key: "status",
            label: "Update Status",
            icon: <SyncOutlined />,
            onClick: () => handleMenuClick("status", record),
          },
          {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => handleMenuClick("edit", record),
          },
          {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleMenuClick("delete", record),
          },
        ];

        return (
          <Dropdown items={items} trigger={["click"]}>
            <Button
              variant="text"
              icon={<MoreOutlined />}
              aria-label="More actions"
            >
              <span className="sr-only">More actions</span>
            </Button>
          </Dropdown>
        );
      },
      width: 80,
      fixed: "right",
    },
  ];

  // Summary stats
  const totalJobs = filteredData.length;
  const activeJobs = filteredData.filter(
    (job) => job.status === "In Progress"
  ).length;
  const manufacturersCount = new Set(
    filteredData.map((job) => job.manufacturer_id).filter(Boolean)
  ).size;

  return (
    <div className="">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold">Jobs Management</h1>
          <p className="text-gray-600">
            Manage and track all jewelry production jobs via manufacturers
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <TeamOutlined className="text-blue-500" />
              <span>{manufacturersCount} Manufacturers</span>
            </div>
            <div className="flex items-center gap-1">
              <SyncOutlined className="text-orange-500" />
              <span>{activeJobs} Active</span>
            </div>
            <div className="flex items-center gap-1">
              <ToolOutlined className="text-green-500" />
              <span>{totalJobs} Total Jobs</span>
            </div>
          </div>
          <Button
            variant="primary"
            icon={<PlusOutlined />}
            onClick={showCreateDrawer}
          >
            Create New Job
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[250px]">
            <Search
              placeholder="Search jobs, customers, manufacturers..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              placeholder="Select manufacturer"
              allowClear
              style={{ width: 200 }}
              options={manufacturerOptions}
              onChange={(value: string) => setManufacturerFilter(value || null)}
              value={manufacturerFilter}
            />
            {/* Updated status filter options */}
            <Select
              placeholder="Select status"
              allowClear
              style={{ width: 200 }}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "Pending", label: "Pending" },
                { value: "In Progress", label: "In Progress" },
                { value: "Completed", label: "Completed" },
                { value: "On Hold", label: "On Hold" },
              ]}
              onChange={(value: string) => setStatusFilter(value || "all")}
              value={statusFilter}
            />
            <Select
              placeholder="Select priority"
              allowClear
              style={{ width: 150 }}
              options={[
                { value: "all", label: "All Priorities" },
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
              onChange={(value: string) => setPriorityFilter(value || "all")}
              value={priorityFilter}
            />
            <Button icon={<FilterOutlined />} onClick={showAdvancedFilters}>
              More Filters
            </Button>
          </div>
        </div>

        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: "all",
              label: `All Jobs (${totalJobs})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="id"
                  loading={jobsLoading}
                  scroll={{ x: 1500 }}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} jobs`,
                    onChange: (page, pageSize) => {
                      setPagination({
                        current: page,
                        pageSize,
                        total: pagination.total,
                      });
                      fetchJobs(page, pageSize);
                    },
                  }}
                />
              ),
            },
            {
              key: "inProgress",
              label: `In Progress (${activeJobs})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredData.filter(
                    (job) => job.status === "In Progress"
                  )}
                  rowKey="id"
                  loading={jobsLoading}
                  scroll={{ x: 1500 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Unified Job Drawer (Create/Edit) with Status Field */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            {jobDrawerState.mode === "create" ? (
              <PlusOutlined className="text-blue-500" />
            ) : (
              <EditOutlined className="text-blue-500" />
            )}
            <span>
              {jobDrawerState.mode === "create"
                ? "Create New Job"
                : `Edit Job - ${jobDrawerState.editingJob?.id}`}
            </span>
          </div>
        }
        open={jobDrawerState.visible}
        onClose={handleDrawerClose}
        width={900}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="default" onClick={handleDrawerClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => form.submit()}>
              {jobDrawerState.mode === "create" ? "Create Job" : "Update Job"}
            </Button>
          </div>
        }
      >
        <div className="pb-6">
          <Form
            form={form}
            layout="vertical"
            name="job_form"
            onFinish={handleJobSubmit}
            className=""
            initialValues={{
              priority: "Medium",
              status: "Pending", // Added default status
              materials: [],
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="product_name"
                  label="Product Name"
                  rules={[
                    { required: true, message: "Please enter product name" },
                  ]}
                >
                  <Input placeholder="e.g., Diamond Ring, Gold Necklace" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="customer_name"
                  label="Customer Name"
                  rules={[
                    { required: true, message: "Please enter customer name" },
                  ]}
                >
                  <Input placeholder="Customer name" />
                </Form.Item>
              </Col>
            </Row>

            {/* Added Status Field Row */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select job status">
                    <Option value="Pending">Pending</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Completed">Completed</Option>
                    <Option value="On Hold">On Hold</Option>
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
                  <Select>
                    <Option value="High">High</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="Low">Low</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="due_date"
                  label="Due Date"
                  rules={[
                    { required: true, message: "Please select due date" },
                  ]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cost_estimate"
                  label="Cost Estimate ($)"
                  rules={[
                    { required: true, message: "Please enter cost estimate" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    prefix="$"
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="manufacturer_id"
                  label="Select Manufacturer"
                  rules={[
                    { required: true, message: "Please select a manufacturer" },
                  ]}
                >
                  <Select
                    options={manufacturerOptions}
                    placeholder="Choose a manufacturer partner"
                    size="middle"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="job_description"
              label="Job Description"
              rules={[
                { required: true, message: "Please enter job description" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Enter job details, specifications, and requirements"
              />
            </Form.Item>

            <Form.Item name="special_instructions" label="Special Instructions">
              <TextArea
                rows={2}
                placeholder="Any special instructions or notes for this job..."
              />
            </Form.Item>

            {/* Materials Section */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">
                  Materials Required
                </h4>
                <Button
                  onClick={() => {
                    const materials = form.getFieldValue("materials") || [];
                    const newIndex = materials.length;
                    form.setFieldsValue({
                      materials: [
                        ...materials,
                        {
                          material_name_id: "",
                          material_type_id: "",
                          unit_id: "",
                          quantity: 1,
                          weight: 0,
                          notes: "",
                        },
                      ],
                    });
                    // Set default material type for new material
                    setSelectedMaterialTypes((prev) => ({
                      ...prev,
                      [newIndex]: metalId || "",
                    }));
                  }}
                  icon={<PlusOutlined />}
                >
                  Add Material
                </Button>
              </div>

              <Form.List name="materials">
                {(fields, { add, remove }) => (
                  <div className="space-y-4">
                    {fields.map(({ key, name, ...restField }) => (
                      <MaterialFormItem
                        key={key}
                        fieldKey={key}
                        name={name}
                        restField={restField}
                        remove={remove}
                        formInstance={form}
                      />
                    ))}
                    {fields.length === 0 && (
                      <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <ToolOutlined className="text-2xl mb-2 text-gray-400" />
                        <p>No materials added yet.</p>
                        <p className="text-sm">
                          {`  Click "Add Material" to specify required materials for
                          this job.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Form.List>
            </div>

            {/* Design Files Section */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Design Files</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Upload CAD files, images, or other design documents (Max file
                  size: 10MB)
                </p>
                <Form.Item
                  name="designFiles"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                  noStyle
                >
                  <Upload.Dragger
                    name="designFiles"
                    multiple={true}
                    accept=".jpg,.jpeg,.png,.pdf,.dwg,.dxf,.stl,.step,.stp,.3dm,.obj"
                    action="/api/upload"
                    listType="picture-card"
                    beforeUpload={(file) => {
                      const isLt10M = file.size / 1024 / 1024 < 10;
                      if (!isLt10M) {
                        message.error("File must be smaller than 10MB!");
                        return Upload.LIST_IGNORE;
                      }
                      return true;
                    }}
                    onChange={({ file, fileList }) => {
                      if (file.status === "done") {
                        message.success(
                          `${file.name} file uploaded successfully`
                        );
                      } else if (file.status === "error") {
                        message.error(`${file.name} file upload failed.`);
                      }
                    }}
                  >
                    <div className="p-4">
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined className="text-2xl text-blue-500" />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag files to this area to upload
                      </p>
                      <p className="ant-upload-hint text-xs">
                        Supported formats: JPG, PNG, PDF, DWG, DXF, STL, STEP,
                        3DM, OBJ
                      </p>
                    </div>
                  </Upload.Dragger>
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </Drawer>

      {/* Job Detail Drawer - Display job details */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <span>Job Details - {selectedJob?.id}</span>
          </div>
        }
        open={isDetailDrawerVisible}
        onClose={handleDetailDrawerClose}
        width={900}
        footer={
          <div className="flex justify-end gap-3">
            <Button key="close" onClick={handleDetailDrawerClose}>
              Close
            </Button>
          </div>
        }
      >
        {selectedJob && (
          <div className="space-y-6 pb-6">
            {/* Job Overview */}
            <Card title="Job Overview" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Product"
                    value={selectedJob.product_name}
                    prefix={<ToolOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Customer"
                    value={selectedJob.customer_name}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Status"
                    value={selectedJob.status}
                    prefix={getStatusIcon(selectedJob.status)}
                    valueStyle={{
                      color:
                        statusColors[
                          selectedJob.status as keyof typeof statusColors
                        ] === "green"
                          ? "#3f8600"
                          : "#1890ff",
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Priority"
                    value={selectedJob.priority}
                    valueStyle={{
                      color:
                        selectedJob.priority === "High"
                          ? "#cf1322"
                          : selectedJob.priority === "Medium"
                          ? "#d48806"
                          : "#389e0d",
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Progress"
                    value={selectedJob.progress}
                    suffix="%"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Due Date"
                    value={new Date(selectedJob.due_date).toLocaleDateString()}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Cost Estimate"
                    value={selectedJob.cost_estimate}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${value?.toLocaleString()}`}
                  />
                </Col>
              </Row>
            </Card>

            {/* Materials */}
            <Card title="Materials Required" size="small">
              <List
                itemLayout="horizontal"
                dataSource={selectedJob.materials}
                renderItem={(material) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div className="flex items-center gap-2">
                          <ToolOutlined className="text-blue-500" />
                          <span>
                            {material.materialNameData?.name ||
                              material.material_name_id}{" "}
                            -{" "}
                            {material.materialTypeData?.name ||
                              material.material_type_id}
                          </span>
                        </div>
                      }
                      description={
                        <div>
                          <span className="font-medium">
                            {material.weight
                              ? `Weight: ${material.weight}`
                              : `Quantity: ${material.quantity}`}{" "}
                            {material.unitData?.name || material.unit_id}
                          </span>
                          {material.notes && (
                            <span className="ml-4 text-gray-500">
                              Notes: {material.notes}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Drawer>

      {/* Simplified Status Update Modal - Only Status Field */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <SyncOutlined className="text-blue-500" />
            <span>Update Job Status - {selectedJob?.id}</span>
          </div>
        }
        open={isStatusUpdateModalVisible}
        onOk={handleStatusUpdate}
        onCancel={handleStatusCancel}
        width={500}
        okText="Update Status"
      >
        {selectedJob && (
          <Form form={statusForm} layout="vertical" className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Current Status</h4>
              <div className="flex items-center gap-4">
                <Tag
                  icon={getStatusIcon(selectedJob.status)}
                  color={
                    statusColors[
                      selectedJob.status as keyof typeof statusColors
                    ]
                  }
                  className="px-3 py-1"
                >
                  {selectedJob.status}
                </Tag>
              </div>
            </div>

            <Form.Item
              name="status"
              label="New Status"
              rules={[{ required: true, message: "Please select a status" }]}
            >
              <Select size="large" placeholder="Select new status">
                <Option value="Pending">
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    <span>Pending</span>
                  </div>
                </Option>
                <Option value="In Progress">
                  <div className="flex items-center gap-2">
                    <SyncOutlined />
                    <span>In Progress</span>
                  </div>
                </Option>
                <Option value="Completed">
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined />
                    <span>Completed</span>
                  </div>
                </Option>
                <Option value="On Hold">
                  <div className="flex items-center gap-2">
                    <PauseCircleOutlined />
                    <span>On Hold</span>
                  </div>
                </Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Advanced Filters Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <FilterOutlined className="text-blue-500" />
            <span>Advanced Filters</span>
          </div>
        }
        open={isAdvancedFiltersVisible}
        onClose={handleAdvancedFiltersClose}
        width={500}
        footer={
          <div className="flex justify-between">
            <Button variant="default" onClick={handleAdvancedFiltersReset}>
              Reset Filters
            </Button>
            <Space>
              <Button variant="default" onClick={handleAdvancedFiltersClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdvancedFiltersApply}>
                Apply Filters
              </Button>
            </Space>
          </div>
        }
      >
        <div className="pb-6">
          <Form
            form={filtersForm}
            layout="vertical"
            initialValues={advancedFilters}
            className="space-y-4"
          >
            <Collapse
              defaultActiveKey={["dates", "values", "assignments"]}
              items={[
                {
                  key: "dates",
                  label: "Date Filters",
                  children: (
                    <div className="space-y-4">
                      <Form.Item name="dueDateRange" label="Due Date Range">
                        <RangePicker className="w-full" />
                      </Form.Item>

                      <Form.Item
                        name="createdDateRange"
                        label="Created Date Range"
                      >
                        <RangePicker className="w-full" />
                      </Form.Item>

                      <Form.Item name="overdue" valuePropName="checked">
                        <Checkbox>Show only overdue jobs</Checkbox>
                      </Form.Item>
                    </div>
                  ),
                },
                {
                  key: "values",
                  label: "Value & Progress Filters",
                  children: (
                    <div className="space-y-4">
                      <Form.Item name="costRange" label="Cost Range ($)">
                        <Slider
                          range
                          min={0}
                          max={10000}
                          step={100}
                          marks={{
                            0: "$0",
                            2500: "$2.5K",
                            5000: "$5K",
                            7500: "$7.5K",
                            10000: "$10K+",
                          }}
                          tooltip={{
                            formatter: (value) => `$${value?.toLocaleString()}`,
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="progressRange"
                        label="Progress Range (%)"
                      >
                        <Slider
                          range
                          min={0}
                          max={100}
                          marks={{
                            0: "0%",
                            25: "25%",
                            50: "50%",
                            75: "75%",
                            100: "100%",
                          }}
                          tooltip={{
                            formatter: (value) => `${value}%`,
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="qualityRating"
                        label="Minimum Quality Rating"
                      >
                        <Radio.Group>
                          <Radio value={undefined}>Any Rating</Radio>
                          <Radio value={4}>4+ Stars</Radio>
                          <Radio value={4.5}>4.5+ Stars</Radio>
                          <Radio value={5}>5 Stars Only</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </div>
                  ),
                },
                {
                  key: "assignments",
                  label: "Manufacturers & Notes",
                  children: (
                    <div className="space-y-4">
                      <Form.Item name="manufacturers" label="Manufacturers">
                        <Checkbox.Group
                          options={manufacturerData.map((manufacturer) => ({
                            label: manufacturer.name,
                            value: manufacturer.id,
                          }))}
                        />
                      </Form.Item>

                      <Form.Item name="hasNotes" valuePropName="checked">
                        <Checkbox>Has notes or special instructions</Checkbox>
                      </Form.Item>
                    </div>
                  ),
                },
              ]}
            />
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

const JobsPage = () => {
  return (
    <App>
      <JobsPageContent />
    </App>
  );
};

export default JobsPage;
