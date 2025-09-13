


"use client";

import { Card } from '@/ui';
import { TextArea } from "@/ui/forms/Input";
import { Drawer } from "@/ui/overlay";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { RangePicker } = DatePicker;

// Extend dayjs with custom parse format
dayjs.extend(customParseFormat);

const { Title, Text } = Typography;
const { Option } = Select;

// Types
interface Payee {
  type: 'vendor' | 'customer' | 'employee';
  id: string;
  name: string;
}

interface Payment {
  id: string;
  paymentNumber: string;
  date: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: 'incoming' | 'outgoing';
  description?: string;
  payee: Payee;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FormValues {
  date: Dayjs;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference?: string;
  status: string;
  type: string;
  description?: string;
  payeeName: string;
  payeeType: string;
}

type DrawerMode = "add" | "edit";

// Mock data for payments
const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    paymentNumber: 'PAY-2023-001',
    date: '2023-06-15',
    amount: 2500.00,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    reference: 'INV-2023-101',
    status: 'completed',
    type: 'outgoing',
    description: 'Payment for raw materials',
    payee: {
      type: 'vendor',
      id: 'ven-001',
      name: 'ABC Metals Inc.'
    },
    createdBy: 'user-001',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-15T10:30:00Z',
  },
  {
    id: 'pay-002',
    paymentNumber: 'PAY-2023-002',
    date: '2023-06-16',
    amount: 1800.00,
    currency: 'USD',
    paymentMethod: 'cash',
    reference: 'INV-2023-102',
    status: 'pending',
    type: 'incoming',
    description: 'Customer payment for custom jewelry',
    payee: {
      type: 'customer',
      id: 'cust-001',
      name: 'Johnson & Co.'
    },
    createdBy: 'user-001',
    createdAt: '2023-06-16T09:15:00Z',
    updatedAt: '2023-06-16T09:15:00Z',
  },
  {
    id: 'pay-003',
    paymentNumber: 'PAY-2023-003',
    date: '2023-06-17',
    amount: 3200.00,
    currency: 'USD',
    paymentMethod: 'check',
    reference: 'INV-2023-103',
    status: 'failed',
    type: 'outgoing',
    description: 'Supplier payment for gemstones',
    payee: {
      type: 'vendor',
      id: 'ven-002',
      name: 'Gemstone Suppliers Ltd.'
    },
    createdBy: 'user-001',
    createdAt: '2023-06-17T14:20:00Z',
    updatedAt: '2023-06-17T14:20:00Z',
  },
  {
    id: 'pay-004',
    paymentNumber: 'PAY-2023-004',
    date: '2023-06-18',
    amount: 4500.00,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    reference: 'INV-2023-104',
    status: 'completed',
    type: 'incoming',
    description: 'Payment for wedding ring set',
    payee: {
      type: 'customer',
      id: 'cust-002',
      name: 'Smith Wedding Services'
    },
    createdBy: 'user-001',
    createdAt: '2023-06-18T11:45:00Z',
    updatedAt: '2023-06-18T11:45:00Z',
  },
  {
    id: 'pay-005',
    paymentNumber: 'PAY-2023-005',
    date: '2023-06-19',
    amount: 1200.00,
    currency: 'USD',
    paymentMethod: 'cash',
    reference: 'SAL-001',
    status: 'completed',
    type: 'outgoing',
    description: 'Employee salary payment',
    payee: {
      type: 'employee',
      id: 'emp-001',
      name: 'John Smith'
    },
    createdBy: 'user-001',
    createdAt: '2023-06-19T16:30:00Z',
    updatedAt: '2023-06-19T16:30:00Z',
  }
];

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'wire_transfer', label: 'Wire Transfer' },
  { value: 'online_payment', label: 'Online Payment' },
  { value: 'other', label: 'Other' }
];

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' }
];

const payeeTypes = [
  { value: 'vendor', label: 'Vendor/Supplier' },
  { value: 'customer', label: 'Customer' },
  { value: 'employee', label: 'Employee' }
];

const paymentStatuses = [
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

const paymentTypes = [
  { value: 'incoming', label: 'Incoming Payment' },
  { value: 'outgoing', label: 'Outgoing Payment' }
];

export default function PaymentsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  
  // State
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(mockPayments);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // Filter payments based on search text and date range
  useEffect(() => {
    let filtered = payments.filter(payment => 
      payment.paymentNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.payee.name.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(payment => {
        const paymentDate = dayjs(payment.date);
        return paymentDate.isAfter(dateRange[0]?.startOf('day')) && 
               paymentDate.isBefore(dateRange[1]?.endOf('day'));
      });
    }

    setFilteredPayments(filtered);
  }, [searchText, payments, dateRange]);

  const handleNewPayment = () => {
    setDrawerMode("add");
    setCurrentPayment(null);
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(),
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      status: 'pending',
      type: 'outgoing',
      payeeType: 'vendor'
    });
    setIsDrawerVisible(true);
  };
  
  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentPayment) {
        // Update existing payment
        const updatedPayments = payments.map(p => 
          p.id === currentPayment.id ? {
            ...p,
            ...values,
            date: values.date.format('YYYY-MM-DD'),
            payee: {
              type: values.payeeType as 'vendor' | 'customer' | 'employee',
              id: `${values.payeeType}-${Date.now()}`,
              name: values.payeeName
            },
            updatedAt: new Date().toISOString(),
          } : p
        );
        setPayments(updatedPayments as Payment[]);
        message.success('Payment updated successfully');
      } else {
        // Create new payment
        const newPayment: Payment = {
          id: `pay-${Date.now()}`,
          paymentNumber: `PAY-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`,
          date: values.date.format('YYYY-MM-DD'),
          amount: values.amount,
          currency: values.currency,
          paymentMethod: values.paymentMethod,
          reference: values.reference,
          status: values.status as 'pending' | 'completed' | 'failed' | 'cancelled',
          type: values.type as 'incoming' | 'outgoing',
          description: values.description,
          payee: {
            type: values.payeeType as 'vendor' | 'customer' | 'employee',
            id: `${values.payeeType}-${Date.now()}`,
            name: values.payeeName
          },
          createdBy: 'current-user-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPayments([newPayment, ...payments]);
        message.success('Payment recorded successfully');
      }
      
      setIsDrawerVisible(false);
      form.resetFields();
      setCurrentPayment(null);
    } catch (error) {
      console.error('Error saving payment:', error);
      message.error('Failed to save payment');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit payment
  const handleEdit = (payment: Payment) => {
    setDrawerMode("edit");
    setCurrentPayment(payment);
    form.setFieldsValue({
      ...payment,
      date: payment.date ? dayjs(payment.date) : null,
      payeeName: payment.payee.name,
      payeeType: payment.payee.type,
    });
    setIsDrawerVisible(true);
  };
  
  // Handle delete payment
  const handleDelete = (paymentId: string) => {
    Modal.confirm({
      title: 'Delete Payment',
      content: 'Are you sure you want to delete this payment? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setPayments(payments.filter(p => p.id !== paymentId));
        message.success('Payment deleted successfully');
      },
    });
  };

  // Handle export functions
  const handleExportPDF = () => {
    message.info('PDF export functionality will be implemented');
  };

  const handleExportExcel = () => {
    message.info('Excel export functionality will be implemented');
  };

  const getDrawerTitle = () => {
    return drawerMode === "add" ? "Record New Payment" : "Edit Payment";
  };

  // More actions menu items
  const getMoreActionsItems = (record: Payment) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => router.push(`/accounts/payments/${record.id}`),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Payment',
      onClick: () => handleEdit(record),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Payment',
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];
  
  // Table columns
  const columns = [
    {
      title: 'Payment #',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      render: (text: string, record: Payment) => (
        <Button 
          type="link" 
          onClick={() => router.push(`/accounts/payments/${record.id}`)}
          className="p-0 h-auto"
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
      sorter: (a: Payment, b: Payment) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Payee/Payer',
      key: 'payee',
      render: (_: any, record: Payment) => (
        <div>
          <div className="font-medium">{record.payee.name}</div>
          <div className="text-xs text-gray-500 capitalize">
            {record.type === 'incoming' ? 'From' : 'To'}: {record.payee.type}
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Payment) => (
        <Text 
          strong 
          className={record.type === 'incoming' ? 'text-green-600' : 'text-red-600'}
        >
          {record.type === 'incoming' ? '+' : '-'} {record.currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      ),
      align: 'right' as const,
      sorter: (a: Payment, b: Payment) => a.amount - b.amount,
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => (
        <Tag>{paymentMethods.find(m => m.value === method)?.label || method}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusInfo = paymentStatuses.find(s => s.value === status) || { color: 'default', label: status };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
      filters: paymentStatuses.map(status => ({ text: status.label, value: status.value })),
      onFilter: (value: any, record: Payment) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Payment) => (
        <Dropdown 
          menu={{ items: getMoreActionsItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            size="small"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
        <Title level={4} className="mb-0">Payments</Title>
        <Space wrap>
          <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleNewPayment}
          >
            New Payment
          </Button>
        </Space>
      </div>
      
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Search payments by number, reference, or payee..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <RangePicker 
              style={{ width: '100%', minWidth: '280px' }}
              format="YYYY-MM-DD"
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              allowClear
            />
            <Button icon={<FilterOutlined />}>
              More Filters
            </Button>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredPayments} 
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payments`,
            responsive: true,
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
      
      {/* Payment Form Drawer */}
      <Drawer
        title={getDrawerTitle()}
        width={800}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setIsDrawerVisible(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={() => form.submit()}
              loading={loading}
            >
              {drawerMode === "add" ? "Record Payment" : "Update Payment"}
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
                label="Payment Date"
                rules={[{ required: true, message: 'Please select payment date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[
                  { required: true, message: 'Please enter amount' },
                  { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0.01} 
                  step={0.01} 
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{ required: true, message: 'Please select payment method' }]}
              >
                <Select placeholder="Select payment method">
                  {paymentMethods.map(method => (
                    <Option key={method.value} value={method.value}>
                      {method.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select placeholder="Select currency">
                  {currencies.map(currency => (
                    <Option key={currency.value} value={currency.value}>
                      {currency.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="payeeType"
                label="Payee Type"
                rules={[{ required: true, message: 'Please select payee type' }]}
              >
                <Select placeholder="Select payee type">
                  {payeeTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payeeName"
                label="Payee Name"
                rules={[{ required: true, message: 'Please enter payee name' }]}
              >
                <Input placeholder="Enter payee name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Payment Type"
                rules={[{ required: true, message: 'Please select payment type' }]}
              >
                <Select placeholder="Select payment type">
                  {paymentTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  {paymentStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      <Tag color={status.color}>{status.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Enter payment description..."
              showCount
              maxLength={500}
            />
          </Form.Item>
          
          <Form.Item
            name="reference"
            label="Reference Number/Invoice #"
          >
            <Input placeholder="Enter reference number or invoice # (optional)" />
          </Form.Item>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <Title level={5}>Payment Summary</Title>
            <Form.Item shouldUpdate>
              {({ getFieldsValue }) => {
                const values = getFieldsValue();
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text type="secondary">Date:</Text>
                      <Text>{values.date ? values.date.format('YYYY-MM-DD') : 'Not selected'}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Type:</Text>
                      <Text>
                        {values.type ? (
                          <Tag color={values.type === 'incoming' ? 'green' : 'red'}>
                            {paymentTypes.find(t => t.value === values.type)?.label}
                          </Tag>
                        ) : 'Not selected'}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Payee:</Text>
                      <Text>{values.payeeName || 'Not entered'}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Amount:</Text>
                      <Text strong style={{ color: values.amount ? '#52c41a' : '#8c8c8c' }}>
                        {values.amount ? `${values.currency || 'USD'} ${values.amount.toLocaleString()}` : 'USD 0.00'}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Method:</Text>
                      <Text>
                        {values.paymentMethod ? 
                          paymentMethods.find(m => m.value === values.paymentMethod)?.label :
                          'Not selected'
                        }
                      </Text>
                    </div>
                  </div>
                );
              }}
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
