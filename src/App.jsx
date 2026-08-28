import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/layout/Navbar'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AiChat from './pages/AiChat'
import Dialogue from './pages/Dialogue'
import Practice from './pages/Practice'
import AdminDashboard from './pages/admin/AdminDashboard'

/* Lightweight page entrance animation */
function PageWrap({ children }) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="ea-page-enter pt-16">
      {children}
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Routes location={location} key={location.pathname}>
      {/* Public routes */}
      <Route path="/" element={<PageWrap><Landing /></PageWrap>} />
      <Route path="/auth" element={<PageWrap><Auth /></PageWrap>} />

      {/* Protected user routes */}
      <Route path="/chat" element={<ProtectedRoute><PageWrap><AiChat /></PageWrap></ProtectedRoute>} />
      <Route path="/dialogue" element={<ProtectedRoute><PageWrap><Dialogue /></PageWrap></ProtectedRoute>} />
      <Route path="/practice" element={<ProtectedRoute><PageWrap><Practice /></PageWrap></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><div className="pt-16"><AdminDashboard /></div></AdminRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
