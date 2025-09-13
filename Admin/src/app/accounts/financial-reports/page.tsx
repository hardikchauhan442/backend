"use client";

import { Card } from "@/ui";
import { Table } from "@/ui/data-display";
import {
  BarChartOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  LineChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Row,
  Select,
  Spin,
  Statistic,
  Tabs,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import type { Expense, FinancialSummary, Revenue } from "../ledger/types";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

// Mock data - in a real app, this would come from an API
const mockExpenses: Expense[] = [
  // Add mock expense data here
];

const mockRevenues: Revenue[] = [
  // Add mock revenue data here
];

const generateFinancialSummary = (
  startDate: Date,
  endDate: Date
): FinancialSummary => {
  // In a real app, this would be calculated from actual data
  const totalIncome = Math.random() * 100000;
  const totalExpenses = Math.random() * 50000;

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    currency: "USD",
    period: { start: startDate, end: endDate },
    byCategory: [
      { category: "Sales", amount: totalIncome * 0.7, percentage: 70 },
      { category: "Services", amount: totalIncome * 0.2, percentage: 20 },
      { category: "Other Income", amount: totalIncome * 0.1, percentage: 10 },
    ],
  };
};

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [reportType, setReportType] = useState("summary");
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);

  // Load report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);

        // In a real app, these would be API calls
        // const [summaryRes, expensesRes, revenuesRes] = await Promise.all([
        //   fetch(`/api/accounts/financial-reports/summary?start=${dateRange[0].toISOString()}&end=${dateRange[1].toISOString()}`),
        //   fetch(`/api/accounts/expenses?start=${dateRange[0].toISOString()}&end=${dateRange[1].toISOString()}`),
        //   fetch(`/api/accounts/revenues?start=${dateRange[0].toISOString()}&end=${dateRange[1].toISOString()}`),
        // ]);

        // const [summaryData, expensesData, revenuesData] = await Promise.all([
        //   summaryRes.json(),
        //   expensesRes.json(),
        //   revenuesRes.json(),
        // ]);

        // Mock data for now
        const summaryData = generateFinancialSummary(
          dateRange[0].toDate(),
          dateRange[1].toDate()
        );

        setFinancialSummary(summaryData);
        setExpenses(mockExpenses);
        setRevenues(mockRevenues);
      } catch (error) {
        console.error("Failed to load report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [dateRange]);

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const handleExport = (format: "pdf" | "excel") => {
    // In a real app, this would trigger a download
    console.log(
      `Exporting ${reportType} report to ${format} for ${dateRange[0].format(
        "YYYY-MM-DD"
      )} to ${dateRange[1].format("YYYY-MM-DD")}`
    );
  };

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {financialSummary && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Total Income"
                value={financialSummary.totalIncome}
                precision={2}
                prefix="$"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Total Expenses"
                value={financialSummary.totalExpenses}
                precision={2}
                prefix="$"
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Net Profit"
                value={financialSummary.netProfit}
                precision={2}
                prefix="$"
                valueStyle={{
                  color:
                    financialSummary.netProfit >= 0 ? "#3f8600" : "#cf1322",
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Income by Category">
            <div className="h-64 flex items-center justify-center">
              <Text type="secondary">Income by Category Chart</Text>
              {/* In a real app, this would be a chart component */}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Expenses by Category">
            <div className="h-64 flex items-center justify-center">
              <Text type="secondary">Expenses by Category Chart</Text>
              {/* In a real app, this would be a chart component */}
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Income Breakdown">
        <Table
          columns={[
            { title: "Category", dataIndex: "category", key: "category" },
            {
              title: "Amount",
              dataIndex: "amount",
              key: "amount",
              render: (amount: number) =>
                `$${amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}`,
              align: "right",
            },
            {
              title: "Percentage",
              key: "percentage",
              render: (_: any, record: any) => `${record.percentage}%`,
              align: "right",
            },
          ]}
          dataSource={financialSummary?.byCategory || []}
          rowKey="category"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );

  const renderExpensesTab = () => (
    <Table
      columns={[
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
          render: (date: string) => dayjs(date).format("MMM D, YYYY"),
        },
        { title: "Description", dataIndex: "description", key: "description" },
        { title: "Category", dataIndex: "category", key: "category" },
        {
          title: "Amount",
          dataIndex: "amount",
          key: "amount",
          render: (amount: number, record: Expense) => (
            <Text strong style={{ color: "red" }}>
              -{record.currency}{" "}
              {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          ),
          align: "right",
        },
      ]}
      dataSource={expenses}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      size="small"
    />
  );

  const renderRevenueTab = () => (
    <Table
      columns={[
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
          render: (date: string) => dayjs(date).format("MMM D, YYYY"),
        },
        { title: "Source", dataIndex: "source", key: "source" },
        { title: "Description", dataIndex: "description", key: "description" },
        {
          title: "Amount",
          dataIndex: "amount",
          key: "amount",
          render: (amount: number, record: Revenue) => (
            <Text strong style={{ color: "green" }}>
              +{record.currency}{" "}
              {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          ),
          align: "right",
        },
      ]}
      dataSource={revenues}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      size="small"
    />
  );

  const items = [
    {
      key: "summary",
      label: "Summary",
      icon: <BarChartOutlined />,
      children: renderSummaryTab(),
    },
    {
      key: "expenses",
      label: "Expenses",
      icon: <LineChartOutlined />,
      children: renderExpensesTab(),
    },
    {
      key: "revenue",
      label: "Revenue",
      icon: <LineChartOutlined />,
      children: renderRevenueTab(),
    },
  ];

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <Title level={4} className="mb-0">
          Financial Reports
        </Title>

        <div className="flex flex-col sm:flex-row gap-4">
          <RangePicker
            value={dateRange as any}
            onChange={handleDateRangeChange}
            className="w-full sm:w-auto"
            allowClear={false}
          />

          <Select
            value={reportType}
            onChange={setReportType}
            className="w-full sm:w-40"
          >
            <Option value="summary">Summary Report</Option>
            <Option value="profit-loss">Profit & Loss</Option>
            <Option value="balance-sheet">Balance Sheet</Option>
            <Option value="cash-flow">Cash Flow</Option>
          </Select>

          <Dropdown
            menu={{
              items: [
                {
                  key: "pdf",
                  label: "Export as PDF",
                  icon: <FilePdfOutlined />,
                  onClick: () => handleExport("pdf"),
                },
                {
                  key: "excel",
                  label: "Export as Excel",
                  icon: <FileExcelOutlined />,
                  onClick: () => handleExport("excel"),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button icon={<DownloadOutlined />}>Export</Button>
          </Dropdown>

          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              setDateRange([dayjs().startOf("month"), dayjs().endOf("month")])
            }
          >
            Reset
          </Button>
        </div>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Tabs
            activeKey={reportType}
            onChange={setReportType}
            items={items}
            className="financial-reports-tabs"
          />
        </Spin>
      </Card>
    </div>
  );
}

// Dropdown component for the export button
const Dropdown = ({ children, menu, trigger }: any) => {
  const [visible, setVisible] = useState(false);

  const handleClick = (e: any) => {
    if (trigger && trigger.includes("click")) {
      e.preventDefault();
      setVisible(!visible);
    }
  };

  const handleMenuClick = (e: any) => {
    if (menu && menu.onClick) {
      menu.onClick(e);
    }
    setVisible(false);
  };

  return (
    <div className="relative">
      <div onClick={handleClick}>{children}</div>
      {visible && menu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          {menu.items.map((item: any) => (
            <div
              key={item.key}
              onClick={() => handleMenuClick({ key: item.key })}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
