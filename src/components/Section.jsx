import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const TONE_CLASSES = {
  blue: 'bg-blue-500/20 text-blue-200',
  amber: 'bg-amber-500/20 text-amber-200',
  teal: 'bg-teal-500/20 text-teal-200',
  red: 'bg-red-500/20 text-red-200',
  purple: 'bg-purple-500/20 text-purple-200',
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
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
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
          <span className="text-sm font-semibold text-white">{title}</span>
        </button>
        {hasToggle && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onToggleEnabled(!enabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              enabled ? 'bg-emerald-500' : 'bg-white/20'
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
            className={`text-blue-200 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open && !isDisabled && (
        <div className="space-y-4 border-t border-white/10 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  )
}
