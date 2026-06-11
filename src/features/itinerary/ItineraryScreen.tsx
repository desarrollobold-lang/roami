import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Plane, Home, Utensils, MapPin, Sun, type LucideIcon } from 'lucide-react'
import type { ItineraryDay, Activity } from '../../types/itinerary'

const ACTIVITY_COLORS: Record<Activity['type'], string> = {
  transport: '#18C3F3',
  accommodation: '#C4A86A',
  food: '#C9A44E',
  activity: '#3F5F3A',
  free: '#A0A0A8',
}

const ACTIVITY_ICONS: Record<Activity['type'], LucideIcon> = {
  transport: Plane,
  accommodation: Home,
  food: Utensils,
  activity: MapPin,
  free: Sun,
}

const DAY_CITIES: Record<string, string> = {
  'day-1': 'París',
  'day-2': 'París',
  'day-3': 'Roma',
}

const MOCK_ITINERARY: ItineraryDay[] = [
  {
    id: 'day-1', trip_id: 'mock-trip-1', day_number: 1,
    date: '2026-05-15', title: 'Llegada a París',
    activities: [
      { id: 'a-1', day_id: 'day-1', time: '10:30', title: 'Vuelo BCN-CDG', location: 'Aeropuerto El Prat', type: 'transport', completed: false },
      { id: 'a-2', day_id: 'day-1', time: '13:00', title: 'Check-in Hotel Le Marais', location: 'Le Marais, París', type: 'accommodation', completed: false },
      { id: 'a-3', day_id: 'day-1', time: '19:00', title: 'Cena en Montmartre', location: 'Montmartre, París', type: 'food', completed: false },
    ],
  },
  {
    id: 'day-2', trip_id: 'mock-trip-1', day_number: 2,
    date: '2026-05-16', title: 'París Esencial',
    activities: [
      { id: 'a-4', day_id: 'day-2', time: '09:00', title: 'Torre Eiffel', location: 'Champ de Mars, París', type: 'activity', completed: false },
      { id: 'a-5', day_id: 'day-2', time: '12:30', title: 'Almuerzo Café de Flore', location: 'Saint-Germain, París', notes: 'Reserva a nombre de María', type: 'food', completed: false },
      { id: 'a-6', day_id: 'day-2', time: '15:00', title: 'Museo del Louvre', location: 'Rue de Rivoli, París', type: 'activity', completed: false },
      { id: 'a-7', day_id: 'day-2', time: '20:00', title: 'Cena junto al Sena', location: 'Quai de la Tournelle, París', type: 'food', completed: false },
    ],
  },
  {
    id: 'day-3', trip_id: 'mock-trip-1', day_number: 3,
    date: '2026-05-17', title: 'Roma',
    activities: [
      { id: 'a-8', day_id: 'day-3', time: '08:00', title: 'Tren París-Roma', location: 'Gare de Lyon, París', type: 'transport', completed: false },
      { id: 'a-9', day_id: 'day-3', time: '15:00', title: 'Check-in Hotel Colosseo', location: 'Via Labicana, Roma', type: 'accommodation', completed: false },
      { id: 'a-10', day_id: 'day-3', time: '18:00', title: 'Tiempo libre', location: 'Centro de Roma', type: 'free', completed: false },
    ],
  },
]

export function ItineraryScreen() {
  const [selectedDayId, setSelectedDayId] = useState(MOCK_ITINERARY[0]!.id)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const selectedDay = MOCK_ITINERARY.find((d) => d.id === selectedDayId) ?? MOCK_ITINERARY[0]!
  const completedCount = selectedDay.activities.filter((a) => completedIds.has(a.id)).length
  const total = selectedDay.activities.length
  const progress = total > 0 ? completedCount / total : 0

  const toggleActivity = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#09090B' }}>
      {/* Hero image */}
      <div className="relative" style={{ height: 160, backgroundColor: '#111115' }}>
        <img
          src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80"
          alt="Europa 2026"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(15,15,18,0.9) 0%, rgba(15,15,18,0.3) 60%, transparent 100%)',
          }}
        />
        <div className="absolute bottom-0 left-0 px-5 pb-4">
          <h1 className="font-bold text-white leading-tight" style={{ fontSize: 28 }}>
            Europa 2026
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Itinerario</p>
        </div>
      </div>

      {/* Day selector */}

      {/* Day selector */}
      <div className="flex gap-2 px-5 pt-4 overflow-x-auto no-scrollbar pb-4">
        {MOCK_ITINERARY.map((day) => {
          const isActive = day.id === selectedDayId
          return (
            <motion.button
              key={day.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDayId(day.id)}
              className="shrink-0 px-4 py-2 rounded-chip text-sm font-semibold border transition-all duration-200"
              style={{
                backgroundColor: isActive ? '#C4A86A' : 'rgba(255,255,255,0.06)',
                borderColor: isActive ? '#C4A86A' : 'rgba(255,255,255,0.08)',
                color: isActive ? '#F5F5F7' : '#A0A0A8',
                boxShadow: isActive ? '0 0 20px rgba(196,168,106,0.45)' : 'none',
              }}
            >
              Día {day.day_number} · {DAY_CITIES[day.id] ?? ''}
            </motion.button>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
            {completedCount} de {total} actividades
          </p>
          <p className="text-[11px] font-bold" style={{ color: '#C4A86A' }}>
            {Math.round(progress * 100)}%
          </p>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: '#C4A86A',
              boxShadow: '0 0 8px rgba(196,168,106,0.6)',
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Timeline */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDayId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          className="px-5 pb-32"
        >
          <div className="mb-4">
            <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>
              {selectedDay.title}
            </h2>
            <p className="text-[13px] text-text-secondary mt-0.5">
              {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute top-0 bottom-0"
              style={{ left: 59, width: 1, backgroundColor: 'rgba(255,255,255,0.07)' }}
            />

            <div className="space-y-4">
              {selectedDay.activities.map((activity) => {
                const isCompleted = completedIds.has(activity.id)
                const color = ACTIVITY_COLORS[activity.type]
                const Icon = ACTIVITY_ICONS[activity.type]

                return (
                  <div key={activity.id} className="flex items-start">
                    {/* Time */}
                    <div className="shrink-0 text-right pr-3" style={{ width: 52, paddingTop: 14 }}>
                      <span className="text-[12px] font-medium" style={{ color: '#A0A0A8' }}>
                        {activity.time}
                      </span>
                    </div>

                    {/* Dot */}
                    <div
                      className="shrink-0 flex items-start justify-center"
                      style={{ width: 16, paddingTop: 15 }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 z-10"
                        style={{
                          backgroundColor: `${color}33`,
                          borderColor: color,
                          boxShadow: `0 0 8px ${color}66`,
                        }}
                      />
                    </div>

                    {/* Card */}
                    <div className="flex-1 ml-3">
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => toggleActivity(activity.id)}
                        className="relative p-4 rounded-card border cursor-pointer overflow-hidden"
                        style={{
                          backgroundColor: '#1F1F21',
                          borderColor: isCompleted ? 'rgba(63,95,58,0.4)' : 'rgba(255,255,255,0.08)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                          opacity: isCompleted ? 0.55 : 1,
                          transition: 'opacity 0.25s, border-color 0.25s',
                        }}
                      >
                        {isCompleted && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center z-10"
                            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                          >
                            <CheckCircle2 size={28} color="#3F5F3A" strokeWidth={1.5} />
                          </motion.div>
                        )}

                        <div className="flex items-start gap-3">
                          <div
                            className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                            style={{
                              backgroundColor: `${color}1A`,
                              border: `1px solid ${color}44`,
                            }}
                          >
                            <Icon size={16} color={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-text-primary leading-tight" style={{ fontSize: 14 }}>
                              {activity.title}
                            </p>
                            {activity.location && (
                              <p className="text-[12px] text-text-secondary mt-0.5">
                                {activity.location}
                              </p>
                            )}
                            {activity.notes && (
                              <p
                                className="text-[11px] mt-2 px-2 py-1 rounded"
                                style={{ backgroundColor: 'rgba(201,164,78,0.1)', color: '#C9A44E' }}
                              >
                                📌 {activity.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
