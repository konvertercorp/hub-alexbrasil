import { useState } from 'react'
import { X } from 'lucide-react'

export function TagInput({ tags, onChange, placeholder }) {
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const value = draft.trim()
    if (!value || tags.includes(value)) {
      setDraft('')
      return
    }
    onChange([...tags, value])
    setDraft('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    }
  }

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-blue-500/30 px-2.5 py-1 text-xs font-medium text-blue-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remover ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-[100px] flex-1 bg-transparent py-1 text-sm text-white placeholder-blue-200/40 outline-none"
        />
      </div>
    </div>
  )
}
