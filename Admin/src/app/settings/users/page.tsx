"use client";

import { useRoleList } from "@/hooks/useRoleList";
import {
  apiCreateUser,
  apiDeleteUser,
  apiGetUsers,
  apiUpdateUser,
} from "@/services/ProjectService";
import { Card } from "@/ui";
import { Table } from "@/ui/data-display";
import { Drawer } from "@/ui/overlay";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Tag,
} from "antd";
import { useEffect, useState } from "react";

const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  status: string;
  isActive?: boolean;
  roleData?: {
    name: string;
  };
}

export default function UsersPage() {
  const { roleOptions } = useRoleList();
  console.log(roleOptions, "roleOptions");

  const [messageApi, contextHolder] = message.useMessage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const isSuperAdmin = selectedUser?.roleData?.name === "Super Admin";

  // Fetch users
  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res: any = await apiGetUsers<{ data: User[]; total: number }>({
        page,
        limit: pageSize,
      });
      setUsers(res.data.data || []);
      setPagination({ current: page, pageSize, total: res.total || 0 });
    } catch (err: any) {
      messageApi.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open drawer for Add
  const handleAdd = () => {
    setSelectedUser(null);
    form.resetFields();
    // Set default values for add mode
    form.setFieldsValue({
      name: "",
      email: "",
      phone: "",
      roleId: undefined,
      status: "active",
      password: "",
    });
    setIsDrawerVisible(true);
  };

  // Open drawer for Edit
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.resetFields();
    form.setFieldsValue({
      ...user,
      roleId: user.roleId,
      status: user.isActive ? "active" : "inactive",
    });
    setIsDrawerVisible(true);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedUser(null);
    form.resetFields();
  };

  // Delete user
  const handleDelete = async (id: string) => {
    try {
      await apiDeleteUser(id);
      messageApi.success("User deleted");
      fetchUsers(pagination.current, pagination.pageSize);
    } catch {
      messageApi.error("Failed to delete user");
    }
  };

  // Submit form (Create or Update)
  const handleFormSubmit = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        roleId: values.roleId,
        password: values.password,
        isActive: values.status === "active" ? true : false,
      };

      if (selectedUser) {
        await apiUpdateUser(selectedUser.id, payload);
        messageApi.success("User updated successfully");
      } else {
        await apiCreateUser(payload);
        messageApi.success("User created successfully");
      }
      handleDrawerClose();
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (err: any) {
      messageApi.error(err?.response?.data?.message || "Failed to save user");
    }
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: string) => {
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="default"
              size="small"
              disabled={record?.roleData?.name === "Super Admin"}
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="text-gray-600">
            Manage users and their permissions (Admin only)
          </p>
        </div>

        <Button type="primary" onClick={handleAdd}>
          Add New User
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => fetchUsers(page, pageSize),
          }}
        />
      </Card>

      <Drawer
        title={selectedUser ? "Edit User" : "Add New User"}
        width={480}
        onClose={handleDrawerClose}
        open={isDrawerVisible}
        style={{ paddingBottom: 80 }}
        styles={{
          header: { borderBottom: "1px solid #e8e8e8" },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please input the full name!" }]}
          >
            <Input placeholder="Enter full name" size="middle" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email" size="middle" />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select
              placeholder="Select a role"
              size="middle"
              options={roleOptions}
              disabled={isSuperAdmin}
            />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select size="middle">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          {!selectedUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input the password!" },
              ]}
            >
              <Input.Password placeholder="Enter password" size="middle" />
            </Form.Item>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <div className="flex justify-end gap-2">
              <Button onClick={handleDrawerClose} size="middle">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" size="middle">
                {selectedUser ? "Update User" : "Create User"}
              </Button>
            </div>
          </div>
        </Form>
      </Drawer>

      {contextHolder}
    </div>
  );
}
