/**
 * ActionButtons
 * 首页主操作：买入 / 卖出 两个大按钮，点击触发父组件传入的 onBuy/onSell（无链上逻辑）
 */

import { useAppContext } from '@/context/AppContext'

/** 仅需父组件提供买入、卖出回调 */
interface ActionButtonsProps {
  onBuy: () => void
  onSell: () => void
}

export default function ActionButtons({ onBuy, onSell }: ActionButtonsProps): JSX.Element {
  const { t } = useAppContext()

  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg mx-auto mt-8">
      <button
        type="button"
        onClick={onBuy}
        className="group relative flex-1 p-[1px] rounded-2xl overflow-hidden touch-manipulation"
        style={{ minHeight: 60, WebkitTapHighlightColor: 'transparent' }}
        tabIndex={0}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-emerald-500/20 flex flex-col items-center justify-center gap-2 group-hover:bg-black/60 active:bg-black/70 transition-colors">
          <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-1 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-arrow-up w-6 h-6">
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            {t('action.buy')} <span className="text-emerald-400 text-sm ml-1">{t('action.accelerate')}</span>
          </span>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400">
            <span className="text-emerald-400">{t('action.timeMinus')}</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full" />
            <span className="text-purple-400">{t('action.rateBonus')}</span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={onSell}
        className="group relative flex-1 p-[1px] rounded-2xl overflow-hidden touch-manipulation"
        style={{ minHeight: 60, WebkitTapHighlightColor: 'transparent' }}
        tabIndex={0}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-red-500/20 flex flex-col items-center justify-center gap-2 group-hover:bg-black/60 active:bg-black/70 transition-colors">
          <div className="p-3 rounded-full bg-red-500/10 text-red-400 mb-1 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-arrow-down w-6 h-6">
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            {t('action.sell')} <span className="text-red-400 text-sm ml-1">{t('action.delay')}</span>
          </span>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400">
            <span className="text-red-400">{t('action.timePlus')}</span>
          </div>
        </div>
      </button>
    </div>
  )
}
