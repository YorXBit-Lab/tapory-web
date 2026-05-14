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
          colorPrimary:     isDark ? '#D8C3AE' : '#8B6B52',
          colorLink:        isDark ? '#D8C3AE' : '#8B6B52',
          colorBgContainer: isDark ? '#261A0E' : '#FFFDF9',
          colorBgLayout:    isDark ? '#1A1208' : '#F6F0E8',
        },
        components: {
          Button: {
            primaryColor: isDark ? '#1A1208' : '#ffffff',
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
            siderBg: isDark ? '#1A1208' : '#F6F0E8',
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
