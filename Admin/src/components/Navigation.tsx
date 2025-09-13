"use client";

import { appConfig } from "@/config/app.config";
import { useAuth } from "@/contexts/AuthContext";

import {
  AlertOutlined,
  BarChartOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  GoldOutlined,
  InboxOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoneyCollectOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, theme } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const { Header } = Layout;

interface NavigationProps {
  children: React.ReactNode;
}

// Loading Skeleton Component
const NavigationSkeleton = () => (
  <Layout style={{ minHeight: "100vh" }}>
    <div
      style={{
        width: 260,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "#ffffff",
        borderRight: "1px solid #f0f0f0",
        boxShadow: "2px 0 8px 0 rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      {/* Logo skeleton */}
      <div
        style={{
          height: "80px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "8px",
            background: "#f0f0f0",
            marginRight: "12px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div>
          <div
            style={{
              width: "120px",
              height: "20px",
              background: "#f0f0f0",
              borderRadius: "4px",
              marginBottom: "8px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: "60px",
              height: "12px",
              background: "#f0f0f0",
              borderRadius: "4px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Menu items skeleton */}
      <div style={{ padding: "16px" }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              height: "40px",
              background: "#f0f0f0",
              borderRadius: "8px",
              marginBottom: "8px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>

      {/* Logout skeleton */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #f0f0f0",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            height: "40px",
            background: "#f0f0f0",
            borderRadius: "8px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>

    {/* Header skeleton */}
    <Layout>
      <div
        style={{
          height: 64,
          background: "#fff",
          marginLeft: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#f0f0f0",
              borderRadius: "4px",
              marginRight: "16px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: "200px",
              height: "20px",
              background: "#f0f0f0",
              borderRadius: "4px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <div
          style={{
            width: "100px",
            height: "32px",
            background: "#f0f0f0",
            borderRadius: "16px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content skeleton */}
      <div
        style={{
          marginLeft: 260,
          padding: "16px",
          background: "#f0f2f5",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            minHeight: "calc(100vh - 112px)",
          }}
        >
          <div
            style={{
              width: "300px",
              height: "32px",
              background: "#f0f0f0",
              borderRadius: "8px",
              marginBottom: "24px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: "100%",
              height: "200px",
              background: "#f0f0f0",
              borderRadius: "8px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </Layout>

    <style jsx>{`
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `}</style>
  </Layout>
);

export function Navigation({ children }: NavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const pathname = usePathname();
  const router = useRouter();
  const {
    token: { colorPrimary },
  } = theme.useToken();

  // Handle client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const primaryColor = appConfig.theme.primaryColor;
  const lightPrimaryColor = `${primaryColor}1a`; // 10% opacity

  const cssVariables = {
    "--primary-color": primaryColor,
    "--light-primary-color": lightPrimaryColor,
  } as React.CSSProperties;

  const isPublicRoute = appConfig.publicRoutes.includes(pathname);

  // Show skeleton loading while hydrating or for authenticated routes before auth state is determined
  if (!isHydrated || (!isPublicRoute && !isAuthenticated && isHydrated)) {
    // Only show skeleton for protected routes during hydration
    if (!isPublicRoute) {
      return <NavigationSkeleton />;
    }
  }

  if (!isAuthenticated || isPublicRoute) {
    return <>{children}</>;
  }

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      key: "jobs",
      icon: <FileTextOutlined style={{ fontSize: "18px" }} />,
      label: "Jobs",
      href: "/jobs",
    },
    {
      key: "inventory",
      icon: <InboxOutlined style={{ fontSize: "18px" }} />,
      label: "Inventory",
      children: [
        {
          key: "raw-materials",
          icon: <GoldOutlined />,
          label: "Raw Materials",
          href: "/inventory/raw-materials",
        },
        {
          key: "finished-goods",
          icon: <CheckCircleOutlined />,
          label: "Finished Goods",
          href: "/inventory/finished-goods",
        },
      ],
    },
    {
      key: "production",
      icon: <BuildOutlined style={{ fontSize: "18px" }} />,
      label: "Production",
      children: [
        {
          key: "tracker",
          icon: <LineChartOutlined />,
          label: "Production Tracker",
          href: "/production/tracker",
        },
        {
          key: "wastage",
          icon: <AlertOutlined />,
          label: "Wastage",
          href: "/production/wastage",
        },
        {
          key: "returns",
          icon: <CloseCircleOutlined />,
          label: "Returns",
          href: "/production/returns",
        },
      ],
    },
    {
      key: "accounts",
      icon: <DollarOutlined style={{ fontSize: "18px" }} />,
      label: "Accounts & Ledger",
      children: [
        {
          key: "ledger",
          icon: <FileTextOutlined />,
          label: "General Ledger",
          href: "/accounts/ledger",
        },
        {
          key: "payments",
          icon: <MoneyCollectOutlined />,
          label: "Payments",
          href: "/accounts/payments",
        },
        {
          key: "invoices",
          icon: <FileDoneOutlined />,
          label: "Invoices",
          href: "/accounts/invoices",
        },
        {
          key: "expenses",
          icon: <DollarOutlined />,
          label: "Expenses",
          href: "/accounts/expenses",
        },
        {
          key: "financial-reports",
          icon: <BarChartOutlined />,
          label: "Financial Reports",
          href: "/accounts/financial-reports",
        },
      ],
    },
    // {
    //   key: "quality",
    //   icon: <CheckCircleOutlined />,
    //   label: "Quality Control",
    //   href: "/quality",
    // },
    {
      key: "reports",
      icon: <FileDoneOutlined />,
      label: "Reports",
      href: "/reports",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      children: [
        {
          key: "users",
          icon: <UserOutlined />,
          label: "Users",
          href: "/settings/users",
        },
        {
          key: "vendors-manufacturers",
          icon: <TeamOutlined />,
          label: "Vendors & Manufacturers",
          href: "/settings/vendors-manufacturers",
        },
        {
          key: "roles",
          icon: <SafetyCertificateOutlined />,
          label: "Roles & Permissions",
          href: "/settings/roles",
        },
        {
          key: "master-data",
          icon: <ToolOutlined />,
          label: "Master Data",
          href: "/settings/master-data",
        },
      ],
    },
  ];

  const renderSidebar = () => (
    <div
      style={{
        ...cssVariables,
        width: collapsed ? 80 : 260,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "#ffffff",
        borderRight: "1px solid #f0f0f0",
        // boxShadow: "2px 0 8px 0 rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center justify-${
          collapsed ? "center" : "start"
        } bg-white border-b border-gray-100 cursor-pointer`}
        style={{
          height: "80px",
          flexShrink: 0,
          padding: collapsed ? "0" : "0 16px",
        }}
      >
        <Link
          href="/dashboard"
          scroll={false}
          as={"/dashboard"}
          prefetch={true}
        >
          {collapsed ? (
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${appConfig.theme.primaryColor} 0%, ${appConfig.theme.primaryColor}CC 100%)`,
              }}
            >
              <span className="text-white font-bold text-xl">I</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${appConfig.theme.primaryColor} 0%, ${appConfig.theme.primaryColor}CC 100%)`,
                }}
              >
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800 whitespace-nowrap">
                  Isha MFG
                </span>
                <span className="text-xs text-gray-500">v2.0.0</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Menu */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 0",
          minHeight: 0,
        }}
        className="custom-scrollbar"
      >
        {menuItems.map((item) => (
          <div key={item.key} className="px-2 mb-1">
            {item.href ? (
              <Link
                href={item.href}
                scroll={false}
                as={item.href}
                prefetch={true}
              >
                <div
                  className={`flex items-center h-10 px-4 rounded-lg cursor-pointer transition-colors ${
                    pathname === item.href
                      ? "bg-[var(--primary-color)] text-white"
                      : "text-gray-700 hover:bg-[var(--light-primary-color)] hover:text-[var(--primary-color)]"
                  }`}
                >
                  <span className={`${collapsed ? "mr-0" : "mr-3"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="mb-2">
                {!collapsed && (
                  <div className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                )}
                {item.children?.map((child) => (
                  <Link
                    key={child.key}
                    as={child.href}
                    href={child.href}
                    prefetch={true}
                    scroll={false}
                  >
                    <div
                      className={`flex items-center h-10 px-4 rounded-lg cursor-pointer transition-colors mb-1 ${
                        pathname === child.href
                          ? "bg-[var(--primary-color)] text-white"
                          : "text-gray-700 hover:bg-[var(--light-primary-color)] hover:text-[var(--primary-color)]"
                      }`}
                    >
                      <span className="mr-3">{child.icon}</span>
                      {!collapsed && (
                        <span className="whitespace-nowrap">{child.label}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div
        style={{
          flexShrink: 0,
          padding: "16px",
          borderTop: "1px solid #f0f0f0",
          background: "#ffffff",
        }}
      >
        <div
          className="flex items-center p-2 rounded-lg cursor-pointer text-gray-700 hover:bg-[var(--light-primary-color)] hover:text-[var(--primary-color)] transition-colors"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogoutOutlined className="text-lg" />
          {!collapsed && <span className="ml-3 whitespace-nowrap">Logout</span>}
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <Header
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
        // boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
        height: 64,
        marginLeft: collapsed ? 80 : 260,
        transition: "all 0.2s",
      }}
    >
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ width: 48, height: 48 }}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-lg">
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ backgroundColor: colorPrimary }}
            src={user?.avatar}
          />
          {!collapsed && (
            <div className="hidden md:block">
              <div className="text-sm font-medium">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500">
                {user?.role || "Admin"}
              </div>
            </div>
          )}
        </div>
      </div>
    </Header>
  );

  const renderContent = () => (
    <div
      style={{
        marginLeft: collapsed ? 80 : 260,
        padding: "16px",
        minHeight: "calc(100vh - 64px)",
        background: "#f0f2f5",
        transition: "all 0.2s",
      }}
    >
      <div
        className="bg-white rounded-lg  p-4"
        style={{ minHeight: "calc(100vh - 112px)" }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {renderSidebar()}
      <Layout>
        {renderHeader()}
        {renderContent()}
      </Layout>
    </Layout>
  );
}
