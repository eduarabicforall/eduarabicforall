import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Shop from './pages/Shop'
import Dashboard from './pages/Dashboard'
import LearningPath from './pages/LearningPath'
import Lesson from './pages/Lesson'
import AudioLibrary from './pages/AudioLibrary'
import Classes from './pages/Classes'
import AiUstaz from './pages/AiUstaz'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminModules from './pages/admin/AdminModules'
import AdminVideos from './pages/admin/AdminVideos'
import AdminClasses from './pages/admin/AdminClasses'
import AdminOrders from './pages/admin/AdminOrders'

/* Lightweight page entrance animation via CSS keyframe */
function PageWrap({ children }) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="ea-page-enter">
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
      <Route path="/shop" element={<PageWrap><Shop /></PageWrap>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><PageWrap><Dashboard /></PageWrap></ProtectedRoute>} />
      <Route path="/learning-path" element={<ProtectedRoute><PageWrap><LearningPath /></PageWrap></ProtectedRoute>} />
      <Route path="/lesson/:id" element={<ProtectedRoute><PageWrap><Lesson /></PageWrap></ProtectedRoute>} />
      <Route path="/audio" element={<ProtectedRoute><PageWrap><AudioLibrary /></PageWrap></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute><PageWrap><Classes /></PageWrap></ProtectedRoute>} />
      <Route path="/ai-ustaz" element={<ProtectedRoute><PageWrap><AiUstaz /></PageWrap></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<PageWrap><AdminDashboard /></PageWrap>} />
        <Route path="users" element={<PageWrap><AdminUsers /></PageWrap>} />
        <Route path="modules" element={<PageWrap><AdminModules /></PageWrap>} />
        <Route path="videos" element={<PageWrap><AdminVideos /></PageWrap>} />
        <Route path="classes" element={<PageWrap><AdminClasses /></PageWrap>} />
        <Route path="orders" element={<PageWrap><AdminOrders /></PageWrap>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AnimatedRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
