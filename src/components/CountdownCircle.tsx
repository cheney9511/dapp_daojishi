/**
 * CountdownCircle
 * 中央倒计时圆环：从 Context 取 totalSeconds 展示分秒，临界区间内显示 CRITICAL 进度条
 */

import { useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'

// 临界区间：0～600 秒内显示红色警告与倒序进度条
const MAX_CRITICAL_SECONDS = 600

export default function CountdownCircle(): JSX.Element {
  const { state, t } = useAppContext()
  // 由 totalSeconds 推导分、秒与是否临界，避免直接依赖 store 的 minutes/seconds
  const countdown = useMemo(
    () => ({
      minutes: Math.floor(state.countdown.totalSeconds / 60),
      seconds: state.countdown.totalSeconds % 60,
      totalSeconds: state.countdown.totalSeconds,
      isCritical: state.countdown.isCritical,
    }),
    [state.countdown.totalSeconds, state.countdown.isCritical]
  )
  // 是否处于临界区间（显示 CRITICAL 条）
  const showCritical =
    countdown.totalSeconds >= 0 && countdown.totalSeconds <= MAX_CRITICAL_SECONDS
  // 临界进度：0 秒为 100%，600 秒为 0%
  const criticalProgress = showCritical
    ? ((MAX_CRITICAL_SECONDS - countdown.totalSeconds) / MAX_CRITICAL_SECONDS) * 100
    : 0

  return (
    <div className="relative z-10">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div
        className="glass-card relative overflow-hidden transition-colors duration-300 rounded-full p-2 border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl"
        style={{ opacity: 1, transform: 'none' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="relative w-80 h-80 flex items-center justify-center">
            <svg className="absolute w-full h-full opacity-30 animate-spin-reverse">
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 6"
                className="text-slate-500"
              />
            </svg>
            <svg className="absolute w-[90%] h-[90%] animate-spin-slow">
              <defs>
                <linearGradient id="gradientRing" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6b7280" stopOpacity={0} />
                  <stop offset="50%" stopColor="#6b7280" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6b7280" stopOpacity={1} />
                </linearGradient>
              </defs>
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="url(#gradientRing)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="200 100"
              />
            </svg>
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-xs tracking-[0.3em] text-slate-400 mb-2 font-mono uppercase">
                {t('countdown.systemCycle')}
              </div>
              <div className="flex items-baseline gap-1 font-black text-7xl tracking-tighter">
                <span className="tabular-nums text-red-500">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-3xl text-slate-600 animate-pulse">:</span>
                <span className="tabular-nums w-[1.3em] text-center text-red-400">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
              </div>
              {showCritical && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${criticalProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-red-500">
                    {t('countdown.critical')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
