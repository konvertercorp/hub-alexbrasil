import { Smartphone, Share, Menu } from 'lucide-react'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function InstallHint() {
  if (isStandalone()) return null

  const ios = isIos()

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
        <Smartphone className="h-5 w-5 text-blue-200" />
      </div>
      <p className="text-sm font-semibold text-white">Adicione como app</p>
      {ios ? (
        <p className="flex flex-wrap items-center justify-center gap-1 text-xs text-blue-200">
          No navegador, toque em <Share size={14} className="inline text-blue-200" /> e selecione
          <strong className="text-white">&quot;Adicionar à Tela de Início&quot;</strong>.
        </p>
      ) : (
        <p className="flex flex-wrap items-center justify-center gap-1 text-xs text-blue-200">
          No navegador, toque no menu <Menu size={14} className="inline text-blue-200" /> (⋮) e
          selecione <strong className="text-white">&quot;Adicionar à tela inicial&quot;</strong>.
        </p>
      )}
    </div>
  )
}
