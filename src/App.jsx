import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import TermsAndConditions from './pages/TermsAndConditions.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import RefundPolicy from './pages/RefundPolicy.jsx'
import ContactUs from './pages/ContactUs.jsx'
import AboutUs from './pages/AboutUs.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import MyReviews from './pages/MyReviews.jsx'
import Notifications from './pages/Notifications.jsx'
import Activate from './pages/Activate.jsx'
import AudioLibrary from './pages/AudioLibrary.jsx'
import AiUstaz from './pages/AiUstaz.jsx'
import Grammar from './pages/Grammar.jsx'
import GrammarTopic from './pages/GrammarTopic.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Checkout from './pages/Checkout.jsx'
import CheckoutDone from './pages/CheckoutDone.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminAdmins from './pages/admin/AdminAdmins.jsx'
import AdminMaterials from './pages/admin/AdminMaterials.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminCodes from './pages/admin/AdminCodes.jsx'
import AdminDiscounts from './pages/admin/AdminDiscounts.jsx'
import AdminReviews from './pages/admin/AdminReviews.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminAiConsole from './pages/admin/AdminAiConsole.jsx'
import AdminProfile from './pages/admin/AdminProfile.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/refund" element={<RefundPolicy />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reviews"
        element={
          <ProtectedRoute>
            <MyReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activate"
        element={
          <ProtectedRoute>
            <Activate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audio"
        element={
          <ProtectedRoute>
            <AudioLibrary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audio/:moduleId"
        element={
          <ProtectedRoute>
            <AudioLibrary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-ustaz"
        element={
          <ProtectedRoute>
            <AiUstaz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/grammar"
        element={
          <ProtectedRoute>
            <Grammar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/grammar/:topicId"
        element={
          <ProtectedRoute>
            <GrammarTopic />
          </ProtectedRoute>
        }
      />
      {/* Shop, product pages, and checkout are public — a first-time visitor
          can browse and buy without an account (see Checkout.jsx for the
          guest-checkout flow). Everything else that needs a real account
          stays behind ProtectedRoute. */}
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:productId" element={<Product />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/done" element={<CheckoutDone />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="admins" element={<AdminAdmins />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="materials/:moduleId" element={<AdminMaterials />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="codes" element={<AdminCodes />} />
        <Route path="discounts" element={<AdminDiscounts />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:status" element={<AdminOrders />} />
        <Route path="ai" element={<AdminAiConsole />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  )
}
