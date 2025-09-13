"use client";

import { Card } from '@/ui';
import { TextArea } from "@/ui/forms/Input";
import { Drawer } from "@/ui/overlay";
import {
  BarChartOutlined,
  DollarOutlined,
  FileDoneOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  MoneyCollectOutlined,
  PlusOutlined,
  SearchOutlined,
  TransactionOutlined
} from '@ant-design/icons';
import {
  App,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LedgerAccount } from './types';

// Extend dayjs with custom parse format
dayjs.extend(customParseFormat);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data for demonstration
const mockAccounts: LedgerAccount[] = [
  {
    id: 'acc-001',
    name: 'Cash Account',
    type: 'asset',
    code: '1001',
    description: 'Main cash account',
    balance: 25000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc-002',
    name: 'Bank Account',
    type: 'asset',
    code: '1002',
    description: 'Business checking account',
    balance: 150000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc-003',
    name: 'Accounts Receivable',
    type: 'asset',
    code: '1003',
    description: 'Money owed by customers',
    balance: 75000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc-004',
    name: 'Inventory',
    type: 'asset',
    code: '1004',
    description: 'Raw materials and finished goods',
    balance: 120000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc-005',
    name: 'Accounts Payable',
    type: 'liability',
    code: '2001',
    description: 'Money owed to suppliers',
    balance: -35000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc-006',
    name: 'Sales Revenue',
    type: 'revenue',
    code: '4001',
    description: 'Revenue from jewelry sales',
    balance: -200000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc-007',
    name: 'Cost of Goods Sold',
    type: 'expense',
    code: '5001',
    description: 'Direct costs of production',
    balance: 80000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const transactionTypes = [
  { value: 'income', label: 'Income', color: 'green' },
  { value: 'expense', label: 'Expense', color: 'red' },
  { value: 'transfer', label: 'Transfer', color: 'blue' },
  { value: 'journal', label: 'Journal Entry', color: 'purple' }
];

export default function LedgerPage() {
  const { message } = App.useApp?.() || { message: { success: console.log, error: console.error } };
  const router = useRouter();
  
  // State
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchText, setSearchText] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [isTransactionDrawerVisible, setIsTransactionDrawerVisible] = useState(false);
  const [transactionForm] = Form.useForm();
  
  // Filter data based on search and date range
  const filteredAccounts = mockAccounts.filter(account => 
    account.name.toLowerCase().includes(searchText.toLowerCase()) ||
    account.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleNewTransaction = () => {
    transactionForm.resetFields();
    transactionForm.setFieldsValue({
      date: dayjs(),
      type: 'income',
    });
    setIsTransactionDrawerVisible(true);
  };

  const handleTransactionSubmit = (values: any) => {
    console.log('Transaction values:', values);
    message.success('Transaction created successfully');
    setIsTransactionDrawerVisible(false);
    transactionForm.resetFields();
  };

  const exportToPDF = () => {
    message.info("PDF export functionality will be implemented");
  };

  const exportToExcel = () => {
    message.info("Excel export functionality will be implemented");
  };
  
  // Tabs configuration
  const tabItems = [
    {
      key: 'transactions',
      label: (
        <span>
          <TransactionOutlined />
          <span>Transactions</span>
        </span>
      ),
      children: <TransactionsTab />,
    },
    {
      key: 'accounts',
      label: (
        <span>
          <DollarOutlined />
          <span>Chart of Accounts</span>
        </span>
      ),
      children: <AccountsTab accounts={filteredAccounts} />,
    },
    {
      key: 'payments',
      label: (
        <span>
          <MoneyCollectOutlined />
          <span>Payments</span>
        </span>
      ),
      children: <PaymentsTab />,
    },
    {
      key: 'invoices',
      label: (
        <span>
          <FileDoneOutlined />
          <span>Invoices</span>
        </span>
      ),
      children: <InvoicesTab />,
    },
    {
      key: 'reports',
      label: (
        <span>
          <BarChartOutlined />
          <span>Reports</span>
        </span>
      ),
      children: <ReportsTab />,
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-3">
        <Title level={4} className="mb-0">Accounts & Ledger</Title>
        <Space>
          <Button icon={<FilePdfOutlined />} onClick={exportToPDF}>
            Export PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
            Export Excel
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleNewTransaction}
          >
            New Transaction
          </Button>
        </Space>
      </div>
      
      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <div className="flex-1">
            <Input 
              placeholder="Search accounts, transactions..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          <div className="flex gap-2">
            <RangePicker 
              value={selectedDateRange as any}
              onChange={(dates) => setSelectedDateRange(dates as any)}
              format="YYYY-MM-DD"
            />
            <Button icon={<FilterOutlined />}>
              Filters
            </Button>
          </div>
        </div>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="middle"
        />
      </Card>

      {/* New Transaction Drawer */}
      <Drawer
        title="New Transaction"
        width={720}
        onClose={() => setIsTransactionDrawerVisible(false)}
        open={isTransactionDrawerVisible}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsTransactionDrawerVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => transactionForm.submit()}>
              Save Transaction
            </Button>
          </div>
        }
      >
        <Form
          form={transactionForm}
          layout="vertical"
          onFinish={handleTransactionSubmit}
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Transaction Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Transaction Type"
                rules={[{ required: true, message: 'Please select transaction type' }]}
              >
                <Select placeholder="Select type">
                  {transactionTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Tag color={type.color}>{type.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="account"
                label="Account"
                rules={[{ required: true, message: 'Please select account' }]}
              >
                <Select 
                  placeholder="Select account"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase()?.includes(input.toLowerCase())
                  }
                >
                  {mockAccounts.map(account => (
                    <Option key={account.id} value={account.id}>
                      <div className="flex justify-between">
                        <span>{account.name}</span>
                        <Text type="secondary">({account.code})</Text>
                      </div>
                    </Option>
                  ))}
                </Select>
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
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                  min={0.01}
                  step={0.01}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reference"
            label="Reference Number"
          >
            <Input placeholder="Enter reference number (optional)" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter detailed transaction description..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <TextArea 
              rows={2} 
              placeholder="Any additional notes (optional)..."
              showCount
              maxLength={250}
            />
          </Form.Item>

          {/* Transaction Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <Title level={5}>Transaction Summary</Title>
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
                          <Tag color={transactionTypes.find(t => t.value === values.type)?.color}>
                            {transactionTypes.find(t => t.value === values.type)?.label}
                          </Tag>
                        ) : 'Not selected'}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Account:</Text>
                      <Text>
                        {values.account ? 
                          mockAccounts.find(acc => acc.id === values.account)?.name || 'Unknown' :
                          'Not selected'
                        }
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Amount:</Text>
                      <Text strong style={{ color: values.amount ? '#52c41a' : '#8c8c8c' }}>
                        {values.amount ? `$${values.amount.toLocaleString()}` : '$0.00'}
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

// Tab Components
function AccountsTab({ accounts }: { accounts: LedgerAccount[] }) {
  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'blue';
      case 'liability': return 'red';
      case 'revenue': return 'green';
      case 'expense': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a: LedgerAccount, b: LedgerAccount) => a.code.localeCompare(b.code),
      width: 100,
    },
    {
      title: 'Account Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: LedgerAccount, b: LedgerAccount) => a.name.localeCompare(b.name),
      render: (name: string, record: LedgerAccount) => (
        <div>
          <div className="font-medium">{name}</div>
          {record.description && (
            <div className="text-xs text-gray-500">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getAccountTypeColor(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Asset', value: 'asset' },
        { text: 'Liability', value: 'liability' },
        { text: 'Revenue', value: 'revenue' },
        { text: 'Expense', value: 'expense' },
      ],
      onFilter: (value: any, record: LedgerAccount) => record.type === value,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number, record: LedgerAccount) => (
        <Text strong style={{ color: balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {record.currency} {Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          {balance < 0 && ' (CR)'}
        </Text>
      ),
      align: 'right' as const,
      sorter: (a: LedgerAccount, b: LedgerAccount) => a.balance - b.balance,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: LedgerAccount) => record.isActive === value,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={accounts}
      rowKey="id"
      pagination={{ 
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} accounts`,
      }}
      scroll={{ x: true }}
    />
  );
}

function TransactionsTab() {
  return (
    <div className="text-center py-8">
      <TransactionOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
      <Title level={4}>Transactions</Title>
      <Text type="secondary">View and manage all financial transactions here</Text>
      <div className="mt-4">
        <Button type="primary" icon={<PlusOutlined />}>
          Add Transaction
        </Button>
      </div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="text-center py-8">
      <MoneyCollectOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
      <Title level={4}>Payments</Title>
      <Text type="secondary">Track all incoming and outgoing payments</Text>
      <div className="mt-4">
        <Button type="primary" icon={<PlusOutlined />}>
          Record Payment
        </Button>
      </div>
    </div>
  );
}

function InvoicesTab() {
  return (
    <div className="text-center py-8">
      <FileDoneOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
      <Title level={4}>Invoices</Title>
      <Text type="secondary">Create and manage customer invoices</Text>
      <div className="mt-4">
        <Button type="primary" icon={<PlusOutlined />}>
          Create Invoice
        </Button>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="text-center py-8">
      <BarChartOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
      <Title level={4}>Financial Reports</Title>
      <Text type="secondary">Generate and view financial reports</Text>
      <div className="mt-4 space-x-2">
        <Button type="primary">
          Balance Sheet
        </Button>
        <Button>
          Income Statement
        </Button>
        <Button>
          Cash Flow
        </Button>
      </div>
    </div>
  );
}
