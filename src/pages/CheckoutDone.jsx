import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function CheckoutDone() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { user } = useAuth()

  let message = "We'll email you once it ships. Your activation code arrives with the module."
  if (state?.accountCreated) {
    message = `We've also created your account with ${state.email} and the password you set — you can sign in with it anytime.`
  } else if (state?.email) {
    message = `This order has been added to the existing account for ${state.email}. Sign in to that account to track it and activate your module once it arrives.`
  }

  return (
    <AppShell bare={!user}>
      <div className="flex flex-col items-center px-7.5 py-15 px-[30px] py-[60px] text-center">
        <div className="mb-4.5 mb-[18px] flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[.18]">
          <Icon name="checkmark-circle-02" size={26} className="text-primary" />
        </div>
        <div className="mb-2 font-sora text-[19px] font-extrabold">Order placed!</div>
        <div className="mb-6 text-[13px] leading-relaxed text-app-inkSoft">{message}</div>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="w-full rounded-xl border border-app-border bg-app-panel2 py-3.5 text-sm font-bold text-app-ink"
        >
          Back to shop
        </button>
      </div>
    </AppShell>
  )
}
