import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const TONE_CLASSES = {
  blue: 'bg-lime-100 text-lime-800',
  amber: 'bg-amber-100 text-amber-800',
  teal: 'bg-teal-100 text-teal-800',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-800',
}

export function Section({
  icon: Icon,
  title,
  tone = 'blue',
  defaultOpen = false,
  enabled,
  onToggleEnabled,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const hasToggle = typeof enabled === 'boolean'
  const isDisabled = hasToggle && !enabled

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}
        >
          <Icon size={16} />
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex flex-1 items-center justify-between gap-2 text-left"
        >
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </button>
        {hasToggle && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onToggleEnabled(!enabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              enabled ? 'bg-[#b8e000]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                enabled ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? 'Recolher' : 'Expandir'}
        >
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open && !isDisabled && (
        <div className="space-y-4 border-t border-gray-100 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  )
}
