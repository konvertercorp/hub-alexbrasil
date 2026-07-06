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
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100">
        <Smartphone className="h-5 w-5 text-lime-700" />
      </div>
      <p className="text-sm font-semibold text-gray-900">Adicione como app</p>
      {ios ? (
        <p className="flex flex-wrap items-center justify-center gap-1 text-xs text-gray-500">
          No navegador, toque em <Share size={14} className="inline text-gray-500" /> e selecione
          <strong className="text-gray-900">&quot;Adicionar à Tela de Início&quot;</strong>.
        </p>
      ) : (
        <p className="flex flex-wrap items-center justify-center gap-1 text-xs text-gray-500">
          No navegador, toque no menu <Menu size={14} className="inline text-gray-500" /> (⋮) e
          selecione <strong className="text-gray-900">&quot;Adicionar à tela inicial&quot;</strong>.
        </p>
      )}
    </div>
  )
}
