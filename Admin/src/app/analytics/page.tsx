"use client";

import React from "react";
import { Card, Row, Col, Statistic, Progress, Table } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { withRouteGuard } from "@/components/RouteGuard";

const mockAnalyticsData = [
  { id: 1, metric: "Page Views", value: 12543, change: 12.5 },
  { id: 2, metric: "Unique Visitors", value: 3421, change: -2.3 },
  { id: 3, metric: "Bounce Rate", value: 45.2, change: -5.1 },
  { id: 4, metric: "Session Duration", value: 245, change: 8.7 },
];

function AnalyticsPage() {
  const { user } = useAuth();

  const columns = [
    {
      title: "Metric",
      dataIndex: "metric",
      key: "metric",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (value: number, record: any) => {
        if (record.metric === "Bounce Rate") return `${value}%`;
        if (record.metric === "Session Duration") return `${value}s`;
        return value.toLocaleString();
      },
    },
    {
      title: "Change",
      dataIndex: "change",
      key: "change",
      render: (change: number) => (
        <span className={change > 0 ? "text-green-600" : "text-red-600"}>
          {change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(change)}%
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          View analytics and performance metrics (Available to: Admin, Editor, Viewer)
        </p>
        <p className="text-sm text-blue-600">
          Current user role: {user?.role}
        </p>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={112893}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
              prefix="$"
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={1128}
              valueStyle={{ color: "#1890ff" }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={9.3}
              precision={1}
              valueStyle={{ color: "#cf1322" }}
              prefix={<ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Progress
              type="circle"
              percent={75}
              format={() => "75% Goal"}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Performance Metrics">
            <Table
              columns={columns}
              dataSource={mockAnalyticsData}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Traffic Sources" className="h-64">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Direct</span>
                  <span>45%</span>
                </div>
                <Progress percent={45} strokeColor="#1890ff" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Search</span>
                  <span>30%</span>
                </div>
                <Progress percent={30} strokeColor="#52c41a" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Social</span>
                  <span>25%</span>
                </div>
                <Progress percent={25} strokeColor="#faad14" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// This page is accessible to admin, editor, and viewer roles
export default withRouteGuard(AnalyticsPage, {
  requiresAuth: true,
  allowedRoles: ["admin", "editor", "viewer"],
  redirectTo: "/dashboard",
});
