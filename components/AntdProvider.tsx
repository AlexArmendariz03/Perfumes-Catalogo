'use client'

import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider, theme } from 'antd'
import esES from 'antd/locale/es_ES'

// Paleta del sitio (ver tailwind.config.js): dorado sobre negro, texto crema
const GOLD = '#C9A84C'
const ONYX = '#0A0A0A'
const CREAM = '#F5F0E8'

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={esES}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: GOLD,
            colorInfo: GOLD,
            colorLink: GOLD,
            colorLinkHover: '#E2C97E',
            colorBgBase: ONYX,
            colorBgContainer: '#141414',
            colorBgElevated: '#161616',
            colorText: CREAM,
            colorTextSecondary: 'rgba(245,240,232,0.6)',
            colorTextTertiary: 'rgba(245,240,232,0.45)',
            colorTextPlaceholder: 'rgba(245,240,232,0.35)',
            colorTextLightSolid: ONYX, // texto sobre el dorado (botón primario, opción elegida)
            colorBorder: 'rgba(201,168,76,0.3)',
            colorBorderSecondary: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            controlHeight: 40,
            fontFamily: "'Inter', system-ui, sans-serif",
          },
          components: {
            Segmented: {
              trackBg: '#141414',
              itemColor: 'rgba(245,240,232,0.7)',
              itemHoverColor: GOLD,
              itemHoverBg: 'rgba(201,168,76,0.08)',
              itemSelectedBg: GOLD,
              itemSelectedColor: ONYX,
            },
            Select: {
              optionSelectedBg: 'rgba(201,168,76,0.15)',
              optionSelectedColor: GOLD,
              multipleItemBg: 'rgba(201,168,76,0.15)',
            },
            Pagination: {
              itemActiveBg: GOLD,
              itemActiveColor: ONYX,
              itemActiveColorHover: ONYX,
              itemBg: 'transparent',
            },
            Tag: {
              defaultBg: 'rgba(201,168,76,0.1)',
              defaultColor: GOLD,
            },
            Drawer: {
              colorBgElevated: '#111111',
              colorIcon: GOLD,
              colorIconHover: '#E2C97E',
            },
            Button: {
              primaryColor: ONYX,
              defaultBg: 'transparent',
              defaultColor: GOLD,
              defaultBorderColor: 'rgba(201,168,76,0.4)',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  )
}
