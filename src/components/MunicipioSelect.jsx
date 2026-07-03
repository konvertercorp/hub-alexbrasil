import { useMemo, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

export function MunicipioSelect({ value, onChange, options, disabled, loading }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 50)
    return options
      .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 50)
  }, [options, query])

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
          disabled
            ? 'border-white/10 bg-white/5 text-blue-200/40'
            : 'border-white/20 bg-white/10 text-white'
        }`}
      >
        <input
          type="text"
          disabled={disabled}
          value={open ? query : value}
          onFocus={() => {
            setOpen(true)
            setQuery('')
          }}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            disabled
              ? 'Selecione o estado primeiro'
              : loading
                ? 'Carregando municípios...'
                : 'Buscar município'
          }
          className="flex-1 bg-transparent outline-none placeholder-blue-200/40"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              setQuery('')
            }}
            aria-label="Limpar município"
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown size={14} className="text-blue-300" />
      </div>

      {open && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-white/20 bg-[#132a6b] py-1 shadow-2xl">
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-blue-200/60">
                Nenhum município encontrado
              </li>
            ) : (
              filtered.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(name)
                      setOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                  >
                    {name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  )
}
