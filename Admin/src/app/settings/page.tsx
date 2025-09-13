"use client";

import { AppstoreOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Tabs, Typography } from 'antd';
import MasterModulesTab from './components/MasterModulesTab';
import RolesPermissionsTab from './components/RolesPermissionsTab';
import UsersTab from './components/UsersTab';

const { Title } = Typography;

const SettingsPage = () => {
  return (
    <div className="p-4">
      <Title level={4} className="mb-6">Settings</Title>
      
      <Tabs
        defaultActiveKey="users"
        size="large"
        items={[
          {
            key: 'users',
            label: (
              <span>
                <UserOutlined className="mr-2" />
                Users
              </span>
            ),
            children: <UsersTab />,
          },
          {
            key: 'roles',
            label: (
              <span>
                <LockOutlined className="mr-2" />
                Roles & Permissions
              </span>
            ),
            children: <RolesPermissionsTab />,
          },
          {
            key: 'modules',
            label: (
              <span>
                <AppstoreOutlined className="mr-2" />
                Master Modules
              </span>
            ),
            children: <MasterModulesTab />,
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
