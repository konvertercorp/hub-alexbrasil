import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ScanLine, Copy, Check, TriangleAlert } from 'lucide-react'

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1']

export function QRCodeCard({ appName = 'HUB AlexBrasil' }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.origin : ''
  const isLocalOnly =
    typeof window !== 'undefined' &&
    LOCAL_HOSTNAMES.includes(window.location.hostname)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponível — usuário pode copiar manualmente
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500">
          <ScanLine size={22} />
          <span className="text-sm font-medium uppercase tracking-wide">
            Escaneie para acessar
          </span>
        </div>

        {isLocalOnly && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-left text-xs text-amber-800">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" />
            <span>
              Você está em <strong>localhost</strong> — o celular não vai
              conseguir abrir este QR Code. Acesse este computador pelo
              endereço de rede (ex: http://192.168.0.10:5173) mostrado no
              terminal do Vite para testar no celular.
            </span>
          </div>
        )}

        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-4">
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG
              value={url}
              size={200}
              bgColor="#ffffff"
              fgColor="#111827"
              level="M"
              className="rounded-lg"
            />
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Aponte a câmera do celular
        </p>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              Link copiado!
            </>
          ) : (
            <>
              <Copy size={14} />
              {url}
            </>
          )}
        </button>

        <div className="mt-2 w-full space-y-3">
          <Step
            number={1}
            title="Escaneie o QR Code"
            description="Abra a câmera do celular e aponte para o código acima. Um link aparecerá na tela."
          />
          <Step
            number={2}
            title="Abra o link"
            description={`Toque no link que apareceu para abrir o ${appName} no navegador do celular.`}
          />
          <Step
            number={3}
            title="Adicione à tela inicial"
            description='No navegador, toque no menu (⋮) e selecione "Adicionar à tela inicial".'
            highlight
          />
        </div>
      </div>
    </div>
  )
}

function Step({ number, title, description, highlight = false }) {
  return (
    <div
      className={`flex gap-3 rounded-xl p-3 ${
        highlight
          ? 'border border-emerald-200 bg-emerald-50'
          : 'bg-gray-50'
      }`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          highlight ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        {number}
      </div>
      <div className="text-left">
        <p
          className={`text-sm font-semibold ${
            highlight ? 'text-emerald-700' : 'text-gray-900'
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}
