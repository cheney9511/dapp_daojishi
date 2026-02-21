/**
 * main
 * 应用入口：挂载根节点，注入 Wagmi/QueryClient、路由与全局 Context，引入全局样式
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import ProtocolDataSync from '@/components/ProtocolDataSync'
import { wagmiConfig } from '@/config/wagmi'
import App from './App'
import '@/styles/index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppProvider>
            <ProtocolDataSync />
            <App />
          </AppProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
