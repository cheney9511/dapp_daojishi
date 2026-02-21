/**
 * DynamicCountdownPanel
 * 左侧面板：动态倒计时规则说明（买单 -1m / 卖单 +1m）
 */

import { useAppContext } from '@/context/AppContext'

export default function DynamicCountdownPanel(): JSX.Element {
  const { t } = useAppContext()

  return (
    <div
      className="glass-card rounded-2xl p-6 relative overflow-hidden transition-colors duration-300 flex-1 border-l-2 border-l-emerald-500 flex flex-col justify-center"
      style={{ opacity: 1, transform: 'none' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 text-emerald-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="lucide lucide-clock"
          >
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <h3 className="font-bold uppercase tracking-wider text-xs">{t('panel.dynamicCountdown')}</h3>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">{t('panel.buyAccelerate')}</span>
            <span className="text-emerald-400 font-bold">-1m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t('panel.sellDelay')}</span>
            <span className="text-red-400 font-bold">+1m</span>
          </div>
        </div>
      </div>
    </div>
  )
}
