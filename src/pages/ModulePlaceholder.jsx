import { Construction } from 'lucide-react'
import { Header } from '../components/Header'

export function ModulePlaceholder({ title }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f2f4e6]">
      <Header appName="HUB AlexBrasil" backTo="/" />

      <main className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Construction className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">
          Este módulo está em construção.
        </p>
      </main>
    </div>
  )
}
