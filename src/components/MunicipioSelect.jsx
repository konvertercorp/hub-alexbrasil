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
            ? 'border-gray-200 bg-gray-50 text-gray-400'
            : 'border-gray-300 bg-white text-gray-900'
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
          className="flex-1 bg-transparent outline-none placeholder-gray-400"
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
        <ChevronDown size={14} className="text-gray-400" />
      </div>

      {open && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-gray-400">
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
                    className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-lime-50"
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
