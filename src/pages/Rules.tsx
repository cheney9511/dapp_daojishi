/**
 * Rules
 * 机制页：核心机制总述、动态倒计时、开奖与重置、爆率机制、分配规则、防刷与公平
 * 纯展示，文案来自 i18n，无接口
 */

import { useAppContext } from '@/context/AppContext'
import Header from '@/components/Header'

export default function Rules(): JSX.Element {
  const { t } = useAppContext()
  // 爆率进度条示例：0.5% / 5% = 10%
  const explosionProgress = (0.5 / 5.0) * 100

  return (
    <div className="min-h-screen">
      <Header />
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 space-y-24 pb-12">
        <section className="text-center space-y-8">
          <div className="inline-block" style={{ opacity: 1, transform: 'none' }}>
            <div className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mb-4">{t('rules.hero.subtitle')}</div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
              {t('rules.hero.title')} <span className="text-cyan-400 text-glow">{t('rules.hero.titleHighlight')}</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-slate-400">
            {t('rules.hero.p2')}
            <br />
            <span className="text-white font-medium">{t('rules.hero.p3')}</span>
          </p>
        </section>

        <div className="relative">
          <div className="glass-card rounded-2xl transition-colors duration-300 p-8 md:p-12 border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-clock w-8 h-8 text-cyan-400">
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                  {t('rules.countdown.title')}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-slate-300">{t('rules.countdown.description')}</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-2xl font-black text-emerald-400">-1m</span>
                      <span>{t('rules.countdown.buyText')} <strong className="text-emerald-400">{t('rules.countdown.buy')}</strong></span>
                    </li>
                    <li className="flex items-center gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                      <span className="text-2xl font-black text-red-400">+1m</span>
                      <span>{t('rules.countdown.sellText')} <strong className="text-red-400">{t('rules.countdown.sell')}</strong></span>
                    </li>
                  </ul>
                  <div className="text-xs text-slate-500 bg-white/5 p-3 rounded-lg border border-white/5">{t('rules.countdown.limit')}</div>
                </div>
                <div className="relative h-48 bg-black/20 rounded-2xl flex items-center justify-center border border-white/5">
                  <div className="w-32 h-32 rounded-full border-4 border-cyan-500/30 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin-slow" />
                    <span className="text-2xl font-bold text-white">100m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card rounded-2xl transition-colors duration-300 p-8 md:p-12 border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-refresh-cw w-8 h-8 text-cyan-400">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                  {t('rules.trigger.title')}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-white font-bold mb-2">{t('rules.trigger.conditionTitle')}</h4>
                    <p className="text-slate-400">{t('rules.trigger.condition')}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-white font-bold mb-2">{t('rules.trigger.resetTitle')}</h4>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li>• {t('rules.trigger.reset1')}</li>
                      <li>• {t('rules.trigger.reset2')}</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">00:00</div>
                    <div className="text-sm uppercase tracking-widest text-emerald-400 font-bold animate-pulse">{t('rules.trigger.draw')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card rounded-2xl transition-colors duration-300 p-8 md:p-12 border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-zap w-8 h-8 text-cyan-400">
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                  {t('rules.explosion.title')}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-lg text-slate-300">{t('rules.explosion.description')}</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>{t('rules.explosion.baseRate')}</span>
                      <span className="font-mono text-slate-400">{t('rules.explosion.baseRateValue')}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>{t('rules.explosion.buyBonus')}</span>
                      <span className="font-mono text-purple-400">{t('rules.explosion.perTrade')}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>{t('rules.explosion.sellReset')}</span>
                      <span className="font-mono text-red-400 font-bold">{t('rules.explosion.reset')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 uppercase text-xs tracking-widest">{t('rules.explosion.maxRate')}</span>
                      <span className="font-bold text-xl text-white">5.0%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{t('rules.explosion.note')}</p>
                </div>
                <div className="relative flex flex-col justify-center gap-2">
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${explosionProgress}%` }} />
                  </div>
                  <div className="text-center text-xs text-purple-400 font-mono">{t('rules.explosion.curve')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card rounded-2xl transition-colors duration-300 p-8 md:p-12 border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-trophy w-8 h-8 text-cyan-400">
                    <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
                    <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
                    <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
                    <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                  {t('rules.distribution.title')}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-6 rounded-2xl bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20">
                  <div className="text-3xl font-black text-yellow-400 mb-2">30%</div>
                  <div className="text-xs uppercase tracking-widest text-yellow-200/60">{t('rules.distribution.grandPrize')}</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20">
                  <div className="text-3xl font-black text-cyan-400 mb-2">15%</div>
                  <div className="text-xs uppercase tracking-widest text-cyan-200/60">{t('rules.distribution.smallPrize')}</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/20">
                  <div className="text-3xl font-black text-white mb-2">5%</div>
                  <div className="text-xs uppercase tracking-widest text-slate-400">{t('rules.distribution.sunshine')}</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20">
                  <div className="text-3xl font-black text-purple-400 mb-2">50%</div>
                  <div className="text-xs uppercase tracking-widest text-purple-200/60">{t('rules.distribution.rollover')}</div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-white/5 rounded-xl">
                <h4 className="text-white text-sm font-bold mb-3 text-center">{t('rules.distribution.conditionTitle')}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{t('rules.distribution.condition')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card rounded-2xl transition-colors duration-300 p-8 md:p-12 border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-shield-alert w-8 h-8 text-cyan-400">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                  {t('rules.antiBot.title')}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <h3 className="font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{t('rules.antiBot.validTradeTitle')}</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-400">
                    <li>{t('rules.antiBot.validTrade1')} <strong className="text-white">≥ 20U</strong> {t('rules.antiBot.equivalent')}</li>
                    <li>{t('rules.antiBot.validTrade2')}</li>
                    <li>{t('rules.antiBot.validTrade3')}</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{t('rules.antiBot.cooldownTitle')}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white text-sm font-semibold mb-2">{t('rules.antiBot.countdownCooldown')}</h4>
                      <p className="text-slate-400 text-sm mb-2">{t('rules.antiBot.cooldownDescription')}</p>
                      <ul className="space-y-1 font-mono text-xs pl-4 border-l border-white/10">
                        <li className="flex justify-between">
                          <span className="text-slate-500">{t('rules.antiBot.cooldown1Label')}</span>
                          <span className="text-emerald-400">{t('rules.antiBot.cooldown1')}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-500">{t('rules.antiBot.cooldown2Label')}</span>
                          <span className="text-emerald-500/70">{t('rules.antiBot.cooldown2')}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-500">{t('rules.antiBot.cooldown3Label')}</span>
                          <span className="text-emerald-500/40">{t('rules.antiBot.cooldown3')}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-semibold mb-2">{t('rules.antiBot.rateCooldown')}</h4>
                      <p className="text-slate-400 text-sm">{t('rules.antiBot.rateCooldownDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div className="space-y-2">
                    <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {t('rules.antiBot.noTradeNoCountdown')}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{t('rules.antiBot.noTradeNoCountdownDesc')}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {t('rules.antiBot.holdingTimeRequirement')}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{t('rules.antiBot.holdingTimeRequirementDesc')}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {t('rules.antiBot.antiLastMinuteBuy')}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{t('rules.antiBot.antiLastMinuteBuyDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
