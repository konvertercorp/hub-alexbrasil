import { Link } from 'react-router-dom'
import { ArrowLeft, Construction } from 'lucide-react'
import { Header } from '../components/Header'

export function ModulePlaceholder({ title }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a]">
      <Header appName="HUB AlexBrasil" />

      <main className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <Construction className="h-8 w-8 text-blue-100" />
        </div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-sm text-blue-200">
          Este módulo está em construção.
        </p>
        <Link
          to="/"
          className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>
      </main>
    </div>
  )
}
