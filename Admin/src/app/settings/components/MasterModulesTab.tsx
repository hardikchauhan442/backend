"use client";

import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, message } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;
const { Search } = Input;

// Mock data for master modules
const masterModules = [
  {
    id: '1',
    name: 'Product Categories',
    code: 'PROD_CAT',
    description: 'Product categories for inventory items',
    status: 'active',
    lastUpdated: '2023-06-15',
  },
  {
    id: '2',
    name: 'Material Types',
    code: 'MAT_TYPE',
    description: 'Types of raw materials used in production',
    status: 'active',
    lastUpdated: '2023-06-10',
  },
  {
    id: '3',
    name: 'Quality Parameters',
    code: 'QUAL_PARAM',
    description: 'Parameters for quality control checks',
    status: 'inactive',
    lastUpdated: '2023-05-28',
  },
  {
    id: '4',
    name: 'Production Stages',
    code: 'PROD_STAGE',
    description: 'Different stages in the production process',
    status: 'active',
    lastUpdated: '2023-06-12',
  },
];

const MasterModulesTab: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [form] = Form.useForm();

  const handleAddModule = () => {
    setSelectedModule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditModule = (module: any) => {
    setSelectedModule(module);
    form.setFieldsValue(module);
    setIsModalVisible(true);
  };

  const handleDeleteModule = (moduleId: string) => {
    Modal.confirm({
      title: 'Delete Master Module',
      content: 'Are you sure you want to delete this master module?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Handle delete logic here
        message.success('Master module deleted successfully');
      },
    });
  };

  const handleFormSubmit = (values: any) => {
    // Handle form submission (create/update module)
    if (selectedModule) {
      // Update existing module
      message.success('Master module updated successfully');
    } else {
      // Create new module
      message.success('Master module created successfully');
    }
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Module Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditModule(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteModule(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Search
          placeholder="Search master modules..."
          allowClear
          enterButton={<SearchOutlined />}
          className="w-64"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddModule}
        >
          Add Module
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={masterModules}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} modules`,
          }}
        />
      </Card>

      <Modal
        title={selectedModule ? 'Edit Master Module' : 'Add New Master Module'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={selectedModule || { status: 'active' }}
        >
          <Form.Item
            name="name"
            label="Module Name"
            rules={[{ required: true, message: 'Please input the module name!' }]}
          >
            <Input placeholder="Enter module name" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="Module Code"
            rules={[{ required: true, message: 'Please input the module code!' }]}
          >
            <Input placeholder="Enter module code (e.g., PROD_CAT)" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter module description" />
          </Form.Item>
          
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {selectedModule ? 'Update Module' : 'Create Module'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MasterModulesTab;
