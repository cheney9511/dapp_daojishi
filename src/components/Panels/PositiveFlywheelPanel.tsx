/**
 * PositiveFlywheelPanel
 * 左侧面板：正向飞轮说明文案 + 装饰进度条动画
 */

import { useAppContext } from '@/context/AppContext'

export default function PositiveFlywheelPanel(): JSX.Element {
  const { t } = useAppContext()

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-colors duration-300 flex-1 border-l-2 border-l-cyan-400 flex flex-col justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 text-cyan-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="lucide lucide-rotate-cw animate-spin-slow"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          <h3 className="font-bold uppercase tracking-wider text-xs">{t('panel.positiveFlywheel')}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{t('panel.flywheelDesc')}</p>
        <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 animate-slide-progress" />
        </div>
      </div>
    </div>
  )
}
