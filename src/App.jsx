import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Activate from './pages/Activate'
import AudioLibrary from './pages/AudioLibrary'
import AiUstaz from './pages/AiUstaz'
import Grammar from './pages/Grammar'
import GrammarTopic from './pages/GrammarTopic'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import CheckoutDone from './pages/CheckoutDone'
import Profile from './pages/Profile'
import Alerts from './pages/Alerts'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAdmins from './pages/admin/AdminAdmins'
import AdminMaterials from './pages/admin/AdminMaterials'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCodes from './pages/admin/AdminCodes'
import AdminOrders from './pages/admin/AdminOrders'
import AdminAiConsole from './pages/admin/AdminAiConsole'
import AdminProfile from './pages/admin/AdminProfile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/activate" element={<ProtectedRoute><Activate /></ProtectedRoute>} />
      <Route path="/audio/:slug" element={<ProtectedRoute><AudioLibrary /></ProtectedRoute>} />
      <Route path="/ai-ustaz" element={<ProtectedRoute><AiUstaz /></ProtectedRoute>} />
      <Route path="/grammar" element={<ProtectedRoute><Grammar /></ProtectedRoute>} />
      <Route path="/grammar/:topicId" element={<ProtectedRoute><GrammarTopic /></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
      <Route path="/shop/:id" element={<ProtectedRoute><Product /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/checkout/done" element={<ProtectedRoute><CheckoutDone /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="admins" element={<AdminAdmins />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="codes" element={<AdminCodes />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="ai-console" element={<AdminAiConsole />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  )
}
