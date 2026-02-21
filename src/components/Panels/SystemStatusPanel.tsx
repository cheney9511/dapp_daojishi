/**
 * SystemStatusPanel
 * 底部三栏之一：参与人数、轮次、运行状态（均来自 Context cycleInfo）
 */

import { useAppContext } from '@/context/AppContext'

export default function SystemStatusPanel(): JSX.Element {
  const { state, t } = useAppContext()
  const participants = state.cycleInfo.participantCount
  const round = state.cycleInfo.cycleId
  const isRunning = state.cycleInfo.isActive

  return (
    <div
      className="glass-card rounded-2xl p-6 transition-colors duration-300 relative group overflow-hidden border-emerald-500/10"
      style={{ opacity: 1, transform: 'none' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-users">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <path d="M16 3.128a4 4 0 0 1 0 7.744" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-users">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">{t('panel.systemStatus')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase text-slate-500 mb-1">{t('panel.participants')}</div>
              <div className="text-2xl font-bold text-white">{participants}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t('panel.participantsDesc')}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500 mb-1">{t('panel.round')}</div>
              <div className="text-2xl font-bold text-emerald-400">#{round}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500/60 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isRunning ? t('panel.running') : t('panel.stopped')}
          </div>
        </div>
      </div>
    </div>
  )
}
