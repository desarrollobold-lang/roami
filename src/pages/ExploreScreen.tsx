import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Star, Clock, Flame } from 'lucide-react'

const FEATURED = [
  {
    name: 'Tokio',
    country: 'Japón',
    tag: 'Tendencia',
    budget: '~$2,200 / semana',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80',
  },
  {
    name: 'Lisboa',
    country: 'Portugal',
    tag: 'Favorito',
    budget: '~$1,100 / semana',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=80',
  },
]

const DESTINATIONS = [
  {
    name: 'Santorini',
    country: 'Grecia',
    budget: '~$2,800 / sem.',
    rating: 4.9,
    tag: 'Luxury',
    tagColor: '#C9A84B',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80',
  },
  {
    name: 'Medellín',
    country: 'Colombia',
    budget: '~$600 / sem.',
    rating: 4.7,
    tag: 'Económico',
    tagColor: '#5BAA7A',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    name: 'Dubái',
    country: 'Emiratos',
    budget: '~$3,500 / sem.',
    rating: 4.8,
    tag: 'Premium',
    tagColor: '#C9A84B',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  },
  {
    name: 'Bangkok',
    country: 'Tailandia',
    budget: '~$700 / sem.',
    rating: 4.6,
    tag: 'Mochilero',
    tagColor: '#7A8C78',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
  },
  {
    name: 'Nueva York',
    country: 'EE.UU.',
    budget: '~$3,200 / sem.',
    rating: 4.8,
    tag: 'Ciudad',
    tagColor: '#7A8C78',
    image: 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=600&q=80',
  },
  {
    name: 'Machu Picchu',
    country: 'Perú',
    budget: '~$900 / sem.',
    rating: 4.9,
    tag: 'Aventura',
    tagColor: '#5BAA7A',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&q=80',
  },
]

const CATEGORIES = [
  { label: 'Todo',         icon: '🌍' },
  { label: 'Playa',        icon: '🏖️' },
  { label: 'Ciudad',       icon: '🏙️' },
  { label: 'Aventura',     icon: '🏔️' },
  { label: 'Gastronomía',  icon: '🍜' },
  { label: 'Lujo',         icon: '✨' },
]

export function ExploreScreen() {
  const [selectedCat, setSelectedCat] = useState('Todo')
  const [query, setQuery] = useState('')

  const visible = DESTINATIONS.filter((d) => {
    const matchesQuery = !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.country.toLowerCase().includes(query.toLowerCase())
    const matchesCat = selectedCat === 'Todo' || d.tag.toLowerCase().includes(selectedCat.toLowerCase()) || selectedCat.toLowerCase().includes(d.tag.toLowerCase())
    return matchesQuery && matchesCat
  })

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#0B1410' }}>
      {/* ── Header ──────────────────────────────── */}
      <div
        className="px-5 pt-14 pb-4"
        style={{ background: 'linear-gradient(180deg, rgba(91,170,122,0.05) 0%, rgba(11,20,16,0) 100%)' }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#F2EDE4', margin: '0 0 4px', letterSpacing: '-0.5px', fontFamily: 'Fraunces, serif' }}>
          Explorar
        </h1>
        <p style={{ fontSize: 14, color: '#7A8C78' }}>Inspiración para tu próximo viaje</p>
      </div>

      {/* ── Search ──────────────────────────────── */}
      <div className="px-5 mb-4">
        <div
          className="flex items-center gap-3"
          style={{
            backgroundColor: '#172118',
            border: '1px solid #1E3022',
            borderRadius: 16,
            padding: '12px 16px',
          }}
        >
          <Search size={17} color="#7A8C78" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Destinos, países, experiencias..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: '#F2EDE4' }}
          />
        </div>
      </div>

      {/* ── Category chips ───────────────────────── */}
      <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar pb-1 mb-5">
        {CATEGORIES.map((cat) => {
          const active = selectedCat === cat.label
          return (
            <motion.button
              key={cat.label}
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedCat(cat.label)}
              className="flex items-center gap-2 px-4 py-2 rounded-chip shrink-0 text-sm font-semibold"
              style={{
                backgroundColor: active ? '#C9A84B' : '#172118',
                color: active ? '#0B1410' : '#7A8C78',
                border: active ? 'none' : '1px solid #1E3022',
                boxShadow: active ? '0 0 16px rgba(201,168,75,0.3)' : 'none',
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </motion.button>
          )
        })}
      </div>

      <div className="px-5 space-y-6">
        {/* ── Featured / Hero cards ────────────────── */}
        {selectedCat === 'Todo' && !query && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame size={15} color="#C97070" />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#7A8C78', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Tendencias
              </p>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {FEATURED.map((dest) => (
                <motion.div
                  key={dest.name}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    minWidth: 220,
                    height: 160,
                    borderRadius: 20,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(11,20,16,0.95) 0%, rgba(11,20,16,0.15) 60%)' }}
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: '#C9A84B',
                        color: '#0B1410',
                        padding: '3px 9px',
                        borderRadius: 999,
                      }}
                    >
                      {dest.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 px-4 pb-4">
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#F2EDE4', fontFamily: 'Fraunces, serif' }}>{dest.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(242,237,228,0.55)', marginTop: 1 }}>{dest.country} · {dest.budget}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Destination grid ────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} color="#C9A84B" />
            <p style={{ fontSize: 12, fontWeight: 700, color: '#7A8C78', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {selectedCat === 'Todo' ? 'Todos los destinos' : selectedCat}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {visible.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  position: 'relative',
                  height: 165,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                }}
              >
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(11,20,16,0.95) 0%, rgba(11,20,16,0.1) 55%)' }}
                />

                {/* Tag */}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      backgroundColor: dest.tagColor,
                      color: '#0B1410',
                      padding: '2px 7px',
                      borderRadius: 999,
                    }}
                  >
                    {dest.tag}
                  </span>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 px-3 pb-3">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Star size={10} color="#C9A84B" fill="#C9A84B" />
                    <span style={{ fontSize: 10, color: '#C9A84B', fontWeight: 700 }}>{dest.rating}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#F2EDE4', lineHeight: 1.2, fontFamily: 'Fraunces, serif' }}>{dest.name}</p>
                  <p style={{ fontSize: 10, color: 'rgba(242,237,228,0.45)', marginTop: 1 }}>{dest.country}</p>
                  <p style={{ fontSize: 10, color: '#C9A84B', fontWeight: 600, marginTop: 2 }}>{dest.budget}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {visible.length === 0 && (
            <div className="text-center py-16">
              <p style={{ fontSize: 24 }}>🌍</p>
              <p style={{ fontSize: 15, color: '#F2EDE4', fontWeight: 600, marginTop: 8 }}>Sin resultados</p>
              <p style={{ fontSize: 13, color: '#7A8C78', marginTop: 4 }}>Prueba con otro destino o categoría</p>
            </div>
          )}
        </div>

        {/* ── Travel budget guide ──────────────────── */}
        {selectedCat === 'Todo' && !query && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} color="#7A8C78" />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#7A8C78', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Guía de presupuesto
              </p>
            </div>
            <div
              style={{
                backgroundColor: '#172118',
                border: '1px solid #1E3022',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {[
                { tier: 'Mochilero',    range: '$30–60 / día',   icon: '🎒', color: '#5BAA7A' },
                { tier: 'Confort',      range: '$80–150 / día',  icon: '🏨', color: '#7A8C78' },
                { tier: 'Premium',      range: '$200–400 / día', icon: '✨', color: '#C9A84B' },
              ].map((tier, i) => (
                <div key={tier.tier}>
                  {i > 0 && <div style={{ height: 1, backgroundColor: '#1E3022', marginLeft: 60 }} />}
                  <div className="flex items-center gap-4 px-5 py-4">
                    <span style={{ fontSize: 22 }}>{tier.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#F2EDE4' }}>{tier.tier}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tier.color }}>{tier.range}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
