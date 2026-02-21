/**
 * Header
 * 顶部导航：Logo、博弈/机制/白皮书链接、语言切换、钱包连接/断开与地址余额、移动端菜单
 */

import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { useWallet } from '@/composables/useWallet'

export default function Header(): JSX.Element {
  const { state, t, setLanguage } = useAppContext()
  const {
    isConnected,
    isPending,
    formattedAddress,
    formattedBalance,
    balanceSymbol,
    connectWallet,
    disconnectWallet,
  } = useWallet()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 根据当前路径标记激活项，依赖 pathname 与 t 保证语言切换后文案更新
  const navItems = useMemo(
    () => [
      { name: t('nav.game'), href: '/', active: location.pathname === '/' },
      { name: t('nav.mechanism'), href: '/rules', active: location.pathname === '/rules' },
      { name: t('nav.whitepaper'), href: '/docs', active: location.pathname === '/docs' },
    ],
    [location.pathname, t]
  )

  // 点击菜单外区域时关闭移动端菜单
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      mobileMenuOpen &&
      !target.closest('.mobile-menu-container') &&
      !target.closest('[data-mobile-menu-button]')
    ) {
      setMobileMenuOpen(false)
    }
  }

  // 全局点击监听：打开菜单时注册，关闭或卸载时移除
  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [mobileMenuOpen])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-6 px-4 pointer-events-none"
      style={{ opacity: 1, transform: 'none' }}
    >
      <div className="w-full max-w-[1400px] flex items-center justify-between gap-3 relative">
        <div className="pointer-events-auto hidden lg:flex">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 border-dashed shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">CA</span>
            <span className="text-[11px] font-mono text-slate-600">待公布</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center justify-between gap-4 md:gap-8 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </div>
            <span className="font-bold tracking-widest text-sm text-slate-200 group-hover:text-white transition-colors hidden sm:block">
              COUNTDOWN
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
                  item.active ? 'text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.active && <div className="absolute inset-0 bg-white rounded-full" />}
                <span className="relative z-10">{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLanguage(state.lang === 'zh' ? 'en' : 'zh')}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title={t('header.languageSelect')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-globe"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </button>

            <div>
              {!isConnected ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={connectWallet}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/50 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="relative z-10 text-cyan-400"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                  <span className="text-xs font-bold text-cyan-100 relative z-10 hidden sm:inline">
                    {isPending ? t('header.connecting') : t('header.connectWallet')}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/50 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] relative z-10" />
                  <span className="text-xs font-bold text-cyan-100 relative z-10 hidden sm:inline font-mono">
                    {formattedAddress}
                  </span>
                  <span className="text-[10px] text-slate-400 relative z-10 hidden md:inline">
                    {formattedBalance} {balanceSymbol}
                  </span>
                </button>
              )}
            </div>

            <button
              type="button"
              data-mobile-menu-button
              onClick={(e) => {
                e.stopPropagation()
                setMobileMenuOpen((v) => !v)
              }}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-all duration-300"
            >
              {!mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="lucide lucide-menu"
                >
                  <path d="M4 5h16" />
                  <path d="M4 12h16" />
                  <path d="M4 19h16" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="lucide lucide-x"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="pointer-events-auto hidden lg:flex items-center gap-2">
          <a
            href="https://x.com/daojishibsc"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:border-sky-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-slate-400 group-hover:text-sky-400 transition-colors">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-sky-400 transition-colors">Twitter</span>
          </a>
          <a
            href="https://t.me/daojishi7"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-slate-400 group-hover:text-blue-400 transition-colors">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">Telegram</span>
          </a>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="mobile-menu-container pointer-events-auto md:hidden fixed bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-4 z-50"
          style={{ top: 88, left: '1rem', right: '1rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded-full transition-all ${
                  item.active
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {!isConnected ? (
              <button
                type="button"
                onClick={connectWallet}
                disabled={isPending}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-cyan-400"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
                <span className="text-xs font-bold text-cyan-100">
                  {isPending ? t('header.connecting') : t('header.connectWallet')}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={disconnectWallet}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-bold text-cyan-100 font-mono">{formattedAddress}</span>
                <span className="text-[10px] text-slate-400">{formattedBalance} {balanceSymbol}</span>
              </button>
            )}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
              <a
                href="https://x.com/daojishibsc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:border-sky-500/30 transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-slate-400">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-xs font-bold text-slate-400">Twitter</span>
              </a>
              <a
                href="https://t.me/daojishi7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-slate-400">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span className="text-xs font-bold text-slate-400">Telegram</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </nav>
  )
}
