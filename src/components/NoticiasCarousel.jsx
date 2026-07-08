import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react'
import { useNoticias } from '../hooks/useNoticias'

const AUTO_ADVANCE_MS = 15000

export function NoticiasCarousel() {
  const { noticias } = useNoticias()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (noticias.length < 2) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % noticias.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [noticias.length])

  if (noticias.length === 0) return null

  const noticia = noticias[index % noticias.length]

  const goPrev = () => setIndex((prev) => (prev - 1 + noticias.length) % noticias.length)
  const goNext = () => setIndex((prev) => (prev + 1) % noticias.length)

  const content = (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      {noticia.imagem_url ? (
        <img
          src={noticia.imagem_url}
          alt=""
          className="h-9 w-9 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-100">
          <Newspaper size={16} className="text-lime-700" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{noticia.titulo}</p>
        {noticia.texto && (
          <p className="truncate text-xs text-gray-500">{noticia.texto}</p>
        )}
      </div>
      {noticias.length > 1 && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              goPrev()
            }}
            aria-label="Notícia anterior"
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              goNext()
            }}
            aria-label="Próxima notícia"
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="mb-4">
      {noticia.link_url ? (
        <a href={noticia.link_url} target="_blank" rel="noreferrer">
          {content}
        </a>
      ) : (
        content
      )}
      {noticias.length > 1 && (
        <div className="mt-1.5 flex justify-center gap-1">
          {noticias.map((n, i) => (
            <span
              key={n.id}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-4 bg-[#b8e000]' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
