import { X, Smartphone } from 'lucide-react'

export function InstallBanner({ appName = 'HUB AlexBrasil', onInstall, onDismiss }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/20 bg-[#0a1a4a]/95 p-4 shadow-2xl backdrop-blur-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/30">
          <Smartphone className="h-5 w-5 text-blue-200" />
        </div>
        <p className="flex-1 text-sm text-white">
          Instale o {appName} no seu celular!
        </p>
        <button
          type="button"
          onClick={onInstall}
          className="shrink-0 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
        >
          Instalar
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar"
          className="shrink-0 text-blue-200 transition hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
