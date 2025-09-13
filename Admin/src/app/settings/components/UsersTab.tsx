"use client";

import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Table, Tag, Dropdown, MenuProps, Modal, Form, Select, message } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;
const { Search } = Input;

// Mock data for users
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@jewelryerp.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2023-06-20 14:30',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@jewelryerp.com',
    role: 'manager',
    status: 'active',
    lastLogin: '2023-06-21 09:15',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@jewelryerp.com',
    role: 'supervisor',
    status: 'inactive',
    lastLogin: '2023-06-15 11:45',
  },
];

const UsersTab: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleAddUser = () => {
    setSelectedUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Handle delete logic here
        message.success('User deleted successfully');
      },
    });
  };

  const handleFormSubmit = (values: any) => {
    // Handle form submission (create/update user)
    if (selectedUser) {
      // Update existing user
      message.success('User updated successfully');
    } else {
      // Create new user
      message.success('User created successfully');
    }
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
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
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Search
          placeholder="Search users..."
          allowClear
          enterButton={<SearchOutlined />}
          className="w-64"
        />
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>

      <Modal
        title={selectedUser ? 'Edit User' : 'Add New User'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={selectedUser || { status: 'active' }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select a role">
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="supervisor">Supervisor</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          
          {!selectedUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input the password!' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersTab;
