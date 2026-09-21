import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TransitionLink, useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

const SHIPPING = 6
const inputClass =
  'rounded-[14px] border border-app-border bg-app-panel2 px-4 py-3.5 text-sm text-app-ink placeholder:text-app-inkFaint'

// What's included with every physical module — same claims the landing page makes.
const INCLUDED = [
  'Physical card & book set, delivered to your door',
  'Audio Library + AI Ustaz unlocked with your activation code',
  'Free Grammar module included with your account',
]

// PRD §6 issue #7: explicit Bayarcash / ToyyibPay choice, replacing the
// generic "FPX / DuitNow" visual-only radio from the design canvas mock.
// Real gateway redirect + webhook confirmation isn't wired yet (needs
// merchant API credentials) — placing an order here records it as
// payment_status "pending" rather than pretending payment succeeded.
const PAYMENT_METHODS = [
  { id: 'bayarcash', label: 'Bayarcash' },
  { id: 'toyyibpay', label: 'ToyyibPay' },
]

const COUNTRY_CODES = [
  { id: 'MY', code: '+60', label: 'MY +60' },
  { id: 'BN', code: '+673', label: 'BN +673' },
  { id: 'SG', code: '+65', label: 'SG +65' },
]

const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Kuala Lumpur',
  'Labuan',
  'Putrajaya',
]

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useTransitionNavigate()
  const { user, loading: authLoading } = useAuth()
  const [product, setProduct] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('bayarcash')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [state, setState] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState(null) // { code, percentOff, amount }
  const [discountError, setDiscountError] = useState('')
  const [checkingDiscount, setCheckingDiscount] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const productId = searchParams.get('product')

  useEffect(() => {
    if (!productId) return
    supabase
      .from('products')
      .select('id, name, price')
      .eq('id', productId)
      .single()
      .then(({ data, error: err }) => {
        if (err) {
          console.error('Failed to load product', err)
          return
        }
        setProduct(data)
      })
  }, [productId])

  if (!product || authLoading) {
    return (
      <AppShell bare={!user}>
        <div className="p-5 text-sm text-app-inkFaint">Loading…</div>
      </AppShell>
    )
  }

  const unitPrice = parseFloat(product.price)
  const subtotal = unitPrice * quantity
  const discountAmount = discount?.amount || 0
  const total = (subtotal - discountAmount + SHIPPING).toFixed(2)
  const phone = `${countryCode} ${phoneNumber}`.trim()
  const addressLine = [
    addressLine1,
    addressLine2,
    [postcode, city].filter(Boolean).join(' '),
    state,
  ]
    .filter(Boolean)
    .join(', ')

  async function applyDiscountCode() {
    setDiscountError('')
    const code = discountCode.trim().toUpperCase()
    if (!code) return
    setCheckingDiscount(true)
    try {
      const { data, error: err } = await supabase
        .from('discount_codes')
        .select('code, percent_off')
        .eq('is_active', true)
        .ilike('code', code)
        .maybeSingle()
      if (err) throw err
      if (!data) {
        setDiscount(null)
        setDiscountError('Invalid or expired code.')
        return
      }
      setDiscount({
        code: data.code,
        percentOff: data.percent_off,
        amount: parseFloat(((unitPrice * data.percent_off) / 100).toFixed(2)),
      })
    } catch (err) {
      setDiscount(null)
      setDiscountError(err.message || 'Could not check that code. Please try again.')
    } finally {
      setCheckingDiscount(false)
    }
  }

  function removeDiscount() {
    setDiscount(null)
    setDiscountCode('')
    setDiscountError('')
  }

  async function placeOrderAsMember(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          payment_provider: paymentMethod,
          payment_status: 'pending',
          shipping_status: 'pending',
          shipping_address: { name: user.fullName, phone, line: addressLine },
          discount_code: discount?.code || null,
          discount_amount: discountAmount,
        })
        .select('id')
        .single()
      if (orderError) throw orderError

      const { error: itemError } = await supabase
        .from('order_items')
        .insert({ order_id: order.id, product_id: product.id, quantity, price: product.price })
      if (itemError) throw itemError

      navigate('/checkout/done')
    } catch (err) {
      setError(err.message || 'Could not place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function placeOrderAsGuest(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('guest-checkout', {
        body: {
          fullName,
          email,
          password,
          phone,
          address: addressLine,
          productId: product.id,
          quantity,
          paymentMethod,
          discountCode: discount?.code || undefined,
        },
      })
      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)

      navigate('/checkout/done', {
        state: { accountCreated: data.accountCreated, passwordSet: true, email },
      })
    } catch (err) {
      setError(err.message || 'Could not place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const phoneMissing = !phoneNumber.trim()

  return (
    <AppShell bare={!user}>
      {!user && (
        <div className="flex items-center px-5 pt-5.5 pt-[22px]">
          <img src="/logo.png" alt="EduArabic for All" className="h-7 w-auto" />
        </div>
      )}

      <div className="mx-auto w-full max-w-[520px] px-5 pb-8 pt-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-1 text-[13px] font-semibold text-app-inkSoft"
        >
          <Icon name="arrow-left-01" size={14} /> Back
        </button>
        <h1 className="mb-4 font-poppins text-[26px] font-extrabold leading-tight">Confirm your order</h1>

        {/* Order summary */}
        <div className="mb-4 rounded-3xl bg-gradient-to-br from-[#16295A] via-[#2A3F8C] to-[#123B3A] p-6 text-white shadow-[0_18px_40px_rgba(20,40,110,.35)]">
          <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-pill bg-gold px-3 py-1 text-[11px] font-extrabold tracking-wide text-[#2A1C04]">
            <Icon name="medal-01" size={12} /> SELECTED MODULE
          </span>
          <div className="font-poppins text-[22px] font-extrabold leading-snug">{product.name}</div>
          <div className="mb-4 mt-1 text-[13.5px] font-semibold text-[#F1D08A]">
            Physical module · RM{product.price} each
          </div>
          <ul className="flex flex-col gap-2.5">
            {INCLUDED.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[13.5px] font-semibold leading-snug">
                <Icon name="checkmark-circle-02" size={18} className="mt-px flex-shrink-0 text-[#F1D08A]" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* Details + payment */}
        <form
          onSubmit={user ? placeOrderAsMember : placeOrderAsGuest}
          className="rounded-3xl border border-app-border bg-app-panel p-5 sm:p-6"
        >
          {user ? (
            <div className="mb-5 flex items-center gap-3 rounded-[14px] border border-app-border bg-app-panel2 px-4 py-3">
              <Icon name="user" size={16} className="flex-shrink-0 text-app-inkSoft" />
              <div className="min-w-0 text-[13px] text-app-ink">
                Buying as <span className="font-bold">{user.fullName}</span>{' '}
                <span className="text-app-inkFaint">({user.email})</span>
              </div>
            </div>
          ) : (
            <div className="mb-5 flex flex-col gap-3">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputClass}
              />
              <PasswordInput
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                className={inputClass}
              />
              <p className="px-1 text-[12px] leading-relaxed text-app-inkSoft">
                An account is created for you automatically — use it to sign in and activate your module. Already have
                one?{' '}
                <TransitionLink to="/auth" className="font-bold text-primary">
                  Sign in
                </TransitionLink>
              </p>
            </div>
          )}

          <div className="mb-3 flex gap-2.5">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className={`${inputClass} w-[104px] flex-shrink-0 px-3`}
              aria-label="Country code"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              inputMode="tel"
              className={`${inputClass} min-w-0 flex-1`}
            />
          </div>

          <div className="mb-5 flex flex-col gap-3">
            <input
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Shipping address — line 1"
              className={inputClass}
            />
            <input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Address line 2 (optional)"
              className={inputClass}
            />
            <div className="flex gap-3">
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className={`${inputClass} min-w-0 flex-1`}
              />
              <input
                required
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Postcode"
                inputMode="numeric"
                className={`${inputClass} w-[112px]`}
              />
            </div>
            <select required value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
              <option value="" disabled>
                State
              </option>
              {MALAYSIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 border-t border-app-border pt-5">
            {discount ? (
              <div className="flex items-center justify-between rounded-[14px] border border-primary/40 bg-primary/[.08] px-4 py-3.5 text-[13px]">
                <span className="font-bold text-app-ink">
                  {discount.code} applied — {discount.percentOff}% off
                </span>
                <button type="button" onClick={removeDiscount} className="text-[12px] font-bold text-app-inkSoft">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Discount code"
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={applyDiscountCode}
                  disabled={checkingDiscount || !discountCode.trim()}
                  className="flex-shrink-0 rounded-pill border border-app-border px-5 text-[13px] font-bold text-app-ink disabled:opacity-50"
                >
                  {checkingDiscount ? 'Checking…' : 'Apply'}
                </button>
              </div>
            )}
            {discountError && <div className="mt-2 px-1 text-[12px] font-semibold text-danger">{discountError}</div>}
          </div>

          <div className="mb-5 flex gap-2.5">
            {PAYMENT_METHODS.map((method) => {
              const active = paymentMethod === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex-1 rounded-pill border py-3 text-center text-[13px] font-bold ${
                    active
                      ? 'border-[1.5px] border-primary bg-primary/[.1] text-app-ink'
                      : 'border-app-border text-app-inkSoft'
                  }`}
                >
                  {method.label}
                </button>
              )
            })}
          </div>

          {/* Price breakdown */}
          <div className="mb-2 flex items-center justify-between text-[13.5px] text-app-inkSoft">
            <span>Quantity</span>
            <div className="flex items-center gap-1 rounded-pill border border-app-border bg-app-panel2 px-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-7 w-7 items-center justify-center text-base font-bold text-app-inkSoft disabled:opacity-40"
              >
                −
              </button>
              <span className="w-5 text-center text-[13px] font-bold text-app-ink">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center text-base font-bold text-app-inkSoft disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex justify-between py-1.5 text-[13.5px] text-app-inkSoft">
            <span>Price</span>
            <span>RM{subtotal.toFixed(2)}</span>
          </div>
          {discount && (
            <div className="flex justify-between py-1.5 text-[13.5px] text-primary">
              <span>Discount ({discount.code})</span>
              <span>-RM{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 text-[13.5px] text-app-inkSoft">
            <span>Shipping</span>
            <span>RM{SHIPPING.toFixed(2)}</span>
          </div>
          <div className="mb-4 mt-2 flex justify-between border-t border-app-border pt-4 font-poppins text-[18px] font-extrabold">
            <span>Total</span>
            <span>RM{total}</span>
          </div>

          {phoneMissing && (
            <div className="mb-3 flex items-center justify-center gap-2 rounded-[12px] border border-gold/30 bg-gold/[.12] px-3 py-2.5 text-center text-[12.5px] font-semibold text-gold">
              <Icon name="alert-circle" size={15} className="flex-shrink-0" />
              Phone number required before checkout.
            </div>
          )}
          {error && <div className="mb-3 text-center text-[13px] font-semibold text-danger">{error}</div>}

          <button
            type="submit"
            disabled={submitting || phoneMissing}
            className="w-full rounded-pill bg-primary py-4 text-[15px] font-bold text-[#0B2A4A] shadow-[0_8px_24px_rgba(61,125,216,.3)] disabled:opacity-50 disabled:shadow-none"
          >
            {submitting ? 'Placing order…' : `Place order · RM${total} →`}
          </button>

          <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11.5px] text-app-inkFaint">
            <Icon name="lock" size={13} />
            Secure payment via {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
          </div>
        </form>
      </div>
    </AppShell>
  )
}
