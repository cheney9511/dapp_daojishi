/**
 * HeroSection
 * 首屏区：主网标识、标题/副标题、主合约地址（缩写+复制）、BscScan/Twitter/Telegram 链接
 */

import { useAppContext } from '@/context/AppContext'
import { CONTRACT_ADDRESSES, hasContractAddresses, BSC_CHAIN_ID_EXPORT } from '@/config/contracts'

export default function HeroSection(): JSX.Element {
  const { t } = useAppContext()

  const fullAddress = hasContractAddresses ? CONTRACT_ADDRESSES.PROTOCOL : ''
  const shortAddress = fullAddress
    ? `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`
    : '待配置'

  const copyAddress = () => {
    if (fullAddress) navigator.clipboard.writeText(fullAddress)
  }

  return (
    <header className="text-center space-y-4 flex flex-col items-center mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-cyan-300 text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(0,243,255,0.1)]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        {t('hero.mainnet')}
      </div>

      <div className="space-y-2">
        <div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl">
            {t('hero.title.countdown')}{' '}
            <span className="text-cyan-400 text-glow">{t('hero.title.protocol')}</span>
          </h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
          {t('hero.subtitle1')}
          <br />
          <span className="text-white/80">{t('hero.subtitle2')}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <button
          type="button"
          onClick={copyAddress}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/30 backdrop-blur-md transition-all"
          title={t('header.copyAddress')}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t('hero.contractAddress')}
          </span>
          <span className="text-xs font-mono text-cyan-400 group-hover:text-cyan-300">{shortAddress}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="lucide lucide-copy text-slate-500 group-hover:text-cyan-400 transition-colors"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </button>

        <a
          href={fullAddress ? `https://${BSC_CHAIN_ID_EXPORT === 97 ? 'testnet.' : ''}bscscan.com/address/${fullAddress}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:border-yellow-500/30 text-xs text-slate-400 hover:text-yellow-400 transition-all"
        >
          <span className="font-bold">BscScan</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </a>
        <a
          href="https://x.com/daojishibsc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:border-sky-500/30 text-xs text-slate-400 hover:text-sky-400 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="font-bold">Twitter</span>
        </a>
        <a
          href="https://t.me/daojishi7"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:border-blue-500/30 text-xs text-slate-400 hover:text-blue-400 transition-all"
        >
          <span className="font-bold">Telegram</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </a>
      </div>
    </header>
  )
}
