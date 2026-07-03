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
    <div className="rounded-3xl border border-white/20 bg-blue-400/10 p-6 sm:p-8 backdrop-blur-lg shadow-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-blue-100">
          <ScanLine size={22} />
          <span className="text-sm font-medium uppercase tracking-wide">
            Escaneie para acessar
          </span>
        </div>

        {isLocalOnly && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-left text-xs text-amber-200">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" />
            <span>
              Você está em <strong>localhost</strong> — o celular não vai
              conseguir abrir este QR Code. Acesse este computador pelo
              endereço de rede (ex: http://192.168.0.10:5173) mostrado no
              terminal do Vite para testar no celular.
            </span>
          </div>
        )}

        <div className="rounded-2xl border-2 border-dashed border-white/40 p-4">
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG
              value={url}
              size={200}
              bgColor="#ffffff"
              fgColor="#0a1a4a"
              level="M"
              className="rounded-lg"
            />
          </div>
        </div>

        <p className="text-center text-sm text-blue-100">
          Aponte a câmera do celular
        </p>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 transition hover:bg-white/20"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-300" />
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
            title="Adicione como app"
            description='No navegador, toque no menu (⋮) e selecione "Adicionar à tela inicial" ou "Instalar aplicativo" para usar como app.'
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
          ? 'border border-emerald-400/40 bg-emerald-500/20'
          : 'bg-white/10'
      }`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          highlight ? 'bg-emerald-400 text-emerald-950' : 'bg-white/20 text-white'
        }`}
      >
        {number}
      </div>
      <div className="text-left">
        <p
          className={`text-sm font-semibold ${
            highlight ? 'text-emerald-300' : 'text-white'
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-blue-100/90">{description}</p>
      </div>
    </div>
  )
}
