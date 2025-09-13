"use client";

import { Card } from "@/ui";
import { ColumnType, Table } from "@/ui/data-display";
import { TextArea } from "@/ui/forms/Input";
import { Drawer } from "@/ui/overlay";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Expense } from "../ledger/types";

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

type DrawerMode = "add" | "edit" | "view";

// Mock data - in a real app, this would come from an API
const mockExpenses: Expense[] = [
  {
    id: "exp-1",
    date: new Date("2023-05-15"),
    amount: 1500,
    currency: "USD",
    category: "Office Supplies",
    description: "Printer paper and stationery for monthly operations",
    status: "approved",
    paymentMethod: "card",
    expenseAccountId: "acc-123",
    expenseAccountName: "Office Expenses",
    paidTo: "Office Depot",
    approvedBy: "admin@example.com",
    approvedAt: new Date("2023-05-16"),
    createdBy: "user@example.com",
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-05-16"),
  },
  {
    id: "exp-2",
    date: new Date("2023-05-18"),
    amount: 2800,
    currency: "USD",
    category: "Travel",
    description: "Business trip to jewelry trade show in Las Vegas",
    status: "pending",
    paymentMethod: "card",
    expenseAccountId: "acc-124",
    expenseAccountName: "Travel Expenses",
    paidTo: "Delta Airlines",
    approvedBy: "",
    approvedAt: undefined,
    createdBy: "user@example.com",
    createdAt: new Date("2023-05-18"),
    updatedAt: new Date("2023-05-18"),
  },
  {
    id: "exp-3",
    date: new Date("2023-05-20"),
    amount: 850,
    currency: "USD",
    category: "Marketing",
    description: "Social media advertising campaign for new collection",
    status: "reimbursed",
    paymentMethod: "bank_transfer",
    expenseAccountId: "acc-125",
    expenseAccountName: "Marketing Expenses",
    paidTo: "Facebook Ads",
    approvedBy: "admin@example.com",
    approvedAt: new Date("2023-05-21"),
    createdBy: "user@example.com",
    createdAt: new Date("2023-05-20"),
    updatedAt: new Date("2023-05-22"),
  },
  {
    id: "exp-4",
    date: new Date("2023-05-22"),
    amount: 450,
    currency: "USD",
    category: "Utilities",
    description: "Monthly electricity bill for workshop",
    status: "approved",
    paymentMethod: "bank_transfer",
    expenseAccountId: "acc-126",
    expenseAccountName: "Utilities",
    paidTo: "City Power Company",
    approvedBy: "admin@example.com",
    approvedAt: new Date("2023-05-23"),
    createdBy: "user@example.com",
    createdAt: new Date("2023-05-22"),
    updatedAt: new Date("2023-05-23"),
  },
  {
    id: "exp-5",
    date: new Date("2023-05-25"),
    amount: 1200,
    currency: "USD",
    category: "Rent",
    description: "Monthly rent for jewelry workshop space",
    status: "rejected",
    paymentMethod: "cash",
    expenseAccountId: "acc-127",
    expenseAccountName: "Rent Expenses",
    paidTo: "Property Management LLC",
    approvedBy: "admin@example.com",
    approvedAt: new Date("2023-05-26"),
    createdBy: "user@example.com",
    createdAt: new Date("2023-05-25"),
    updatedAt: new Date("2023-05-26"),
  },
];

const expenseCategories = [
  "Office Supplies",
  "Travel",
  "Utilities",
  "Marketing",
  "Rent",
  "Salaries",
  "Raw Materials",
  "Equipment",
  "Insurance",
  "Other",
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Credit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "check", label: "Check" },
  { value: "other", label: "Other" },
];

const expenseStatuses = [
  { value: "pending", label: "Pending", color: "orange" },
  { value: "approved", label: "Approved", color: "green" },
  { value: "rejected", label: "Rejected", color: "red" },
  { value: "reimbursed", label: "Reimbursed", color: "blue" },
];

const mockAccounts = [
  { id: "acc-123", name: "Office Expenses" },
  { id: "acc-124", name: "Travel Expenses" },
  { id: "acc-125", name: "Marketing Expenses" },
  { id: "acc-126", name: "Utilities" },
  { id: "acc-127", name: "Rent Expenses" },
  { id: "acc-128", name: "Equipment Expenses" },
];

export default function ExpensesPage() {
  const router = useRouter();
  const { message } = App.useApp?.() || { message: {} as any };

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [form] = Form.useForm();

  // Load expenses data
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // In a real app, this would be an API call
        setExpenses(mockExpenses);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        message.error("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [message]);

  const handleAddExpense = () => {
    setDrawerMode("add");
    setCurrentExpense(null);
    form.resetFields();
    form.setFieldsValue({
      status: "pending",
      currency: "USD",
      paymentMethod: "card",
      date: dayjs(),
    });
    setIsDrawerVisible(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setDrawerMode("edit");
    setCurrentExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date),
    });
    setIsDrawerVisible(true);
  };

  const handleViewExpense = (expense: Expense) => {
    setDrawerMode("view");
    setCurrentExpense(expense);
    setIsDrawerVisible(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      // In a real app, this would be an API call
      setExpenses(expenses.filter((exp) => exp.id !== id));
      message.success("Expense deleted successfully");
    } catch (error) {
      console.error("Failed to delete expense:", error);
      message.error("Failed to delete expense");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const expenseData = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        expenseAccountName: mockAccounts.find(
          (acc) => acc.id === values.expenseAccountId
        )?.name,
        currency: values.currency || "USD",
      };

      if (currentExpense) {
        // Update existing expense
        const updatedExpense = {
          ...currentExpense,
          ...expenseData,
          updatedAt: new Date(),
        };
        setExpenses(
          expenses.map((exp) =>
            exp.id === currentExpense.id ? updatedExpense : exp
          )
        );
        message.success("Expense updated successfully");
      } else {
        // Create new expense
        const newExpense: Expense = {
          ...expenseData,
          id: `exp-${Date.now()}`,
          date: new Date(values.date.format("YYYY-MM-DD")),
          status: "pending",
          createdBy: "current-user@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setExpenses([newExpense, ...expenses]);
        message.success("Expense added successfully");
      }

      setIsDrawerVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to save expense:", error);
      message.error("Failed to save expense");
    }
  };

  const getDrawerTitle = () => {
    switch (drawerMode) {
      case "add":
        return "Add New Expense";
      case "edit":
        return "Edit Expense";
      case "view":
        return "Expense Details";
      default:
        return "";
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: Date) => dayjs(date).format("MMM D, YYYY"),
      sorter: (a: Expense, b: Expense) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string, record: Expense) => (
        <div>
          <div className="font-medium">{description}</div>
          <div className="text-xs text-gray-500">Paid to: {record.paidTo}</div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: expenseCategories.map((cat) => ({ text: cat, value: cat })),
      onFilter: (value: any, record: Expense) => record.category === value,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: Expense) => (
        <Text strong>
          {record.currency}{" "}
          {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      ),
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
      align: "right",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusInfo = expenseStatuses.find((s) => s.value === status) || {
          color: "default",
          label: status,
        };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
      filters: expenseStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value: any, record: Expense) => record.status === value,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => {
        const methodInfo = paymentMethods.find((m) => m.value === method);
        return methodInfo?.label || method;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Expense) => (
        <Space size="middle">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewExpense(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditExpense(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteExpense(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-3">
        <Title level={4} className="mb-0">
          Expenses
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddExpense}
        >
          Add Expense
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Search
              placeholder="Search expenses..."
              allowClear
              enterButton={<SearchOutlined />}
              className="w-full max-w-md"
              // onSearch={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <Select
              placeholder="Filter by status"
              allowClear
              className="w-40"
              // onChange={handleStatusFilter}
            >
              {expenseStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
            <RangePicker
              // onChange={handleDateRangeChange}
              className="w-64"
            />
          </div>
        </div>

        <Table
          columns={columns as ColumnType<Expense>[]}
          dataSource={expenses}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} expenses`,
          }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Expense Form/View Drawer */}
      <Drawer
        title={getDrawerTitle()}
        width={800}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        footer={
          drawerMode !== "view" ? (
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsDrawerVisible(false)}>Cancel</Button>
              <Button type="primary" onClick={() => form.submit()}>
                {drawerMode === "add" ? "Add Expense" : "Update Expense"}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsDrawerVisible(false)}>Close</Button>
              <Button type="primary" onClick={() => setDrawerMode("edit")}>
                Edit Expense
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
                      Amount
                    </Text>
                    <Title level={4} className="mt-0 text-green-600">
                      {currentExpense?.currency}{" "}
                      {currentExpense?.amount?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
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
                        expenseStatuses.find(
                          (s) => s.value === currentExpense?.status
                        )?.color
                      }
                      className="text-sm"
                    >
                      {
                        expenseStatuses.find(
                          (s) => s.value === currentExpense?.status
                        )?.label
                      }
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Date
                    </Text>
                    <Text strong>
                      {currentExpense?.date
                        ? dayjs(currentExpense.date).format("MMMM D, YYYY")
                        : "N/A"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Category
                    </Text>
                    <Text strong>{currentExpense?.category}</Text>
                  </div>
                </Col>
              </Row>
            </div>

            <Descriptions title="Expense Details" bordered column={2}>
              <Descriptions.Item label="Description" span={2}>
                {currentExpense?.description}
              </Descriptions.Item>
              <Descriptions.Item label="Paid To">
                {currentExpense?.paidTo}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {
                  paymentMethods.find(
                    (m) => m.value === currentExpense?.paymentMethod
                  )?.label
                }
              </Descriptions.Item>
              <Descriptions.Item label="Expense Account">
                {currentExpense?.expenseAccountName}
              </Descriptions.Item>
              <Descriptions.Item label="Currency">
                {currentExpense?.currency}
              </Descriptions.Item>
              {currentExpense?.approvedBy && (
                <Descriptions.Item label="Approved By">
                  {currentExpense.approvedBy}
                </Descriptions.Item>
              )}
              {currentExpense?.approvedAt && (
                <Descriptions.Item label="Approved Date">
                  {dayjs(currentExpense.approvedAt).format("MMMM D, YYYY")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Created By">
                {currentExpense?.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {currentExpense?.createdAt
                  ? dayjs(currentExpense.createdAt).format("MMMM D, YYYY")
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
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
                  name="date"
                  label="Expense Date"
                  rules={[{ required: true, message: "Please select a date" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[
                    { required: true, message: "Please enter amount" },
                    {
                      type: "number",
                      min: 0.01,
                      message: "Amount must be greater than 0",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0.01}
                    step={0.01}
                    formatter={(value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[
                    { required: true, message: "Please select a category" },
                  ]}
                >
                  <Select placeholder="Select category">
                    {expenseCategories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paymentMethod"
                  label="Payment Method"
                  rules={[
                    { required: true, message: "Please select payment method" },
                  ]}
                >
                  <Select placeholder="Select payment method">
                    {paymentMethods.map((method) => (
                      <Option key={method.value} value={method.value}>
                        {method.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="currency"
                  label="Currency"
                  rules={[
                    { required: true, message: "Please select currency" },
                  ]}
                >
                  <Select placeholder="Select currency">
                    <Option value="USD">USD - US Dollar</Option>
                    <Option value="EUR">EUR - Euro</Option>
                    <Option value="GBP">GBP - British Pound</Option>
                    <Option value="INR">INR - Indian Rupee</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expenseAccountId"
                  label="Expense Account"
                  rules={[
                    {
                      required: true,
                      message: "Please select an expense account",
                    },
                  ]}
                >
                  <Select placeholder="Select expense account">
                    {mockAccounts.map((account) => (
                      <Option key={account.id} value={account.id}>
                        {account.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="paidTo"
              label="Paid To"
              rules={[{ required: true, message: "Please enter payee name" }]}
            >
              <Input placeholder="Enter payee name or company" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Enter detailed expense description..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            {currentExpense && (
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  {expenseStatuses.map((status) => (
                    <Option key={status.value} value={status.value}>
                      <Tag color={status.color}>{status.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="receipt"
              label="Receipt/Attachment"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="receipt"
                listType="picture-card"
                className="upload-list-inline"
                showUploadList={true}
                beforeUpload={() => false} // Prevent auto upload
                maxCount={1}
              >
                <div>
                  <FileImageOutlined />
                  <div style={{ marginTop: 8 }}>Upload Receipt</div>
                </div>
              </Upload>
            </Form.Item>

            {/* Expense Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <Title level={5}>Expense Summary</Title>
              <Form.Item shouldUpdate>
                {({ getFieldsValue }) => {
                  const values = getFieldsValue();
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Text type="secondary">Date:</Text>
                        <Text>
                          {values.date
                            ? values.date.format("YYYY-MM-DD")
                            : "Not selected"}
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text type="secondary">Category:</Text>
                        <Text>{values.category || "Not selected"}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text type="secondary">Payee:</Text>
                        <Text>{values.paidTo || "Not entered"}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text type="secondary">Amount:</Text>
                        <Text
                          strong
                          style={{
                            color: values.amount ? "#52c41a" : "#8c8c8c",
                          }}
                        >
                          {values.amount
                            ? `${
                                values.currency || "USD"
                              } ${values.amount.toLocaleString()}`
                            : "USD 0.00"}
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text type="secondary">Payment Method:</Text>
                        <Text>
                          {values.paymentMethod
                            ? paymentMethods.find(
                                (m) => m.value === values.paymentMethod
                              )?.label
                            : "Not selected"}
                        </Text>
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </div>
          </Form>
        )}
      </Drawer>
    </div>
  );
}
