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

  const goPrev = (e) => {
    e.preventDefault()
    setIndex((prev) => (prev - 1 + noticias.length) % noticias.length)
  }
  const goNext = (e) => {
    e.preventDefault()
    setIndex((prev) => (prev + 1) % noticias.length)
  }

  const content = (
    <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {noticia.imagem_url ? (
        <img
          src={noticia.imagem_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-lime-100">
          <Newspaper size={28} className="text-lime-700" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="truncate text-sm font-semibold text-white">{noticia.titulo}</p>
        {noticia.texto && (
          <p className="truncate text-xs text-white/80">{noticia.texto}</p>
        )}
      </div>

      {noticias.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Notícia anterior"
            className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 backdrop-blur transition hover:bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próxima notícia"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 backdrop-blur transition hover:bg-white"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="mb-4">
      {noticia.link_url ? (
        <a href={noticia.link_url} target="_blank" rel="noreferrer" className="block">
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
