/**
 * Modal
 * 通用弹窗：挂载到 #app-overlays，支持自定义 header/footer、尺寸、点击遮罩关闭
 */

import { createPortal } from 'react-dom'
import { useAppContext } from '@/context/AppContext'

/** 弹窗属性：显隐、关闭回调、标题/副标题、尺寸、是否点击遮罩关闭、是否显示关闭按钮、插槽 */
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full'
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

// 尺寸与 Tailwind max-w-* 对应
const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
  children,
  header,
  footer,
}: ModalProps): JSX.Element | null {
  const { t } = useAppContext()

  // 点击遮罩时若允许则关闭，并阻止冒泡
  const handleBackdrop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (closeOnBackdrop) onClose()
  }

  if (!open) return null

  // 弹窗内容：遮罩 + 内容区，内容区点击不关闭
  const content = (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div
        className={`modal-backdrop ${closeOnBackdrop ? 'cursor-pointer' : ''}`}
        onClick={handleBackdrop}
      />
      <div
        className={`modal-content ${sizeClass[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="modal-close-button"
            aria-label={t('modal.close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        )}
        {(title || header) && (
          <div className="modal-header">
            {header ?? (
              <>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
              </>
            )}
          </div>
        )}
        <div className={`modal-body ${!title && !header ? 'pt-3 sm:pt-4' : ''}`}>
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )

  // 挂载到 #app-overlays 避免被主布局裁剪或 z-index 干扰
  const overlayRoot = document.getElementById('app-overlays')
  if (!overlayRoot) return content
  return createPortal(content, overlayRoot)
}
