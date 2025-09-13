"use client";

import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, Form, Input, Modal, Row, Select, Space, Table, Tag, message } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;
const { Search } = Input;

// Mock data for roles and permissions
const roles = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full access to all features',
    permissions: ['users:all', 'roles:all', 'settings:all'],
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Manager with limited access',
    permissions: ['inventory:view', 'production:view', 'reports:view'],
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'Supervisor',
    description: 'Supervisor role for production',
    permissions: ['production:view', 'production:update'],
    createdAt: '2023-03-10',
  },
];

// Available permissions
const availablePermissions = [
  { module: 'Dashboard', permissions: ['dashboard:view'] },
  { module: 'Inventory', permissions: ['inventory:view', 'inventory:create', 'inventory:update', 'inventory:delete'] },
  { module: 'Production', permissions: ['production:view', 'production:create', 'production:update', 'production:delete'] },
  { module: 'Quality', permissions: ['quality:view', 'quality:update'] },
  { module: 'Reports', permissions: ['reports:view', 'reports:export'] },
  { module: 'Users', permissions: ['users:view', 'users:create', 'users:update', 'users:delete'] },
  { module: 'Roles', permissions: ['roles:view', 'roles:create', 'roles:update', 'roles:delete'] },
  { module: 'Settings', permissions: ['settings:view', 'settings:update'] },
];

const RolesPermissionsTab: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [form] = Form.useForm();

  const handleAddRole = () => {
    setSelectedRole(null);
    setSelectedPermissions([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
    });
    setIsModalVisible(true);
  };

  const handleDeleteRole = (roleId: string) => {
    Modal.confirm({
      title: 'Delete Role',
      content: 'Are you sure you want to delete this role?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Handle delete logic here
        message.success('Role deleted successfully');
      },
    });
  };

  const handlePermissionChange = (checkedValues: any) => {
    setSelectedPermissions(checkedValues);
  };

  const handleFormSubmit = (values: any) => {
    const roleData = {
      ...values,
      permissions: selectedPermissions,
    };

    // Handle form submission (create/update role)
    if (selectedRole) {
      // Update existing role
      message.success('Role updated successfully');
    } else {
      // Create new role
      message.success('Role created successfully');
    }
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 3).map((permission) => (
            <Tag key={permission} color="blue">
              {permission}
            </Tag>
          ))}
          {permissions.length > 3 && (
            <Tag>+{permissions.length - 3} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRole(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Search
          placeholder="Search roles..."
          allowClear
          enterButton={<SearchOutlined />}
          className="w-64"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRole}
        >
          Add Role
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} roles`,
          }}
        />
      </Card>

      <Modal
        title={selectedRole ? 'Edit Role' : 'Add New Role'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        className="role-permission-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={selectedRole || {}}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please input the role name!' }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input.TextArea rows={2} placeholder="Enter role description" />
          </Form.Item>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Permissions</div>
            <div className="border rounded p-4 max-h-96 overflow-y-auto">
              {availablePermissions.map((module) => (
                <div key={module.module} className="mb-4">
                  <div className="font-medium text-gray-700 mb-2">{module.module}</div>
                  <Checkbox.Group
                    value={selectedPermissions}
                    onChange={handlePermissionChange}
                    className="w-full"
                  >
                    <Row gutter={[16, 8]}>
                      {module.permissions.map((permission) => (
                        <Col span={8} key={permission}>
                          <Checkbox value={permission}>
                            <span className="text-sm">
                              {permission.split(':')[1].charAt(0).toUpperCase() + 
                               permission.split(':')[1].slice(1)} {module.module}
                            </span>
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesPermissionsTab;
