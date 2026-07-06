import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, Users, ScanLine } from 'lucide-react'
import { Header } from '../components/Header'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, INVITEE_ROLE } from '../utils/roles'

export function Equipe() {
  const { profile } = useAuth()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('profiles')
      .select('id, nome, role, telefone, created_at')
      .neq('id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTeam(data ?? [])
        setLoading(false)
      })
  }, [profile])

  if (!profile) return null

  const inviteUrl = `${window.location.origin}/convite/${profile.invite_code}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponível — usuário pode copiar manualmente
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a]">
      <Header appName="HUB AlexBrasil" backTo="/" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-bold text-white">Minha Equipe</h1>
          <p className="mt-1 text-sm text-blue-200">
            {team.length} pessoa(s) na sua rede.
          </p>

          <div className="mt-4 rounded-3xl border border-white/20 bg-blue-400/10 p-6 backdrop-blur-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-blue-100">
                <ScanLine size={20} />
                <span className="text-sm font-medium uppercase tracking-wide">
                  Convide um {ROLE_LABELS[INVITEE_ROLE]}
                </span>
              </div>

              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG
                  value={inviteUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0a1a4a"
                  level="M"
                />
              </div>

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
                    {inviteUrl}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-blue-200/70">
                Quem entrar por esse link vira {ROLE_LABELS[INVITEE_ROLE]} da sua rede.
              </p>
            </div>
          </div>

          <h2 className="mt-8 text-sm font-semibold text-blue-100">Pessoas na sua rede</h2>
          <div className="mt-3 space-y-2">
            {loading ? (
              <p className="text-sm text-blue-200/60">Carregando...</p>
            ) : team.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-8 text-center">
                <Users className="h-7 w-7 text-blue-300" />
                <p className="text-sm text-blue-200">
                  Ninguém entrou pelo seu link ainda.
                </p>
              </div>
            ) : (
              team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-white/15 bg-white/10 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{member.nome}</p>
                    <p className="text-xs text-blue-200">{member.telefone}</p>
                  </div>
                  <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-200">
                    {ROLE_LABELS[member.role] ?? ROLE_LABELS[INVITEE_ROLE]}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
