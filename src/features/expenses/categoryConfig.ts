import {
  Utensils,
  Bus,
  BedDouble,
  Theater,
  ShoppingBag,
  Pill,
  Package,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '../../types/expenses'

interface CategoryConfig {
  icon: LucideIcon
  color: string
  bgColor: string
  label: string
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  food: {
    icon: Utensils,
    color: '#C9A44E',
    bgColor: 'rgba(201,164,78,0.15)',
    label: 'Comida',
  },
  transport: {
    icon: Bus,
    color: '#18C3F3',
    bgColor: 'rgba(24,195,243,0.15)',
    label: 'Transporte',
  },
  accommodation: {
    icon: BedDouble,
    color: '#674CBF',
    bgColor: 'rgba(103,76,191,0.15)',
    label: 'Alojamiento',
  },
  activities: {
    icon: Theater,
    color: '#6DBF65',
    bgColor: 'rgba(109,191,101,0.15)',
    label: 'Actividades',
  },
  shopping: {
    icon: ShoppingBag,
    color: '#F5F5F7',
    bgColor: 'rgba(245,245,247,0.10)',
    label: 'Compras',
  },
  health: {
    icon: Pill,
    color: '#E05C5C',
    bgColor: 'rgba(224,92,92,0.15)',
    label: 'Salud',
  },
  other: {
    icon: Package,
    color: '#A0A0A8',
    bgColor: 'rgba(160,160,168,0.12)',
    label: 'Otro',
  },
}

export const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[]
