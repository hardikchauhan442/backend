"use client";

import { Navigation } from "@/components/Navigation";
import { themeConfig } from "@/config/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import store from "@/store/store";
import { StyleProvider } from "@ant-design/cssinjs";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { App as AntdApp, ConfigProvider } from "antd";
import { Provider } from "react-redux";

// Create a wrapper component that uses the App context
function AntdAppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AntdApp>
      <StyleProvider hashPriority="high">
        <Navigation>{children}</Navigation>
      </StyleProvider>
    </AntdApp>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AntdRegistry>
        <ConfigProvider
          theme={{
            ...themeConfig,
          }}
        >
          <StyleProvider hashPriority="high">
            <AuthProvider>
              <AntdAppWrapper>{children}</AntdAppWrapper>
            </AuthProvider>
          </StyleProvider>
        </ConfigProvider>
      </AntdRegistry>
    </Provider>
  );
}
