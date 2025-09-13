"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSubMasterOptions } from "@/hooks/useSubMasterOptions";
import { useVendorsManufacturers } from "@/hooks/useVendorsManufacturers";
import {
  apiCreateRawMaterial,
  apiDeleteRawMaterial,
  apiGetStock,
  apiGetTransections,
  apiUpdateRawMaterial,
} from "@/services/ProjectService";
import { useAppSelector } from "@/store/hooks";
import { Button, Card, Col } from "@/ui";
import { Table } from "@/ui/data-display";
import { Input } from "@/ui/forms";
import { TextArea } from "@/ui/forms/Input";
import Search from "@/ui/forms/Search";
import { Tabs } from "@/ui/navigation";
import { Drawer } from "@/ui/overlay";
import { formatDate } from "@/utils/formatDate";
import { MASTERS } from "@/utils/master";
import {
  DeleteOutlined,
  FilterOutlined,
  GoldOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Checkbox,
  DatePicker,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

const { Option } = Select;
const { RangePicker } = DatePicker;

// Stock interface (previously RawMaterial)
interface Stock {
  last_updated_at: number;
  vendor_names: string;
  vendor_name: string;
  unit_id: string;
  material_type_id: string;
  material_name_id: string;
  updated_at: number;
  id: string;
  material_name: string;
  material_type: string;
  unit: string;
  vendor_id: string;
  quantity: number;
  total_weight?: number;
  weight: number;
  status?: number;
  description?: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  createdAt?: string;
  updatedAt?: string;
  materialNameData?: { name: string };
  materialTypeData?: { name: string };
  unitData?: { name: string };
  vendorData?: { vendorName: string };
}

// Transaction interface
interface Transaction {
  weight: number | null | string;
  material_name: string;
  id: string;
  materialId: string;
  type: string;
  quantity: number;
  date: string;
  reference?: string;
  notes?: string;
  costPerUnit?: number;
  created_at?: string;
  updated_at?: string;
  material_id?: string;
  transaction_type?: string;
  total_cost?: number;
  user_id?: string;
  materialData?: {
    name: string;
    type: string;
  };
}

const statuses = [
  { value: 1, label: "In Stock" },
  { value: 2, label: "Low Stock" },
  { value: 3, label: "Out of Stock" },
  { value: 4, label: "On Order" },
];

// Unit conversion rates to grams
const UNIT_TO_GRAMS = {
  gram: 1,
  "kilo gram": 1000,
  kilogram: 1000,
  "mili gram": 0.001,
  milligram: 0.001,
  carat: 0.2, // 1 carat = 0.2 grams
};

export default function RawMaterialsPage() {
  const metalTypeOptions = useSubMasterOptions(MASTERS.METAL);
  const diamondTypeOptions = useSubMasterOptions(MASTERS.DIAMOND);
  const unitOptions = useSubMasterOptions(MASTERS.UNITOFMEASURE);
  const { vendorOptions } = useVendorsManufacturers();

  // Stock State (previously Raw Materials)
  const [stockData, setStockData] = useState<Stock[]>([]);

  const [stockLoading, setStockLoading] = useState(false);
  const [stockPagination, setStockPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsPagination, setTransactionsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isAddMaterialDrawerOpen, setIsAddMaterialDrawerOpen] = useState(false);
  const [isTransactionDrawerOpen, setIsTransactionDrawerOpen] = useState(false);
  const [isMoreFiltersDrawerOpen, setIsMoreFiltersDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("materials");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Stock | null>(null);

  const masters = useAppSelector((state) => state.user.masters);

  const metalId = masters?.find((item) => item?.code === MASTERS?.METAL)?.id;
  const diamodId = masters?.find((item) => item?.code === MASTERS?.DIAMOND)?.id;

  const [selectedMainType, setSelectedMainType] = useState<string>("");

  const [advancedFilters, setAdvancedFilters] = useState({
    vendorFilter: "all",
    stockRange: [0, 2000],
    lastUpdatedRange: null as any,
    selectedVendors: [] as string[],
    showLowStockOnly: false,
    showOutOfStockOnly: false,
  });

  const [form] = Form.useForm();
  const [transactionForm] = Form.useForm();
  const [filtersForm] = Form.useForm();

  const {} = useAuth();

  // Filtered unit options based on material type
  const filteredUnitOptions = useMemo(() => {
    if (selectedMainType === metalId) {
      // For Metal: exclude Carat
      return unitOptions.filter((unit) => unit.label.toLowerCase() !== "carat");
    }
    // For Diamond or other types: show all units
    return unitOptions;
  }, [unitOptions, selectedMainType, metalId]);

  // Helper function to convert weight to grams
  const convertToGrams = (weight: number, unitLabel: string): number => {
    const unitKey = unitLabel.toLowerCase().replace(/\s+/g, " ");
    const conversionRate =
      UNIT_TO_GRAMS[unitKey as keyof typeof UNIT_TO_GRAMS] || 1;
    return weight * conversionRate;
  };

  // Helper function to get unit label by ID
  const getUnitLabelById = (unitId: string): string => {
    const unit = unitOptions.find((u) => u.value === unitId);
    return unit?.label || "gram";
  };

  // Fetch Stock Data (previously Raw Materials)
  const fetchStockData = async (page = 1, pageSize = 10) => {
    setStockLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
      };
      const res: any = await apiGetStock<{
        data: Stock[];
        total: number;
      }>(params);

      setStockData(res.data.data.rows || []);
      setStockPagination({
        current: res.data.data.page,
        pageSize: res.data.data.limit,
        total: res.data.data.total || 0,
      });
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to fetch stock data"
      );
    } finally {
      setStockLoading(false);
    }
  };

  // Fetch Transactions
  const fetchTransactions = async (
    page = 1,
    pageSize = 10,
    additionalParams = {}
  ) => {
    setTransactionsLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        ...additionalParams,
      };
      const res: any = await apiGetTransections<{
        data: Transaction[];
        total: number;
      }>(params);
      setTransactions(res.data.data.rows || []);
      setTransactionsPagination({
        current: page,
        pageSize,
        total: res.data.data.total || 0,
      });
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to fetch transactions"
      );
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(stockPagination.current, stockPagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "materials") {
      fetchStockData(stockPagination.current, stockPagination.pageSize);
    } else if (key === "transactions") {
      fetchTransactions(
        transactionsPagination.current,
        transactionsPagination.pageSize
      );
    }
  };

  const showAddMaterialDrawer = () => {
    setIsEditMode(false);
    setEditingMaterial(null);
    setSelectedMainType(metalId || "");
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      is_active: true,
      quantity: 0,
      weight: 0,
      material_name_id: metalId,
    });
    setIsAddMaterialDrawerOpen(true);
  };

  const showEditMaterialDrawer = (material: Stock) => {
    setIsEditMode(true);
    setEditingMaterial(material);

    // Determine main type based on material_name (master type)
    if (material.material_name_id === metalId) {
      setSelectedMainType(metalId);
    } else if (material.material_name_id === diamodId) {
      setSelectedMainType(diamodId);
    }

    form.setFieldsValue({
      material_name_id: material.material_name_id,
      material_type_id: material.material_type_id,
      unit_id: material.unit_id,
      vendor_id: material.vendor_id,
      quantity: material.quantity,
      weight: material.weight,
      status: material.status,
      description: material.description,
      is_active: material.is_active,
    });

    setIsAddMaterialDrawerOpen(true);
  };

  const showMoreFiltersDrawer = () => {
    filtersForm.setFieldsValue(advancedFilters);
    setIsMoreFiltersDrawerOpen(true);
  };

  const handleAddMaterial = async () => {
    try {
      const values = await form.validateFields();

      let finalWeight = values.weight || 0;

      // If material type is Metal, convert weight to grams
      if (selectedMainType === metalId && values.unit_id && values.weight) {
        const unitLabel = getUnitLabelById(values.unit_id);
        finalWeight = convertToGrams(values.weight, unitLabel);

        console.log(
          `Converting ${values.weight} ${unitLabel} to ${finalWeight} grams`
        );
      }

      const payload = {
        material_name_id: values.material_name_id,
        material_type_id: values.material_type_id,
        unit_id: values.unit_id,
        vendor_id: values.vendor_id,
        quantity: values.quantity || 0,
        weight: finalWeight, // Use converted weight
        status: values.status,
        description: values.description,
        is_active: values.is_active !== undefined ? values.is_active : true,
      };

      if (isEditMode && editingMaterial) {
        await apiUpdateRawMaterial(editingMaterial.id, payload);
        message.success("Material updated successfully");
      } else {
        await apiCreateRawMaterial(payload);
        message.success("Material added successfully");
      }

      handleAddMaterialCancel();
      // Refresh stock data after creating/updating
      fetchStockData(stockPagination.current, stockPagination.pageSize);
    } catch (error: any) {
      console.log("Error:", error);
      message.error(error?.response?.data?.message || "Failed to add material");
    }
  };

  const handleTransactionSubmit = async () => {
    try {
      const values = await transactionForm.validateFields();
      const submissionData = {
        ...values,
        date: values.date ? values.date.format("YYYY-MM-DD") : null,
      };

      // If you have a create transaction API, call it here
      // await apiCreateTransaction(submissionData);

      message.success("Transaction recorded successfully");
      transactionForm.resetFields();
      setIsTransactionDrawerOpen(false);

      // Refresh transactions list if we're on the transactions tab
      if (activeTab === "transactions") {
        fetchTransactions(
          transactionsPagination.current,
          transactionsPagination.pageSize
        );
      }
      // Also refresh stock data as transactions might affect stock levels
      fetchStockData(stockPagination.current, stockPagination.pageSize);
    } catch (error) {
      console.log("Validate Failed:", error);
      message.error("Failed to record transaction");
    }
  };

  const handleAddMaterialCancel = () => {
    form.resetFields();
    setSelectedMainType("");
    setIsAddMaterialDrawerOpen(false);
    setIsEditMode(false);
    setEditingMaterial(null);
  };

  const handleTransactionCancel = () => {
    transactionForm.resetFields();
    setIsTransactionDrawerOpen(false);
  };

  const handleMoreFiltersApply = async () => {
    try {
      const values = await filtersForm.validateFields();
      setAdvancedFilters(values);
      setIsMoreFiltersDrawerOpen(false);
      message.success("Filters applied successfully");
    } catch (error) {
      console.log("Filter validation failed:", error);
    }
  };

  const handleMoreFiltersReset = () => {
    const resetFilters = {
      vendorFilter: "all",
      stockRange: [0, 2000],
      lastUpdatedRange: null,
      selectedVendors: [],
      showLowStockOnly: false,
      showOutOfStockOnly: false,
    };
    setAdvancedFilters(resetFilters);
    filtersForm.setFieldsValue(resetFilters);
    message.success("Filters reset successfully");
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await apiDeleteRawMaterial(id);
      message.success("Material deleted successfully");
      // Refresh stock data after deletion
      fetchStockData(stockPagination.current, stockPagination.pageSize);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to delete material"
      );
    }
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    console.log("Selected date range:", dateStrings);
    setDateRange(dateStrings[0] && dateStrings[1] ? dateStrings : null);

    // Refetch transactions with date filter
    if (dateStrings[0] && dateStrings[1]) {
      fetchTransactions(1, transactionsPagination.pageSize, {
        startDate: dateStrings[0],
        endDate: dateStrings[1],
      });
    } else {
      fetchTransactions(1, transactionsPagination.pageSize);
    }
  };

  const handleMainTypeChange = (value: string) => {
    setSelectedMainType(value);
    form.setFieldValue("material_type_id", undefined);
    form.setFieldValue("unit_id", undefined); // Reset unit when material type changes
    form.setFieldValue("weight", 0);
    form.setFieldValue("quantity", 0);
  };

  // Handle unit change to clear weight/quantity when unit changes
  const handleUnitChange = () => {
    form.setFieldValue("weight", 0);
    form.setFieldValue("quantity", 0);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "success";
      case 2:
        return "warning";
      case 3:
        return "error";
      case 4:
        return "processing";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: number) => {
    const statusOption = statuses.find((s) => s.value === status);
    return statusOption?.label || "Unknown";
  };

  // Updated column definitions for stock data
  const stockColumns = [
    {
      title: "Material Type",
      key: "materialName",
      render: (record: Stock) => (
        <div className="flex items-center">
          <GoldOutlined className="mr-2 text-yellow-500" />
          {record.materialNameData?.name || record.material_name}
        </div>
      ),
      sorter: (a: Stock, b: Stock) =>
        (a.materialNameData?.name || a.material_name).localeCompare(
          b.materialNameData?.name || b.material_name
        ),
    },
    {
      title: "Material Name",
      key: "materialType",
      render: (record: Stock) =>
        record.materialTypeData?.name || record.material_type,
    },
    {
      title: "Stock",
      key: "stock",
      render: (record: Stock) => {
        const percent = Math.min((record.quantity / 100) * 100, 100);
        let status: "success" | "active" | "exception" = "success";

        if (record.status === 3) {
          status = "exception";
        } else if (record.status === 2) {
          status = "active";
        }

        return (
          <div>
            <div className="font-medium">
              {record.quantity} {record.unitData?.name || record.unit}
            </div>
            <div className="text-xs text-gray-500">
              Weight: {record.total_weight} grams
            </div>
            <div className="w-full">
              {typeof window !== "undefined" && (
                <Progress
                  percent={percent}
                  size={["100%", 6]}
                  showInfo={false}
                  status={status}
                  className="m-0"
                />
              )}
            </div>
          </div>
        );
      },
      sorter: (a: Stock, b: Stock) => a.quantity - b.quantity,
    },
    {
      title: "Vendor",
      key: "vendor_names",
      render: (record: Stock) => record.vendor_names || "",
    },
    {
      title: "Status",
      key: "status",
      render: (record: Stock) => {
        const color = getStatusColor(record.status || 1);
        const label = getStatusLabel(record.status || 1);
        return typeof window !== "undefined" ? (
          <Tag color={color}>{label}</Tag>
        ) : null;
      },
      filters: statuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value: any, record: Stock) => record.status === value,
    },
    {
      title: "Last Updated",
      dataIndex: "last_updated_at",
      key: "last_updated_at",
      render: (date: string) => formatDate(date),
      sorter: (a: Stock, b: Stock) =>
        new Date(a.last_updated_at || 0).getTime() -
        new Date(b.last_updated_at || 0).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Stock) => (
        <Space>
          <Popconfirm
            title="Are you sure to delete this material?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteMaterial(record.id)}
          >
            <Button
              variant="default"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: "Date",
      key: "created_at",
      render: (record: Transaction) => {
        return formatDate(record.created_at);
      },
      sorter: (a: Transaction, b: Transaction) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Material",
      key: "material",
      render: (record: Transaction) => {
        const material = stockData.find(
          (m) => m.id === (record.materialId || record.material_id)
        );
        return material
          ? material.materialNameData?.name || material.material_name
          : record.materialData?.name ||
              record.materialId ||
              record.material_id;
      },
    },
    {
      title: "Type",
      key: "type",
      render: (record: Transaction) => {
        const transactionType = record.transaction_type;
        return (
          <Tag color={transactionType === "IN" ? "green" : "red"}>
            {transactionType}
          </Tag>
        );
      },
    },
    {
      title: "Quantity/Weight",
      key: "quantity",
      render: (record: Transaction) => (
        <div
          className={`${
            record.quantity > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {record.material_name === "Metal" ? record.weight : record.quantity}
        </div>
      ),
      sorter: (a: Transaction, b: Transaction) => a.quantity - b.quantity,
    },
    {
      title: "Notes",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
  ];

  const filteredMaterials = stockData?.filter((material) => {
    const materialName = material.material_name || "";
    const materialType = material.material_type || "";
    const vendorName = material.vendor_names || "";

    const matchesSearch =
      material?.id?.toLowerCase().includes(searchText.toLowerCase()) ||
      materialName?.toLowerCase().includes(searchText.toLowerCase()) ||
      vendorName?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || material.status?.toString() === statusFilter;
    const matchesType = typeFilter === "all" || materialType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold">Stock & Inventory Management</h1>
          <p className="text-gray-500">
            Manage and track all stock inventory and transactions
          </p>
        </div>
        <Space>
          <Button
            variant="primary"
            icon={<PlusOutlined />}
            onClick={showAddMaterialDrawer}
          >
            Add Material
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="materials"
          onChange={handleTabChange}
          items={[
            {
              key: "materials",
              label: "Stock Materials",
              children: (
                <>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex-1 min-w-[250px]">
                      <Search
                        placeholder="Search stock materials..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={(value) => setSearchText(value)}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Select
                        placeholder="Filter by Status"
                        allowClear
                        style={{ width: 150 }}
                        onChange={(value) => setStatusFilter(value || "all")}
                      >
                        <Option value="all">All Statuses</Option>
                        {statuses.map((status) => (
                          <Option
                            key={status.value}
                            value={status.value.toString()}
                          >
                            {status.label}
                          </Option>
                        ))}
                      </Select>
                      <Button
                        icon={<FilterOutlined />}
                        onClick={showMoreFiltersDrawer}
                      >
                        More Filters
                      </Button>
                    </div>
                  </div>

                  <Table
                    columns={stockColumns}
                    dataSource={filteredMaterials}
                    rowKey="id"
                    loading={stockLoading}
                    scroll={{ x: 1300 }}
                    pagination={{
                      current: stockPagination.current,
                      pageSize: stockPagination.pageSize,
                      total: stockPagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (
                        total: number,
                        [from, to]: [number, number]
                      ) => {
                        return (
                          <span>
                            {from}-{to} of {total} stock items
                          </span>
                        );
                      },
                      onChange: (page, pageSize) => {
                        setStockPagination({
                          current: page,
                          pageSize,
                          total: stockPagination.total,
                        });
                        fetchStockData(page, pageSize);
                      },
                    }}
                  />
                </>
              ),
            },
            {
              key: "transactions",
              label: "Transactions",
              children: (
                <>
                  <div className="flex justify-end items-center mb-2">
                    <DatePicker.RangePicker
                      onChange={handleDateRangeChange}
                      value={
                        dateRange
                          ? [dayjs(dateRange[0]), dayjs(dateRange[1])]
                          : null
                      }
                    />
                  </div>

                  <Table
                    columns={transactionColumns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={transactionsLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      current: transactionsPagination.current,
                      pageSize: transactionsPagination.pageSize,
                      total: transactionsPagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (
                        total: number,
                        [from, to]: [number, number]
                      ) => (
                        <span>
                          {from}-{to} of {total} transactions
                        </span>
                      ),
                      onChange: (page, pageSize) => {
                        setTransactionsPagination({
                          current: page,
                          pageSize,
                          total: transactionsPagination.total,
                        });
                        fetchTransactions(page, pageSize);
                      },
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* Add Material Drawer */}
      <Drawer
        title={isEditMode ? "Edit Stock Material" : "Add New Stock Material"}
        open={isAddMaterialDrawerOpen}
        onClose={handleAddMaterialCancel}
        width={800}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleAddMaterialCancel}>Cancel</Button>
            <Button variant="primary" onClick={handleAddMaterial}>
              {isEditMode ? "Update Material" : "Save Material"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          name="material_form"
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="material_name_id"
                label="Material Type"
                rules={[
                  { required: true, message: "Please select material type" },
                ]}
              >
                <Select
                  placeholder="Select material type"
                  onChange={handleMainTypeChange}
                  defaultValue={metalId}
                >
                  <Option value={metalId}>Metal</Option>
                  <Option value={diamodId}>Diamond</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              {selectedMainType === metalId && (
                <Form.Item
                  name="material_type_id"
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

              {selectedMainType === diamodId && (
                <Form.Item
                  name="material_type_id"
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unit_id"
                label="Unit"
                rules={[{ required: true, message: "Please select unit" }]}
              >
                <Select
                  placeholder="Select unit"
                  options={filteredUnitOptions}
                  onChange={handleUnitChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {selectedMainType === metalId && (
                <Form.Item
                  name="weight"
                  label="Weight"
                  rules={[{ required: true, type: "number", min: 0 }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter weight"
                    step={0.01}
                    precision={2}
                    type="number"
                    min={0}
                    addonAfter={
                      form.getFieldValue("unit_id")
                        ? getUnitLabelById(form.getFieldValue("unit_id"))
                        : "Unit"
                    }
                  />
                </Form.Item>
              )}

              {selectedMainType === diamodId && (
                <Form.Item
                  name="quantity"
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
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="vendor_id"
                label="Vendor/Supplier"
                rules={[{ required: true, message: "Please select vendor" }]}
              >
                <Select
                  placeholder="Select vendor/supplier"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      ?.toLowerCase()
                      ?.includes(input.toLowerCase())
                  }
                  options={vendorOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Select status" defaultValue={1}>
                  {statuses.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="Active Status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Any additional notes about this material"
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Advanced Filters Drawer */}
      <Drawer
        title="Advanced Filters"
        open={isMoreFiltersDrawerOpen}
        onClose={() => setIsMoreFiltersDrawerOpen(false)}
        width={500}
        footer={
          <div className="flex justify-between">
            <Button onClick={handleMoreFiltersReset}>Reset Filters</Button>
            <div className="flex gap-2">
              <Button onClick={() => setIsMoreFiltersDrawerOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleMoreFiltersApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        }
      >
        <Form
          form={filtersForm}
          layout="vertical"
          name="filters_form"
          initialValues={advancedFilters}
        >
          <Form.Item name="stockRange" label="Stock Range">
            <Slider
              range
              min={0}
              max={2000}
              marks={{
                0: "0",
                500: "500",
                1000: "1000",
                1500: "1500",
                2000: "2000+",
              }}
              tooltip={{ formatter: (value) => `${value} units` }}
            />
          </Form.Item>

          <Form.Item name="lastUpdatedRange" label="Last Updated">
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="showLowStockOnly" valuePropName="checked">
            <Checkbox>Show only low stock items</Checkbox>
          </Form.Item>

          <Form.Item name="showOutOfStockOnly" valuePropName="checked">
            <Checkbox>Show only out of stock items</Checkbox>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Transaction Drawer */}
      <Drawer
        title="Record Material Transaction"
        open={isTransactionDrawerOpen}
        onClose={handleTransactionCancel}
        width={600}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleTransactionCancel}>Cancel</Button>
            <Button variant="primary" onClick={handleTransactionSubmit}>
              Record Transaction
            </Button>
          </div>
        }
      >
        <Form
          form={transactionForm}
          layout="vertical"
          name="transaction_form"
          initialValues={{
            type: "Incoming",
            date: dayjs(),
            quantity: 1,
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="type"
                label="Transaction Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Incoming">Incoming Stock</Option>
                  <Option value="Consumption">Consumption</Option>
                  <Option value="Adjustment">Adjustment</Option>
                  <Option value="Return">Return</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="materialId"
                label="Material"
                rules={[
                  { required: true, message: "Please select a material" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Select material"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      ?.toLowerCase()
                      ?.includes(input.toLowerCase())
                  }
                  options={stockData.map((material) => ({
                    value: material.id,
                    label: `${
                      material.materialNameData?.name || material.material_name
                    } (${material.id})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="reference" label="Reference">
                <Input placeholder="PO #, Job #, etc." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="costPerUnit" label="Cost per Unit">
                <InputNumber
                  min={0}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value?.replace(/\$\s?|(,*)/g, "") || ("" as any)
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <TextArea
              rows={3}
              placeholder="Any additional notes about this transaction"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
