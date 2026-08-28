import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/layout/Navbar'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AiChat from './pages/AiChat'
import Dialogue from './pages/Dialogue'
import Practice from './pages/Practice'
import Profile from './pages/Profile'
import Alerts from './pages/Alerts'
import AdminDashboard from './pages/admin/AdminDashboard'

/* Show navbar only on non-auth pages */
function Layout({ children }) {
  const location = useLocation()
  const isAuth = ['/', '/auth', '/login', '/signup'].includes(location.pathname)
  return (
    <>
      {!isAuth && <Navbar />}
      <div className={isAuth ? '' : 'pt-16'}>
        {children}
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected user routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AiChat /></ProtectedRoute>} />
            <Route path="/dialogue" element={<ProtectedRoute><Dialogue /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}
