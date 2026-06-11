import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppShell } from './components/layout'
import { SplashPage } from './pages/SplashPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TripsPage } from './pages/TripsPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { SplitPage } from './pages/SplitPage'
import { ItineraryPage } from './pages/ItineraryPage'
import { CurrencyPage } from './pages/CurrencyPage'
import { ExploreScreen } from './pages/ExploreScreen'
import { ProfilePage } from './pages/ProfilePage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Full-screen flows (no shell / no nav) */}
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

          {/* Main app shell */}
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/splash" replace />} />
            <Route path="home" element={<TripsPage />} />
            <Route path="trips" element={<ExploreScreen />} />
            <Route path="trips/:tripId/expenses" element={<ExpensesPage />} />
            <Route path="trips/:tripId/split" element={<SplitPage />} />
            <Route path="trips/:tripId/itinerary" element={<ItineraryPage />} />
            <Route path="currency" element={<CurrencyPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="explore" element={<Navigate to="/trips" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
