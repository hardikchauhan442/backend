import { Layout, Menu } from "antd";
import Link from "next/link";
import { ReactNode } from "react";

const { Header, Sider, Content } = Layout;

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["dashboard"]}>
          <Menu.Item key="dashboard">
            <Link href="/admin/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="users">
            <Link href="/admin/users">Users</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ backgroundColor: "#fff", padding: 0 }}>
          {/* Header content */}
        </Header>
        <Content style={{ margin: "24px 16px 0" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
