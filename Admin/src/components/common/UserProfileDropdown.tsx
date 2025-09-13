"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  LogoutOutlined,
  ProfileOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Space, Typography } from "antd";
import { useRouter } from "next/navigation";

const { Text } = Typography;

export function UserProfileDropdown() {
  const { user, logout } = useAuth();

  const router = useRouter();

  const menuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <ProfileOutlined />,
      onClick: () => router.push("/profile"),
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      onClick: () => router.push("/settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: logout,
      danger: true,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      arrow
      trigger={["click"]}
    >
      <div className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
        <Space>
          <Avatar src={user?.avatar} icon={<UserOutlined />} size="small" />
          <div className="hidden md:block text-left">
            <Text strong className="block text-sm">
              {user?.name}
            </Text>
            <Text type="secondary" className="text-xs capitalize">
              {user?.role}
            </Text>
          </div>
        </Space>
      </div>
    </Dropdown>
  );
}
