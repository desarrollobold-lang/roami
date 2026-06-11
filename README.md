# Roami

App de viajes para organizar gastos, itinerarios y dividir costos entre compañeros de viaje.

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Backend**: Supabase (auth + base de datos)
- **Deploy**: Vercel

## Funcionalidades

- Gestión de viajes
- Control de gastos por viaje
- División de gastos entre participantes
- Itinerario con actividades
- Conversor de divisas
- Pantalla de exploración

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase |

Obtén estos valores en [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run lint` | Análisis de código con ESLint |
| `npm run lint:fix` | Corrección automática con ESLint |

## Deploy en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. El routing SPA ya está configurado en `vercel.json`
4. Vercel detecta Vite automáticamente — sin configuración adicional

## Estructura

```
src/
├── components/
│   ├── layout/      # AppShell y navegación
│   └── ui/          # Componentes reutilizables
├── features/        # Lógica por feature (currency, expenses, itinerary, split)
├── lib/             # Clientes externos (Supabase)
├── pages/           # Vistas principales
└── types/           # Tipos TypeScript compartidos
```
