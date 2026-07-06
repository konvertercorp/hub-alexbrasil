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
    <div className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#b8e000]">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-medium text-lime-800"
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
          className="min-w-[100px] flex-1 bg-transparent py-1 text-base text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>
    </div>
  )
}
