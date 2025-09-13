"use client";

import { useSubMasterOptions } from "@/hooks/useSubMasterOptions";
import {
  apiCreateRolePermission,
  apiDeleteRolePermission,
  apiGetRolePermissions,
  apiUpdateRolePermission,
} from "@/services/ProjectService";
import { Button, Card } from "@/ui";
import { Table } from "@/ui/data-display";
import { Drawer } from "@/ui/overlay";
import { MASTERS } from "@/utils/master";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { App, Checkbox, Col, Form, Input, Row, Space, Switch, Tag } from "antd";
import { useEffect, useState } from "react";

const { Search } = Input;

const availablePermissions = [
  {
    module: "Dashboard",
    name: "dashboard",
    actions: ["view"],
  },
  {
    module: "Inventory",
    name: "inventory",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "Production",
    name: "production",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "Quality",
    name: "quality",
    actions: ["view", "edit"],
  },
  {
    module: "Reports",
    name: "reports",
    actions: ["view", "export"],
  },
  {
    module: "Users",
    name: "users",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "Roles",
    name: "roles",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "Settings",
    name: "settings",
    actions: ["view", "edit"],
  },
];

interface RolePermission {
  id: string;
  roleId?: string; // Keep for backward compatibility
  role_name: string; // New field for role name
  description: string;
  permission: Array<{
    name: string;
    actions: {
      view?: boolean;
      create?: boolean;
      edit?: boolean;
      delete?: boolean;
      export?: boolean;
    };
  }>;
  roleData?: {
    name: string;
  };
  isActive: boolean;
  createdAt?: string;
  role?: {
    name: string;
  };
}

const RolesPage = () => {
  const roleOptions = useSubMasterOptions(MASTERS.ROLE);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<RolePermission | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [form] = Form.useForm();
  const { modal, message } = App.useApp();

  // Fetch role permissions
  const fetchRolePermissions = async (page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: pageSize,
      };

      if (search) {
        params.search = search;
      }

      const res: any = await apiGetRolePermissions<{
        data: RolePermission[];
        total: number;
      }>(params);
      setRolePermissions(res.data.data || []);
      setPagination({ current: page, pageSize, total: res.total || 0 });
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to fetch permissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolePermissions(pagination.current, pagination.pageSize, searchText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert backend permission format to UI format
  const convertBackendToUI = (permissions: RolePermission["permission"]) => {
    const uiFormat: Record<string, Record<string, boolean>> = {};

    permissions?.forEach((perm) => {
      uiFormat[perm.name] = {};
      // actions is now a single object, not an array
      Object.keys(perm.actions).forEach((key) => {
        if (perm.actions[key as keyof typeof perm.actions]) {
          uiFormat[perm.name][key] = true;
        }
      });
    });

    return uiFormat;
  };

  // Convert UI permission format to backend format - UPDATED FOR OBJECT FORMAT
  const convertUIToBackend = (
    uiPermissions: Record<string, Record<string, boolean>>
  ) => {
    const backendFormat: Array<{
      name: string;
      actions: {
        view?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
        export?: boolean;
      };
    }> = [];

    Object.keys(uiPermissions).forEach((moduleName) => {
      const moduleActions = uiPermissions[moduleName];
      const hasAnyAction = Object.values(moduleActions).some(Boolean);

      if (hasAnyAction) {
        // Create a single action object with all selected permissions
        const actionObject: {
          view?: boolean;
          create?: boolean;
          edit?: boolean;
          delete?: boolean;
          export?: boolean;
        } = {};

        Object.keys(moduleActions).forEach((action) => {
          if (moduleActions[action]) {
            actionObject[action as keyof typeof actionObject] = true;
          }
        });

        backendFormat.push({
          name: moduleName,
          actions: actionObject, // Single action object (not array)
        });
      }
    });

    return backendFormat;
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchRolePermissions(1, pagination.pageSize, value);
  };

  const handleAddPermission = () => {
    setSelectedPermission(null);
    setSelectedPermissions({});
    form.resetFields();
    form.setFieldsValue({
      role_name: "",
      description: "",
      isActive: true,
    });
    setIsDrawerVisible(true);
  };

  const handleEditPermission = (permission: RolePermission) => {
    setSelectedPermission(permission);
    const uiPermissions = convertBackendToUI(permission.permission);
    setSelectedPermissions(uiPermissions);
    form.resetFields();
    form.setFieldsValue({
      role_name: permission.role_name || permission.roleData?.name || "",
      description: permission.description,
      isActive: permission.isActive,
    });
    setIsDrawerVisible(true);
  };

  const handleDeletePermission = (permissionId: string) => {
    modal.confirm({
      title: "Delete Permission",
      content: "Are you sure you want to delete this permission?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await apiDeleteRolePermission(permissionId);
          message.success("Permission deleted successfully");
          fetchRolePermissions(
            pagination.current,
            pagination.pageSize,
            searchText
          );
        } catch (err: any) {
          message.error(
            err?.response?.data?.message || "Failed to delete permission"
          );
        }
      },
    });
  };

  const handlePermissionChange = (
    moduleName: string,
    action: string,
    checked: boolean
  ) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [action]: checked,
      },
    }));
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedPermission(null);
    setSelectedPermissions({});
    form.resetFields();
  };

  const handleFormSubmit = async (values: any) => {
    try {
      const backendPermissions = convertUIToBackend(selectedPermissions);

      if (backendPermissions.length === 0) {
        message.error("Please select at least one permission");
        return;
      }

      const permissionData = {
        role_name: values.role_name, // Changed from roleId to role_name
        description: values.description,
        permission: backendPermissions,
        isActive: values.isActive,
      };

      // console.log("Sending payload:", JSON.stringify(permissionData, null, 2));

      if (selectedPermission) {
        await apiUpdateRolePermission(selectedPermission.id, permissionData);
        message.success("Permission updated successfully");
      } else {
        await apiCreateRolePermission(permissionData);
        message.success("Permission created successfully");
      }

      handleDrawerClose();
      fetchRolePermissions(pagination.current, pagination.pageSize, searchText);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to save permission"
      );
    }
  };

  // Helper function to render permission tags
  const renderPermissionTags = (permissions: RolePermission["permission"]) => {
    const tags: string[] = [];
    permissions?.forEach((perm) => {
      // actions is now a single object, not an array
      Object.keys(perm.actions).forEach((key) => {
        if (perm.actions[key as keyof typeof perm.actions]) {
          tags.push(`${perm.name}:${key}`);
        }
      });
    });

    return (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 2).map((tag) => (
          <Tag key={tag} color="blue">
            {tag}
          </Tag>
        ))}
        {tags.length > 2 && <Tag>+{tags.length - 2} more</Tag>}
      </div>
    );
  };

  const columns = [
    {
      title: "Role Name",
      dataIndex: "role_name",
      key: "role_name",
      render: (text: string, record: RolePermission) => {
        // Display role_name if available, otherwise fallback to roleData.name
        const displayName =
          text || record?.roleData?.name || record?.role?.name || "—";
        return <span className="font-medium">{displayName}</span>;
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Permissions",
      dataIndex: "permission",
      key: "permission",
      render: (permissions: RolePermission["permission"]) =>
        renderPermissionTags(permissions),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: RolePermission) => (
        <Space size="small">
          <Button
            variant="default"
            icon={<EditOutlined />}
            onClick={() => handleEditPermission(record)}
          />
          <Button
            variant="default"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePermission(record.id)}
          />
        </Space>
      ),
    },
  ];

  const hasSelectedPermissions = Object.values(selectedPermissions).some(
    (module) => Object.values(module).some(Boolean)
  );

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Roles & Permissions
          </h2>
          <p className="text-gray-600">
            Manage role permissions and access controls
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusOutlined />}
          onClick={handleAddPermission}
        >
          Add Permission
        </Button>
      </div>

      <Card className="">
        <div className="flex justify-between items-center mb-6">
          <Search
            placeholder="Search permissions by description or role..."
            allowClear
            enterButton={<SearchOutlined />}
            className="w-80"
            size="middle"
            onSearch={handleSearch}
          />
        </div>

        <Table
          columns={columns}
          dataSource={rolePermissions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} permissions`,
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize,
                total: pagination.total,
              });
              fetchRolePermissions(page, pageSize, searchText);
            },
          }}
          className="rounded-lg"
        />
      </Card>

      <Drawer
        title={selectedPermission ? "Edit Permission" : "Add New Permission"}
        width={600}
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
          {/* Changed from Select dropdown to Input text field */}
          <Form.Item
            name="role_name"
            label="Role Name"
            rules={[
              { required: true, message: "Please enter the role name!" },
              {
                min: 2,
                message: "Role name must be at least 2 characters long!",
              },
              {
                max: 50,
                message: "Role name must not exceed 50 characters!",
              },
            ]}
          >
            <Input
              placeholder="Enter role name (e.g., Admin, Manager, User)"
              size="middle"
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Enter permission description"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              defaultChecked
            />
          </Form.Item>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2 text-gray-700">
              Permissions <span className="text-red-500">*</span>
            </div>
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-white">
              {availablePermissions.map((module) => (
                <div key={module.name} className="mb-4">
                  <div className="font-medium text-gray-700 mb-2">
                    {module.module}
                  </div>
                  <Row gutter={[16, 8]}>
                    {module.actions.map((action) => (
                      <Col span={12} key={action}>
                        <Checkbox
                          checked={
                            selectedPermissions[module.name]?.[action] || false
                          }
                          onChange={(e) =>
                            handlePermissionChange(
                              module.name,
                              action,
                              e.target.checked
                            )
                          }
                        >
                          <span className="text-sm">
                            {action.charAt(0).toUpperCase() + action.slice(1)}{" "}
                            {module.module}
                          </span>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </div>
            {!hasSelectedPermissions && (
              <div className="text-red-500 text-xs mt-1">
                Please select at least one permission
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <div className="flex justify-end gap-2">
              <Button onClick={handleDrawerClose} size="middle">
                Cancel
              </Button>
              <Button
                variant="primary"
                htmlType="submit"
                size="middle"
                disabled={!hasSelectedPermissions}
              >
                {selectedPermission ? "Update Permission" : "Create Permission"}
              </Button>
            </div>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default function WrappedRolesPage() {
  return (
    <App>
      <RolesPage />
    </App>
  );
}
