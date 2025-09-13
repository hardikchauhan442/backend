"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLocationManager } from "@/utils/locationManager";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Checkbox, Form, Input, Space } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { useApp } = App;

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{
    success: boolean;
    message: string;
    role?: string;
  } | null>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationManager = useLocationManager();
  const redirectPath = searchParams.get("redirect");
  const { message } = useApp();

  // Handle login status changes
  useEffect(() => {
    locationManager.setCurrentLocation("/login");

    if (isAuthenticated) {
      const redirectTo = redirectPath || "/dashboard";
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectPath, locationManager]);

  // Handle login status messages
  useEffect(() => {
    if (loginStatus) {
      if (loginStatus.success) {
        message.success(
          loginStatus.role
            ? `Logged in as ${loginStatus.role}!`
            : "Login successful!"
        );
      } else if (loginStatus.message) {
        message.error(loginStatus.message);
      }
    }
  }, [loginStatus, message]);

  const onSubmit = async (values: LoginFormData) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      setLoginStatus({
        success,
        message: success ? "" : "Invalid email or password",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginStatus({
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Demo login function
  const handleDemoLogin = async (role: string) => {
    setLoading(true);
    try {
      const demoCredentials = {
        admin: { email: "admin@gmail.com", password: "Admin@123" },
      };

      const credentials = demoCredentials[role as keyof typeof demoCredentials];
      const success = await login(credentials.email, credentials.password);
      setLoginStatus({
        success,
        message: success ? "" : "Invalid credentials",
        role: success ? role : undefined,
      });
    } catch (error) {
      console.error("Login error:", error);
      setLoginStatus({
        success: false,
        message: "Demo login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md" title="Login to Admin Panel">
        <Form
          form={form}
          onFinish={onSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
              autoComplete="current-password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <Space direction="vertical" className="w-full">
          <Button
            block
            onClick={() => handleDemoLogin("admin")}
            loading={loading}
          >
            Login as Admin
          </Button>
        </Space>
      </Card>
    </div>
  );
}
