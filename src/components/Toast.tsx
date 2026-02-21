/**
 * Toast
 * 全局轻提示：挂载到 #app-overlays，支持 success/error/warning/info、自动消失与进度条、可选链接
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAppContext } from '@/context/AppContext'

/** 单条 Toast：id、类型、标题、正文、自动关闭时长、进度（0～100）、可选外链 */
export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  progress: number
  link?: string
}

let toastIdCounter = 0
const generateId = () => `toast-${Date.now()}-${toastIdCounter++}`

/**
 * useToast
 * 供其他组件调用的 Hook：addToast/removeToast 及 success/error/warning/info 快捷方法
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, number>>(new Map())
  const progressTimers = useRef<Map<string, number>>(new Map())

  // 移除指定 Toast 并清理其定时器
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    const pt = progressTimers.current.get(id)
    if (pt) {
      window.clearInterval(pt)
      progressTimers.current.delete(id)
    }
  }, [])

  // 新增一条 Toast：写入列表，若 duration>0 则设自动关闭与进度条动画
  const addToast = useCallback(
    (item: Omit<ToastItem, 'id' | 'progress'>) => {
      const id = generateId()
      const duration = item.duration ?? 5000
      const newToast: ToastItem = { ...item, id, duration, progress: 100 }
      setToasts((prev) => [...prev, newToast])
      if (duration > 0) {
        const timer = window.setTimeout(() => removeToast(id), duration)
        timers.current.set(id, timer)
        const startTime = Date.now()
        // 约 60fps 更新进度条
        const pt = window.setInterval(() => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, duration - elapsed)
          setToasts((prev) =>
            prev.map((to) => (to.id === id ? { ...to, progress: (remaining / duration) * 100 } : to))
          )
          if (remaining <= 0) {
            window.clearInterval(pt)
            progressTimers.current.delete(id)
          }
        }, 16)
        progressTimers.current.set(id, pt)
      }
      return id
    },
    [removeToast]
  )

  const success = (message: string, title?: string, duration?: number) =>
    addToast({ type: 'success', message, title, duration })
  const error = (message: string, title?: string, duration?: number, link?: string) =>
    addToast({ type: 'error', message, title, duration, link })
  const warning = (message: string, title?: string, duration?: number) =>
    addToast({ type: 'warning', message, title, duration })
  const info = (message: string, title?: string, duration?: number) =>
    addToast({ type: 'info', message, title, duration })

  return { toasts, addToast, removeToast, success, error, warning, info }
}

// 全局 Toast 实例：由默认导出的 Toast 组件在挂载时注入，供 setToastInstance 及外部 show 使用
export const toastStore: { addToast: (item: Omit<ToastItem, 'id' | 'progress'>) => string; removeToast: (id: string) => void } = {
  addToast: () => '',
  removeToast: () => {},
}

/** 注入 addToast/removeToast，便于在非 React 或顶层调用 */
export function setToastInstance(instance: typeof toastStore) {
  toastStore.addToast = instance.addToast
  toastStore.removeToast = instance.removeToast
}

/**
 * Toast 容器组件
 * 维护 toasts 列表与定时器，挂载到 #app-overlays，按类型渲染样式与图标
 */
export default function Toast(): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const { t } = useAppContext()
  const timersRef = useRef<Map<string, number>>(new Map())
  const progressRef = useRef<Map<string, number>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
    const tid = timersRef.current.get(id)
    if (tid) {
      clearTimeout(tid)
      timersRef.current.delete(id)
    }
    const pid = progressRef.current.get(id)
    if (pid) {
      clearInterval(pid)
      progressRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback((item: Omit<ToastItem, 'id' | 'progress'>) => {
    const id = generateId()
    const duration = item.duration ?? 5000
    const newToast: ToastItem = { ...item, id, duration, progress: 100 }
    setToasts((prev) => [...prev, newToast])
    if (duration > 0) {
      const timer = window.setTimeout(() => removeToast(id), duration)
      timersRef.current.set(id, timer)
      const startTime = Date.now()
      const pt = window.setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, duration - elapsed)
        setToasts((prev) =>
          prev.map((to) => (to.id === id ? { ...to, progress: (remaining / duration) * 100 } : to))
        )
        if (remaining <= 0) {
          clearInterval(pt)
          progressRef.current.delete(id)
        }
      }, 16)
      progressRef.current.set(id, pt)
    }
    return id
  }, [removeToast])

  // 挂载时注入实例，卸载时清理所有定时器
  useEffect(() => {
    setToastInstance({ addToast, removeToast })
    return () => {
      timersRef.current.forEach((tid) => clearTimeout(tid))
      progressRef.current.forEach((pid) => clearInterval(pid))
    }
  }, [addToast, removeToast])

  const borderClass = (type: ToastItem['type']) =>
    type === 'success' ? 'border-green-500/30' : type === 'error' ? 'border-red-500/30' : type === 'warning' ? 'border-yellow-500/30' : 'border-cyan-500/30'
  const iconClass = (type: ToastItem['type']) =>
    type === 'success' ? 'bg-green-500/20 text-green-400' : type === 'error' ? 'bg-red-500/20 text-red-400' : type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'
  const barClass = (type: ToastItem['type']) =>
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-cyan-500'

  const list = (
    <div className="fixed top-4 right-4 flex flex-col gap-3 pointer-events-none toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto min-w-[300px] max-w-md bg-slate-900 rounded-xl border shadow-2xl overflow-hidden backdrop-blur-md ${borderClass(toast.type)}`}
        >
          <div className="p-4 flex items-start gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${iconClass(toast.type)}`}>
              {toast.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-sm font-semibold text-white mb-1">{toast.title}</p>}
              <p className="text-sm text-slate-300 leading-relaxed">{toast.message}</p>
              {toast.link && (
                <a
                  href={toast.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {t('toast.viewOnExplorer')}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 text-slate-400 hover:text-white transition-colors rounded"
              aria-label={t('modal.close')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
          {toast.duration && toast.duration > 0 && (
            <div className="h-1 bg-white/5 overflow-hidden">
              <div
                className={`h-full transition-all ease-linear ${barClass(toast.type)}`}
                style={{ width: `${toast.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const root = document.getElementById('app-overlays')
  if (!root || toasts.length === 0) return <></>
  return createPortal(list, root)
}
