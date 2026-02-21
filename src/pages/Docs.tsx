/**
 * Docs
 * 白皮书页：六段式文档（核心机制、倒计时、开奖重置、爆率、分配、防刷），数字来自本地 config
 */

import { useAppContext } from '@/context/AppContext'
import Header from '@/components/Header'

// 文档中使用的数字参数（与 Vue 版 docsConfig 一致，静态）
const config = {
  transactionFee: 3,                  // 交易手续费百分比
  initialCountdown: 10,               // 初始倒计时（秒数）
  maxCountdown: 200,                  // 单轮最大倒计时（秒数）
  buyOrderAdjustment: -1,             // 买单触发倒计时减少（秒）
  sellOrderAdjustment: 1,             // 卖单触发倒计时增加（秒）
  baseExplosionRate: 0.5,             // 爆率基础值（%）
  buyBonusRate: 0.2,                  // 每次买单叠加爆率（%）
  maxExplosionRate: 5,                // 单轮爆率上限（%）
  dailyMaxExplosionRate: 5,           // 当日爆率全局上限（%）
  minHoldTokens: 5000,                // 最低持仓数量（枚）
  grandPrizePercent: 12,              // 大奖分配比例（%）
  smallPrizePercent: 6,               // 小奖分配比例（%）
  sunshinePrizePercent: 2,            // 阳光普照奖分配比例（%）
  rolloverPercent: 80,                // 奖池滚存比例（%）
  minValidTradeAmount: 0.01,          // 最小有效交易金额（BNB）
  tradeMergeWindow: 1,                // 交易合并窗口（分钟）
  minHoldingTime: 10,                 // 最短持仓有效时间（分钟）
}

/** 数字格式化：保留小数位 */
function formatNumber(n: number, decimals: number): string {
  return n.toFixed(decimals)
}
/** 大数格式化：千分位 */
function formatLargeNumber(n: number): string {
  return n.toLocaleString()
}

export default function Docs(): JSX.Element {
  const { t } = useAppContext()

  return (
    <div className="min-h-screen">
      <Header />
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur text-cyan-400 text-xs font-bold tracking-widest uppercase mb-6">
            {t('docs.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{t('docs.title')}</h1>
        </div>

        <div className="space-y-8">
          <div className="glass-card rounded-2xl relative overflow-hidden duration-300 p-8 border-white/5 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                {t('docs.section1.title')}
              </h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-wrap font-light">
                {t('docs.section1.content')} {t('docs.section1.rule', { fee: String(config.transactionFee), initialCountdown: String(config.initialCountdown) })}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl relative overflow-hidden duration-300 p-8 border-white/5 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                {t('docs.section2.title')}
              </h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-wrap font-light">
                {t('docs.section2.intro')} {t('docs.section2.initial', { initialCountdown: String(config.initialCountdown) })}{' '}
                {t('docs.section2.adjust', { buyAdjustment: String(config.buyOrderAdjustment), sellAdjustment: String(config.sellOrderAdjustment) })}{' '}
                {t('docs.section2.limit', { maxCountdown: String(config.maxCountdown) })} {t('docs.section2.trigger')}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl relative overflow-hidden duration-300 p-8 border-white/5 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                {t('docs.section3.title')}
              </h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-wrap font-light">
                {t('docs.section3.intro')} {t('docs.section3.trigger')} {t('docs.section3.reset', { initialCountdown: String(config.initialCountdown) })}{' '}
                {t('docs.section3.rollover', { rolloverPercent: String(config.rolloverPercent) })}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl relative overflow-hidden duration-300 p-8 border-white/5 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                {t('docs.section4.title')}
              </h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-wrap font-light">
                {t('docs.section4.formula')} {t('docs.section4.base', { baseRate: formatNumber(config.baseExplosionRate, 1) })}{' '}
                {t('docs.section4.buyBonus', { buyBonus: formatNumber(config.buyBonusRate, 1) })} {t('docs.section4.sellPenalty')}{' '}
                {t('docs.section4.max', { maxRate: String(config.maxExplosionRate) })} {t('docs.section4.validity')}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl relative overflow-hidden duration-300 p-8 border-white/5 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                {t('docs.section5.title')}
              </h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-wrap font-light">
                {t('docs.section5.conditionTitle')} {t('docs.section5.condition1')}{' '}
                {t('docs.section5.condition2', { minHoldTokens: formatLargeNumber(config.minHoldTokens) })}{' '}
                {t('docs.section5.distributionTitle')} {t('docs.section5.grandPrize', { grandPrize: String(config.grandPrizePercent) })}{' '}
                {t('docs.section5.smallPrize', { smallPrize: String(config.smallPrizePercent) })}{' '}
                {t('docs.section5.sunshine', { sunshine: String(config.sunshinePrizePercent) })}{' '}
                {t('docs.section5.rollover', { rolloverPercent: String(config.rolloverPercent) })}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl relative overflow-hidden duration-300 p-8 border-white/5 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                {t('docs.section6.title')}
              </h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-wrap font-light">
                {t('docs.section6.validTrade', { minTradeAmount: String(config.minValidTradeAmount), mergeWindow: String(config.tradeMergeWindow) })}{' '}
                {t('docs.section6.countdownCooldown', { buyAdjustment: String(config.buyOrderAdjustment) })}{' '}
                {t('docs.section6.rateCooldown', { dailyMaxRate: String(config.dailyMaxExplosionRate) })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
