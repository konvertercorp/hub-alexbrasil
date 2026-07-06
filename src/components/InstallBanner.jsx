import { X, Smartphone } from 'lucide-react'

export function InstallBanner({ appName = 'HUB AlexBrasil', onInstall, onDismiss }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-100">
          <Smartphone className="h-5 w-5 text-lime-700" />
        </div>
        <p className="flex-1 text-sm text-gray-900">
          Instale o {appName} no seu celular!
        </p>
        <button
          type="button"
          onClick={onInstall}
          className="shrink-0 rounded-lg bg-[#b8e000] px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00]"
        >
          Instalar
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar"
          className="shrink-0 text-gray-400 transition hover:text-gray-900"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
