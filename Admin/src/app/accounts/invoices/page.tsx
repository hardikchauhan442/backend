"use client";

import { Card } from "@/ui";
import { Table } from "@/ui/data-display";
import { TextArea } from "@/ui/forms/Input";
import { Drawer } from "@/ui/overlay";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
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
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useState } from "react";

// Types
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer | string;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface FormValues {
  id?: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  date: Dayjs;
  dueDate?: Dayjs;
  status: InvoiceStatus;
  items: Array<InvoiceItem & { key: string }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  termsAndConditions?: string;
}

type DrawerMode = "add" | "edit" | "view";

// Status mapping for display
type StatusKey = InvoiceStatus | "UNKNOWN";

const statusMap: Record<StatusKey, { text: string; color: string }> = {
  draft: { text: "Draft", color: "default" },
  sent: { text: "Sent", color: "blue" },
  paid: { text: "Paid", color: "green" },
  overdue: { text: "Overdue", color: "orange" },
  void: { text: "Void", color: "red" },
  UNKNOWN: { text: "Unknown", color: "default" },
} as const;

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Acme Corp",
    email: "billing@acme.com",
    phone: "555-0001",
    address: "123 Business Ave, Suite 100",
  },
  {
    id: "2",
    name: "Tech Solutions Inc",
    email: "accounts@techsolutions.com",
    phone: "555-0002",
    address: "456 Innovation Drive",
  },
  {
    id: "3",
    name: "Global Industries",
    email: "finance@global.com",
    phone: "555-0003",
    address: "789 Commerce Street",
  },
  {
    id: "4",
    name: "Jewelry Plus LLC",
    email: "billing@jewelryplus.com",
    phone: "555-0004",
    address: "321 Diamond Row",
  },
  {
    id: "5",
    name: "Premium Designs Co",
    email: "accounts@premiumdesigns.com",
    phone: "555-0005",
    address: "654 Luxury Lane",
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    customerId: "1",
    customer: mockCustomers[0],
    date: "2024-01-15",
    dueDate: "2024-02-15",
    status: "sent",
    items: [
      {
        id: "item1",
        description: "Custom Diamond Ring Design",
        quantity: 1,
        unitPrice: 2500,
        amount: 2500,
        taxRate: 8.5,
        taxAmount: 212.5,
      },
      {
        id: "item2",
        description: "Ring Setting - 18K White Gold",
        quantity: 1,
        unitPrice: 800,
        amount: 800,
        taxRate: 8.5,
        taxAmount: 68.0,
      },
    ],
    subtotal: 3300,
    taxAmount: 280.5,
    totalAmount: 3580.5,
    notes: "Thank you for choosing our custom jewelry services",
    termsAndConditions: "Payment due within 30 days. Late fees may apply.",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    customerId: "2",
    customer: mockCustomers[1],
    date: "2024-01-18",
    dueDate: "2024-02-18",
    status: "paid",
    items: [
      {
        id: "item3",
        description: "Pearl Necklace - Akoya Pearls",
        quantity: 1,
        unitPrice: 1200,
        amount: 1200,
        taxRate: 8.5,
        taxAmount: 102.0,
      },
    ],
    subtotal: 1200,
    taxAmount: 102.0,
    totalAmount: 1302.0,
    notes: "Premium quality Akoya pearls",
    termsAndConditions: "Payment due within 30 days",
    createdAt: "2024-01-18T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    customerId: "3",
    customer: mockCustomers[2],
    date: "2024-01-20",
    dueDate: "2024-02-20",
    status: "overdue",
    items: [
      {
        id: "item4",
        description: "Gold Chain Bracelet - 14K",
        quantity: 2,
        unitPrice: 450,
        amount: 900,
        taxRate: 8.5,
        taxAmount: 76.5,
      },
    ],
    subtotal: 900,
    taxAmount: 76.5,
    totalAmount: 976.5,
    notes: "Bulk order discount applied",
    termsAndConditions: "Payment overdue. Please remit payment immediately.",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    createdBy: "system",
    updatedBy: "system",
  },
];

// Format currency helper function
const formatCurrency = (value: number | undefined): string => {
  if (typeof value !== "number" || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const { Title, Text } = Typography;
const { Option } = Select;

// Main InvoicesPage component
const InvoicesPage: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Initialize form with default values
  const getInitialValues = (): Partial<FormValues> => ({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: dayjs(),
    dueDate: dayjs().add(30, "days"),
    status: "draft",
    items: [
      {
        id: `item_${Date.now()}`,
        key: `item_${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 8.5,
        amount: 0,
        taxAmount: 0,
      },
    ],
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    notes: "",
    termsAndConditions: "Payment due within 30 days.",
  });

  // Calculate totals when items change
  const calculateTotals = useCallback(() => {
    const items = form.getFieldValue("items") || [];

    const subtotal = items.reduce((sum: number, item: any) => {
      const quantity = Number(item?.quantity) || 0;
      const unitPrice = Number(item?.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);

    const taxAmount = items.reduce((sum: number, item: any) => {
      const quantity = Number(item?.quantity) || 0;
      const unitPrice = Number(item?.unitPrice) || 0;
      const taxRate = Number(item?.taxRate) || 0;
      return sum + (quantity * unitPrice * taxRate) / 100;
    }, 0);

    const totalAmount = subtotal + taxAmount;

    form.setFieldsValue({
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    });
  }, [form]);

  // Handle create invoice
  const handleCreate = () => {
    setDrawerMode("add");
    setCurrentInvoice(null);
    form.setFieldsValue(getInitialValues());
    setIsDrawerVisible(true);
  };

  // Handle view invoice
  const handleView = useCallback(
    (invoice: Invoice) => {
      setDrawerMode("view");
      setCurrentInvoice(invoice);
      const customer = mockCustomers.find((c) => c.id === invoice.customerId);
      form.setFieldsValue({
        ...invoice,
        date: dayjs(invoice.date),
        dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : undefined,
        customer,
        items: invoice.items.map((item) => ({
          ...item,
          key: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
        })),
      });
      setIsDrawerVisible(true);
    },
    [form]
  );

  // Handle edit invoice
  const handleEdit = useCallback(
    (invoice: Invoice) => {
      setDrawerMode("edit");
      setCurrentInvoice(invoice);
      const customer = mockCustomers.find((c) => c.id === invoice.customerId);
      form.setFieldsValue({
        ...invoice,
        date: dayjs(invoice.date),
        dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : undefined,
        customer,
        items: invoice.items.map((item) => ({
          ...item,
          key: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
        })),
      });
      setIsDrawerVisible(true);
    },
    [form]
  );

  // Handle delete invoice
  const handleDelete = useCallback(
    (id: string) => {
      setInvoices((prevInvoices) =>
        prevInvoices.filter((inv) => inv.id !== id)
      );
      messageApi.success("Invoice deleted successfully");
    },
    [messageApi]
  );

  // Handle form cancellation
  const handleFormCancel = useCallback(() => {
    form.resetFields();
    setCurrentInvoice(null);
    setIsDrawerVisible(false);
  }, [form]);

  // Handle form submission
  const handleFormFinish = useCallback(
    (values: FormValues) => {
      setLoading(true);

      const invoiceData: Invoice = {
        id: currentInvoice?.id || `inv_${Date.now()}`,
        invoiceNumber:
          values.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        customerId: values.customerId,
        customer: mockCustomers.find((c) => c.id === values.customerId),
        date: values.date.format("YYYY-MM-DD"),
        dueDate: values.dueDate
          ? values.dueDate.format("YYYY-MM-DD")
          : undefined,
        status: values.status,
        items: values.items.map(({ key, ...item }) => ({
          ...item,
          id: item.id || `item_${Date.now()}`,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          taxRate: Number(item.taxRate) || 0,
          amount: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
          taxAmount:
            (Number(item.quantity) || 0) *
            (Number(item.unitPrice) || 0) *
            ((Number(item.taxRate) || 0) / 100),
        })),
        subtotal: Number(values.subtotal) || 0,
        taxAmount: Number(values.taxAmount) || 0,
        totalAmount: Number(values.totalAmount) || 0,
        notes: values.notes || "",
        termsAndConditions: values.termsAndConditions || "",
        createdAt: currentInvoice?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentInvoice?.createdBy || "system",
        updatedBy: "system",
      };

      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        messageApi.success(
          `Invoice ${currentInvoice ? "updated" : "created"} successfully!`
        );

        if (currentInvoice) {
          setInvoices((prevInvoices) =>
            prevInvoices.map((inv) =>
              inv.id === currentInvoice.id ? invoiceData : inv
            )
          );
        } else {
          setInvoices((prevInvoices) => [invoiceData, ...prevInvoices]);
        }

        handleFormCancel();
      }, 1000);
    },
    [currentInvoice, messageApi, handleFormCancel]
  );

  const getDrawerTitle = () => {
    switch (drawerMode) {
      case "add":
        return "Create New Invoice";
      case "edit":
        return "Edit Invoice";
      case "view":
        return "Invoice Details";
      default:
        return "";
    }
  };

  // Table columns
  const columns: ColumnType<Invoice>[] = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber),
      render: (text: string, record: Invoice) => (
        <Button
          type="link"
          onClick={() => handleView(record)}
          className="p-0 h-auto font-medium"
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerId",
      key: "customer",
      render: (customerId: string, record: Invoice) => {
        const customer = mockCustomers.find((c) => c.id === customerId);
        return (
          <div>
            <div className="font-medium">{customer?.name || "N/A"}</div>
            {customer?.email && (
              <div className="text-xs text-gray-500">{customer.email}</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("MMM D, YYYY"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate?: string) => {
        if (!dueDate) return <Text type="secondary">N/A</Text>;
        const due = dayjs(dueDate);
        const isOverdue = due.isBefore(dayjs()) && dueDate;
        return (
          <Text type={isOverdue ? "danger" : ("default" as any)}>
            {due.format("MMM D, YYYY")}
            {isOverdue && <div className="text-xs">Overdue</div>}
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: InvoiceStatus) => {
        const statusInfo = statusMap[status] || statusMap.UNKNOWN;
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      filters: [
        { text: "Draft", value: "draft" },
        { text: "Sent", value: "sent" },
        { text: "Paid", value: "paid" },
        { text: "Overdue", value: "overdue" },
        { text: "Void", value: "void" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => <Text strong>{formatCurrency(amount)}</Text>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      align: "right",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Invoice) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="View invoice"
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit invoice"
            size="small"
          />
          <Popconfirm
            title="Delete Invoice"
            description="Are you sure you want to delete this invoice?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete invoice"
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
        <Title level={4} style={{ margin: 0 }}>
          Invoices
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="middle"
        >
          New Invoice
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Invoice Form Drawer */}
      <Drawer
        title={getDrawerTitle()}
        width={1200}
        onClose={handleFormCancel}
        open={isDrawerVisible}
        footer={
          drawerMode !== "view" ? (
            <div className="flex justify-end gap-2">
              <Button onClick={handleFormCancel} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={loading}
              >
                {drawerMode === "add" ? "Create Invoice" : "Update Invoice"}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button onClick={handleFormCancel}>Close</Button>
              <Button type="primary" onClick={() => setDrawerMode("edit")}>
                Edit Invoice
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
                      Invoice Number
                    </Text>
                    <Title level={4} className="mt-0">
                      {currentInvoice?.invoiceNumber}
                    </Title>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Status
                    </Text>
                    <Tag
                      color={statusMap[currentInvoice?.status || "draft"].color}
                      className="text-sm"
                    >
                      {statusMap[currentInvoice?.status || "draft"].text}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Date
                    </Text>
                    <Text strong>
                      {currentInvoice?.date
                        ? dayjs(currentInvoice.date).format("MMMM D, YYYY")
                        : "N/A"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Due Date
                    </Text>
                    <Text strong>
                      {currentInvoice?.dueDate
                        ? dayjs(currentInvoice.dueDate).format("MMMM D, YYYY")
                        : "N/A"}
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="mb-6">
              <Text type="secondary" className="block mb-2">
                Customer
              </Text>
              <div className="bg-white border rounded p-4">
                <Title level={5} className="mt-0">
                  {
                    mockCustomers.find(
                      (c) => c.id === currentInvoice?.customerId
                    )?.name
                  }
                </Title>
                <Text type="secondary">
                  {
                    mockCustomers.find(
                      (c) => c.id === currentInvoice?.customerId
                    )?.email
                  }
                </Text>
                <br />
                <Text type="secondary">
                  {
                    mockCustomers.find(
                      (c) => c.id === currentInvoice?.customerId
                    )?.phone
                  }
                </Text>
              </div>
            </div>

            <div className="mb-6">
              <Text type="secondary" className="block mb-2">
                Items
              </Text>
              <Table
                dataSource={
                  currentInvoice?.items.map((item, index) => ({
                    ...item,
                    key: index,
                  })) as []
                }
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Description",
                    dataIndex: "description",
                    key: "description",
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                    align: "right",
                  },
                  {
                    title: "Unit Price",
                    dataIndex: "unitPrice",
                    key: "unitPrice",
                    render: (price: number) => formatCurrency(price),
                    align: "right",
                  },
                  {
                    title: "Tax Rate",
                    dataIndex: "taxRate",
                    key: "taxRate",
                    render: (rate: number) => `${rate}%`,
                    align: "right",
                  },
                  {
                    title: "Amount",
                    dataIndex: "amount",
                    key: "amount",
                    render: (amount: number) => formatCurrency(amount),
                    align: "right",
                  },
                ]}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <Row justify="end">
                <Col span={8}>
                  <div className="text-right space-y-2">
                    <div className="flex justify-between">
                      <Text>Subtotal:</Text>
                      <Text strong>
                        {formatCurrency(currentInvoice?.subtotal)}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Tax:</Text>
                      <Text strong>
                        {formatCurrency(currentInvoice?.taxAmount)}
                      </Text>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between">
                      <Text strong className="text-lg">
                        Total:
                      </Text>
                      <Text strong className="text-lg text-green-600">
                        {formatCurrency(currentInvoice?.totalAmount)}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {(currentInvoice?.notes || currentInvoice?.termsAndConditions) && (
              <Row gutter={16}>
                {currentInvoice?.notes && (
                  <Col span={12}>
                    <div>
                      <Text type="secondary" className="block mb-2">
                        Notes
                      </Text>
                      <div className="bg-white border rounded p-3">
                        <Text>{currentInvoice.notes}</Text>
                      </div>
                    </div>
                  </Col>
                )}
                {currentInvoice?.termsAndConditions && (
                  <Col span={12}>
                    <div>
                      <Text type="secondary" className="block mb-2">
                        Terms & Conditions
                      </Text>
                      <div className="bg-white border rounded p-3">
                        <Text>{currentInvoice.termsAndConditions}</Text>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </div>
        ) : (
          // Edit/Add Mode - Form
          <Form
            form={form}
            onFinish={handleFormFinish}
            layout="vertical"
            onValuesChange={calculateTotals}
            preserve={false}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="invoiceNumber"
                  label="Invoice Number"
                  rules={[
                    { required: true, message: "Please enter invoice number" },
                  ]}
                >
                  <Input
                    placeholder="INV-0001"
                    disabled={drawerMode === "edit"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{ required: true, message: "Please select date" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="dueDate" label="Due Date">
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="customerId"
                  label="Customer"
                  rules={[
                    { required: true, message: "Please select a customer" },
                  ]}
                >
                  <Select placeholder="Select Customer" showSearch>
                    {mockCustomers.map((customer) => (
                      <Option key={customer.id} value={customer.id}>
                        <div>
                          <div>{customer.name}</div>
                          <div className="text-xs text-gray-500">
                            {customer.email}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select Status">
                    <Option value="draft">
                      <Tag color="default">Draft</Tag>
                    </Option>
                    <Option value="sent">
                      <Tag color="blue">Sent</Tag>
                    </Option>
                    <Option value="paid">
                      <Tag color="green">Paid</Tag>
                    </Option>
                    <Option value="overdue">
                      <Tag color="orange">Overdue</Tag>
                    </Option>
                    <Option value="void">
                      <Tag color="red">Void</Tag>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Items</Divider>

            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map((field) => {
                    const { key: fieldKey, ...restField } = field;
                    return (
                      <Row
                        key={fieldKey}
                        gutter={16}
                        align="middle"
                        style={{ marginBottom: 16 }}
                      >
                        <Col xs={24} md={8}>
                          <Form.Item
                            {...restField}
                            name={[field.name, "description"]}
                            rules={[
                              {
                                required: true,
                                message: "Please enter description",
                              },
                            ]}
                          >
                            <Input placeholder="Item description" />
                          </Form.Item>
                        </Col>
                        <Col xs={8} md={3}>
                          <Form.Item
                            {...restField}
                            name={[field.name, "quantity"]}
                            rules={[
                              { required: true, message: "Qty required" },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              style={{ width: "100%" }}
                              placeholder="Qty"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={8} md={4}>
                          <Form.Item
                            {...restField}
                            name={[field.name, "unitPrice"]}
                            rules={[
                              { required: true, message: "Price required" },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              step={0.01}
                              style={{ width: "100%" }}
                              placeholder="Unit Price"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={8} md={3}>
                          <Form.Item
                            {...restField}
                            name={[field.name, "taxRate"]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              step={0.1}
                              style={{ width: "100%" }}
                              placeholder="Tax %"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={20} md={4}>
                          <Form.Item
                            dependencies={[
                              ["items", field.name, "quantity"],
                              ["items", field.name, "unitPrice"],
                            ]}
                          >
                            {() => {
                              const items = form.getFieldValue("items") || [];
                              const item = items[field.name];
                              const amount = item
                                ? (Number(item.quantity) || 0) *
                                  (Number(item.unitPrice) || 0)
                                : 0;
                              return (
                                <Input
                                  value={formatCurrency(amount)}
                                  disabled
                                />
                              );
                            }}
                          </Form.Item>
                        </Col>
                        <Col xs={4} md={2}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                            disabled={fields.length === 1}
                          />
                        </Col>
                      </Row>
                    );
                  })}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          id: `item_${Date.now()}`,
                          description: "",
                          quantity: 1,
                          unitPrice: 0,
                          taxRate: 8.5,
                          amount: 0,
                          taxAmount: 0,
                        })
                      }
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Item
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form.List>

            <Divider />

            <Row gutter={16} justify="end">
              <Col xs={24} md={8}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Subtotal: </Text>
                    <Form.Item
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.subtotal !== curValues.subtotal
                      }
                      style={{ display: "inline-block", margin: 0 }}
                    >
                      {({ getFieldValue }) => (
                        <Text>{formatCurrency(getFieldValue("subtotal"))}</Text>
                      )}
                    </Form.Item>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Tax: </Text>
                    <Form.Item
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.taxAmount !== curValues.taxAmount
                      }
                      style={{ display: "inline-block", margin: 0 }}
                    >
                      {({ getFieldValue }) => (
                        <Text>
                          {formatCurrency(getFieldValue("taxAmount"))}
                        </Text>
                      )}
                    </Form.Item>
                  </div>
                  <div style={{ fontSize: "18px" }}>
                    <Text strong>Total: </Text>
                    <Form.Item
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.totalAmount !== curValues.totalAmount
                      }
                      style={{ display: "inline-block", margin: 0 }}
                    >
                      {({ getFieldValue }) => (
                        <Text strong className="text-green-600">
                          {formatCurrency(getFieldValue("totalAmount"))}
                        </Text>
                      )}
                    </Form.Item>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider orientation="left">Notes & Terms</Divider>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Notes" name="notes">
                  <TextArea
                    rows={4}
                    placeholder="Additional notes for the customer"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="termsAndConditions" label="Terms & Conditions">
                  <TextArea
                    rows={4}
                    placeholder="Payment terms, late fees, etc."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default InvoicesPage;
