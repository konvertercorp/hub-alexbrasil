import { Monitor, ArrowRight, Smartphone } from 'lucide-react'
import { QRCodeCard } from '../components/QRCodeCard'
import { InstallBanner } from '../components/InstallBanner'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

const APP_NAME = 'HUB AlexBrasil'
const ORG_NAME = 'Minha Organização'
const APP_VERSION = '1.0.0'

export function LandingInstall() {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-6">
          <img src="/alex-brasil.png" alt={APP_NAME} className="h-14 w-14 rounded-2xl" />

          <div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              {APP_NAME}
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Sistema exclusivo para dispositivos móveis
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl">
            <div className="mb-5 flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100">
                <Monitor className="h-6 w-6 text-lime-700" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100">
                <Smartphone className="h-6 w-6 text-lime-700" />
              </div>
            </div>

            <h2 className="text-center text-xl font-bold text-gray-900">
              Acesse pelo celular
            </h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-gray-500">
              O {APP_NAME} foi projetado para funcionar direto no seu
              smartphone. Para começar, aponte a câmera do celular para o
              QR Code ao lado.
            </p>

            <p className="mt-6 text-center text-xs text-gray-400">
              {ORG_NAME}
            </p>
          </div>
        </div>

        {/* Coluna direita */}
        <div>
          <QRCodeCard appName={APP_NAME} />
        </div>
      </div>

      <span className="absolute bottom-4 right-6 text-xs text-gray-300">
        {APP_VERSION}
      </span>

      {canInstall && (
        <InstallBanner
          appName={APP_NAME}
          onInstall={promptInstall}
          onDismiss={dismiss}
        />
      )}
    </div>
  )
}
