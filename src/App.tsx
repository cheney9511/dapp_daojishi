/**
 * App
 * 根组件：配置路由（首页/机制/白皮书）及全局 Toast 挂载点
 */

import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Rules from '@/pages/Rules'
import Docs from '@/pages/Docs'
import Toast from '@/components/Toast'

function App(): JSX.Element {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
      <Toast />
    </div>
  )
}

export default App
