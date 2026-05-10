'use client';
import { App, ConfigProvider, theme as antdTheme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const BASE_TOKEN = {
  fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
  borderRadius: 8,
  borderRadiusLG: 12,
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          ...BASE_TOKEN,
          colorPrimary:     isDark ? '#f4a7c3' : '#e07a9e',
          colorLink:        isDark ? '#f4a7c3' : '#e07a9e',
          colorBgContainer: isDark ? '#1c1c2e' : '#ffffff',
          colorBgLayout:    isDark ? '#0f0f1a' : '#f5f5f5',
        },
        components: {
          Button: {
            primaryColor: isDark ? '#0f0f1a' : '#ffffff',
          },
          Card: {
            bodyPadding: 16,
            headerPadding: 16,
          },
          Table: {
            cellPaddingBlock: 10,
            cellPaddingInline: 12,
          },
          Layout: {
            siderBg: isDark ? '#0f0f1a' : '#f5f5f5',
          },
          Menu: {
            itemBg: 'transparent',
            groupTitleFontSize: 10,
          },
        },
      }}
    >
      <StyleProvider hashPriority="low">
        <App>{children}</App>
      </StyleProvider>
    </ConfigProvider>
  );
}
