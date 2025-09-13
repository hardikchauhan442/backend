"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLocationData } from "@/hooks/useLocationData";
import {
  apiCreateManufacturer,
  apiCreateVendor,
  apiDeleteManufacturer,
  apiDeleteVendor,
  apiGetManufacturers,
  apiGetVendors,
  apiUpdateManufacturer,
  apiUpdateVendor,
} from "@/services/ProjectService";
import { Button, Card } from "@/ui";
import { Table } from "@/ui/data-display";
import { Input } from "@/ui/forms";
import { TextArea } from "@/ui/forms/Input";
import Search from "@/ui/forms/Search";
import { Tabs } from "@/ui/navigation";
import { Drawer } from "@/ui/overlay";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Form, message, Popconfirm, Select, Space, Switch, Tag } from "antd";
import { useEffect, useState } from "react";

const { Option } = Select;

interface Vendor {
  id: string;
  vendorName: string;
  vendorCode: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  cityId?: string;
  stateId?: string;
  countryId?: string;
  zipCode?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Manufacturer {
  id: string;
  manufacturerName: string;
  manufacturerCode: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  cityId?: string;
  stateId?: string;
  countryId?: string;
  zipCode?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function VendorsManufacturersPage() {
  const [messageApi, contextHolder] = message.useMessage();

  // Use the custom location hook
  const {
    countries,
    states,
    cities,
    countriesLoading,
    statesLoading,
    citiesLoading,
    fetchStates,
    fetchCities,
    resetStates,
    resetCities,
  } = useLocationData();

  // State for vendors
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorsPagination, setVendorsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State for manufacturers
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [manufacturersLoading, setManufacturersLoading] = useState(false);
  const [manufacturersPagination, setManufacturersPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vendors");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<Vendor | Manufacturer | null>(
    null
  );

  // Form instances
  const [form] = Form.useForm();

  // Location selection states
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedStateId, setSelectedStateId] = useState<string>("");

  const {} = useAuth();

  // Handle country change
  const handleCountryChange = async (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedStateId("");

    // Reset form fields
    form.setFieldsValue({
      stateId: undefined,
      cityId: undefined,
    });

    // Reset and fetch new states
    resetStates();
    resetCities();

    if (countryId) {
      await fetchStates(countryId);
    }
  };

  // Handle state change
  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId);

    // Reset city field
    form.setFieldsValue({
      cityId: undefined,
    });

    // Reset and fetch new cities
    resetCities();

    if (stateId) {
      await fetchCities(stateId);
    }
  };

  // Fetch vendors
  const fetchVendors = async (page = 1, pageSize = 10) => {
    setVendorsLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
      };
      const res: any = await apiGetVendors<{ data: Vendor[]; total: number }>(
        params
      );
      setVendors(res.data.data || []);
      setVendorsPagination({ current: page, pageSize, total: res.total || 0 });
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.message || "Failed to fetch vendors"
      );
    } finally {
      setVendorsLoading(false);
    }
  };

  // Fetch manufacturers
  const fetchManufacturers = async (page = 1, pageSize = 10) => {
    setManufacturersLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
      };
      const res: any = await apiGetManufacturers<{
        data: Manufacturer[];
        total: number;
      }>(params);
      setManufacturers(res.data.data || []);
      setManufacturersPagination({
        current: page,
        pageSize,
        total: res.total || 0,
      });
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.message || "Failed to fetch manufacturers"
      );
    } finally {
      setManufacturersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "vendors") {
      fetchVendors(vendorsPagination.current, vendorsPagination.pageSize);
    } else {
      fetchManufacturers(
        manufacturersPagination.current,
        manufacturersPagination.pageSize
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const showAddDrawer = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setSelectedCountryId("");
    setSelectedStateId("");
    resetStates();
    resetCities();
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
    });
    setIsDrawerOpen(true);
  };

  const showEditDrawer = async (item: Vendor | Manufacturer) => {
    setIsEditMode(true);
    setEditingItem(item);
    form.resetFields();
    form.setFieldsValue(item);

    // Handle existing location data when editing
    if (item.countryId) {
      setSelectedCountryId(item.countryId);
      await fetchStates(item.countryId);

      if (item.stateId) {
        setSelectedStateId(item.stateId);
        await fetchCities(item.stateId);
      }
    }

    setIsDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        // Auto-generate code if not provided
        [`${activeTab.slice(0, -1)}Code`]:
          values[`${activeTab.slice(0, -1)}Code`] ||
          `${activeTab.slice(0, -1).toUpperCase()}-${Date.now()}`,
      };

      if (isEditMode && editingItem) {
        if (activeTab === "vendors") {
          await apiUpdateVendor(editingItem.id, payload);
          messageApi.success("Vendor updated successfully");
          fetchVendors(vendorsPagination.current, vendorsPagination.pageSize);
        } else {
          await apiUpdateManufacturer(editingItem.id, payload);
          messageApi.success("Manufacturer updated successfully");
          fetchManufacturers(
            manufacturersPagination.current,
            manufacturersPagination.pageSize
          );
        }
      } else {
        if (activeTab === "vendors") {
          await apiCreateVendor(payload);
          messageApi.success("Vendor created successfully");
          fetchVendors(vendorsPagination.current, vendorsPagination.pageSize);
        } else {
          await apiCreateManufacturer(payload);
          messageApi.success("Manufacturer created successfully");
          fetchManufacturers(
            manufacturersPagination.current,
            manufacturersPagination.pageSize
          );
        }
      }

      handleDrawerClose();
    } catch (error) {
      console.log("Validate Failed:", error);
      messageApi.error("Please fill all required fields");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === "vendors") {
        await apiDeleteVendor(id);
        messageApi.success("Vendor deleted successfully");
        fetchVendors(vendorsPagination.current, vendorsPagination.pageSize);
      } else {
        await apiDeleteManufacturer(id);
        messageApi.success("Manufacturer deleted successfully");
        fetchManufacturers(
          manufacturersPagination.current,
          manufacturersPagination.pageSize
        );
      }
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.message ||
          `Failed to delete ${activeTab.slice(0, -1)}`
      );
    }
  };

  const handleDrawerClose = () => {
    form.resetFields();
    setIsDrawerOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    setSelectedCountryId("");
    setSelectedStateId("");
    resetStates();
    resetCities();
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSearchText("");
    setStatusFilter("all");
  };

  // Generate columns for both vendors and manufacturers
  const generateColumns = (type: "vendors" | "manufacturers") => {
    const nameField = type === "vendors" ? "vendorName" : "manufacturerName";
    const codeField = type === "vendors" ? "vendorCode" : "manufacturerCode";

    return [
      {
        title: "Name",
        dataIndex: nameField,
        key: nameField,
        render: (text: string) => (
          <div className="flex items-center">
            {type === "vendors" ? (
              <ShopOutlined className="mr-2 text-blue-500" />
            ) : (
              <TeamOutlined className="mr-2 text-green-500" />
            )}
            <span className="font-medium">{text}</span>
          </div>
        ),
        sorter: (a: any, b: any) => a[nameField].localeCompare(b[nameField]),
      },
      {
        title: "Contact Person",
        dataIndex: "contactPerson",
        key: "contactPerson",
        render: (text: string) => text || "—",
      },
      {
        title: "Contact Info",
        key: "contact_info",
        render: (record: any) => (
          <div>
            {record.contactNumber && (
              <div className="text-sm">{record.contactNumber}</div>
            )}
            {record.email && (
              <div className="text-xs text-gray-500">{record.email}</div>
            )}
          </div>
        ),
      },
      {
        title: "Location",
        key: "location",
        render: (record: any) => {
          // Note: You might need to resolve these IDs to actual names from your location data
          const location = [
            record.cityname,
            record.statename,
            record.countryname,
          ]
            ?.filter(Boolean)
            ?.join(",");
          return <span className="text-sm">{location || "—"}</span>;
        },
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (isActive: boolean) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        ),
        filters: [
          { text: "Active", value: true },
          { text: "Inactive", value: false },
        ],
        onFilter: (value: any, record: any) => record.isActive === value,
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) =>
          date ? new Date(date).toLocaleDateString() : "—",
        sorter: (a: any, b: any) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime(),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: any) => (
          <div className="flex gap-2">
            {/* Edit */}
            <Button
              variant="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => showEditDrawer(record)}
            />

            {/* Delete with confirmation */}
            <Popconfirm
              title="Are you sure you want to delete this record?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                variant="default"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </div>
        ),
      },
    ];
  };

  // Filter data based on search and status
  const getFilteredData = () => {
    const data = activeTab === "vendors" ? vendors : manufacturers;
    const nameField =
      activeTab === "vendors" ? "vendorName" : "manufacturerName";
    const codeField =
      activeTab === "vendors" ? "vendorCode" : "manufacturerCode";

    return data.filter((item: any) => {
      const matchesSearch =
        item[nameField]?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
        item[codeField]?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
        (item.contactPerson &&
          item.contactPerson
            ?.toLowerCase()
            ?.includes(searchText?.toLowerCase())) ||
        (item.email &&
          item.email?.toLowerCase()?.includes(searchText?.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  };

  const getCurrentPagination = () => {
    return activeTab === "vendors"
      ? vendorsPagination
      : manufacturersPagination;
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    if (activeTab === "vendors") {
      setVendorsPagination({
        current: page,
        pageSize,
        total: vendorsPagination.total,
      });
      fetchVendors(page, pageSize);
    } else {
      setManufacturersPagination({
        current: page,
        pageSize,
        total: manufacturersPagination.total,
      });
      fetchManufacturers(page, pageSize);
    }
  };

  const getFormFields = () => {
    const isVendor = activeTab === "vendors";
    const nameField = isVendor ? "vendorName" : "manufacturerName";
    const codeField = isVendor ? "vendorCode" : "manufacturerCode";

    return { nameField, codeField };
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold">Vendors & Manufacturers</h1>
          <p className="text-gray-500">
            Manage vendor and manufacturer information
          </p>
        </div>
        <Space>
          <Button
            variant="primary"
            icon={<PlusOutlined />}
            onClick={showAddDrawer}
          >
            Add {activeTab === "vendors" ? "Vendor" : "Manufacturer"}
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: "vendors",
              label: (
                <span>
                  <ShopOutlined />
                  Vendors
                </span>
              ),
              children: (
                <>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex-1 min-w-[250px]">
                      <Search
                        placeholder="Search vendors..."
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
                        <Option value="all">All Status</Option>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                      </Select>
                    </div>
                  </div>

                  <Table
                    columns={generateColumns("vendors")}
                    dataSource={getFilteredData()}
                    rowKey="id"
                    loading={vendorsLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      current: getCurrentPagination().current,
                      pageSize: getCurrentPagination().pageSize,
                      total: getCurrentPagination().total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (
                        total: number,
                        [from, to]: [number, number]
                      ) => (
                        <span>
                          {from}-{to} of {total} vendors
                        </span>
                      ),
                      onChange: handlePaginationChange,
                    }}
                  />
                </>
              ),
            },
            {
              key: "manufacturers",
              label: (
                <span>
                  <TeamOutlined />
                  Manufacturers
                </span>
              ),
              children: (
                <>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex-1 min-w-[250px]">
                      <Search
                        placeholder="Search manufacturers..."
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
                        <Option value="all">All Status</Option>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                      </Select>
                    </div>
                  </div>

                  <Table
                    columns={generateColumns("manufacturers")}
                    dataSource={getFilteredData()}
                    rowKey="id"
                    loading={manufacturersLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      current: getCurrentPagination().current,
                      pageSize: getCurrentPagination().pageSize,
                      total: getCurrentPagination().total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (
                        total: number,
                        [from, to]: [number, number]
                      ) => (
                        <span>
                          {from}-{to} of {total} manufacturers
                        </span>
                      ),
                      onChange: handlePaginationChange,
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* Add/Edit Drawer */}
      <Drawer
        title={
          isEditMode
            ? `Edit ${activeTab === "vendors" ? "Vendor" : "Manufacturer"}`
            : `Add New ${activeTab === "vendors" ? "Vendor" : "Manufacturer"}`
        }
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        width={800}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleDrawerClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {isEditMode ? "Update" : "Save"}{" "}
              {activeTab === "vendors" ? "Vendor" : "Manufacturer"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          name="vendor_manufacturer_form"
          preserve={false}
        >
          {/* Basic Information */}
          <div className="">
            <h3 className="text-base font-medium mb-1">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name={getFormFields().nameField}
                label={`${
                  activeTab === "vendors" ? "Vendor" : "Manufacturer"
                } Name`}
                rules={[
                  {
                    required: true,
                    message: `Please enter ${
                      activeTab === "vendors" ? "vendor" : "manufacturer"
                    } name`,
                  },
                ]}
              >
                <Input
                  placeholder={`Enter ${
                    activeTab === "vendors" ? "vendor" : "manufacturer"
                  } name`}
                />
              </Form.Item>

              <Form.Item
                name="contactPerson"
                label="Contact Person Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter contact person name",
                  },
                ]}
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[
                  { required: true, message: "Please enter contact number" },
                ]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Form.Item
                name="website"
                label="Website"
                rules={[{ type: "url", message: "Please enter a valid URL" }]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            </div>
          </div>

          {/* Address Information - Updated with cascading dropdowns */}
          <div className="">
            <h3 className="text-base font-medium mb-1">Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="addressLine1" label="Address Line 1">
                <Input placeholder="Street address" />
              </Form.Item>

              <Form.Item name="addressLine2" label="Address Line 2">
                <Input placeholder="Apartment, suite, unit, etc." />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="countryId"
                label="Country"
                rules={[{ required: true, message: "Please select country" }]}
              >
                <Select
                  placeholder="Select country"
                  showSearch
                  loading={countriesLoading}
                  optionFilterProp="children"
                  onChange={handleCountryChange}
                  filterOption={(input, option) =>
                    (option?.children as any)
                      ?.toLowerCase()
                      ?.includes(input?.toLowerCase())
                  }
                >
                  {countries?.map((country: any) => (
                    <Option key={country.id} value={country.id}>
                      {country.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="stateId"
                label="State/Province"
                rules={[{ required: true, message: "Please select state" }]}
              >
                <Select
                  placeholder="Select state"
                  showSearch
                  loading={statesLoading}
                  optionFilterProp="children"
                  onChange={handleStateChange}
                  disabled={!selectedCountryId}
                  filterOption={(input, option) =>
                    (option?.children as any)
                      ?.toLowerCase()
                      ?.includes(input?.toLowerCase())
                  }
                >
                  {states?.map((state: any) => (
                    <Option key={state.id} value={state.id}>
                      {state.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="cityId"
                label="City"
                rules={[{ required: true, message: "Please select city" }]}
              >
                <Select
                  placeholder="Select city"
                  showSearch
                  loading={citiesLoading}
                  optionFilterProp="children"
                  disabled={!selectedStateId}
                  filterOption={(input, option) =>
                    (option?.children as any)
                      ?.toLowerCase()
                      ?.includes(input?.toLowerCase())
                  }
                >
                  {cities?.map((city: any) => (
                    <Option key={city.id} value={city.id}>
                      {city.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="zipCode" label="Zip/Postal Code">
                <Input placeholder="Enter zip/postal code" />
              </Form.Item>
            </div>
          </div>

          {/* Additional Information */}
          <div className="">
            <h3 className="text-lg font-medium mb-1">Additional</h3>

            <div className="grid grid-cols-6 gap-4">
              <Form.Item
                name="isActive"
                className="col-span-1"
                label="Status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              </Form.Item>

              <Form.Item className="col-span-5" name="notes" label="Notes">
                <TextArea
                  rows={4}
                  placeholder={
                    activeTab === "vendors"
                      ? "Special terms, preferred materials, etc."
                      : "Reliability, quality comments, etc."
                  }
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Drawer>
      {contextHolder}
    </div>
  );
}
