import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

const SHIPPING = 6
const inputClass =
  'rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-3 text-[13.5px] text-app-ink placeholder:text-app-inkFaint'

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
  { id: 'MY', code: '+60', label: 'Malaysia (+60)' },
  { id: 'BN', code: '+673', label: 'Brunei (+673)' },
  { id: 'SG', code: '+65', label: 'Singapore (+65)' },
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
  const navigate = useNavigate()
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

  return (
    <AppShell bare={!user}>
      {!user && (
        <div className="flex items-center px-5 pt-5.5 pt-[22px]">
          <img src="/logo.png" alt="EduArabic for All" className="h-7 w-auto" />
        </div>
      )}
      <div className="flex items-center gap-3 px-5 pb-1.5 pt-5.5 pt-[22px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
        >
          <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
        </button>
        <div className="font-poppins text-base font-extrabold">Checkout</div>
      </div>

      <form onSubmit={user ? placeOrderAsMember : placeOrderAsGuest} className="px-5 pb-6 pt-3.5">
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-app-border bg-app-panel p-3">
          <PlaceholderBlock variant="dark" label="" className="h-11 w-11 flex-shrink-0 rounded-[11px]" />
          <div className="flex-1">
            <div className="text-[13px] font-bold">{product.name}</div>
            <div className="text-[11px] text-app-inkFaint">RM{product.price} each</div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2.5 rounded-[10px] border border-app-border bg-app-panel2 px-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center text-base font-bold text-app-inkSoft disabled:opacity-40"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="w-4 text-center text-[13px] font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="flex h-7 w-7 items-center justify-center text-base font-bold text-app-inkSoft disabled:opacity-40"
              disabled={quantity >= 10}
            >
              +
            </button>
          </div>
        </div>

        {user ? (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-app-border bg-app-panel2 px-3.5 py-3">
            <Icon name="user" size={16} className="text-app-inkSoft" />
            <div className="text-[13px] text-app-ink">
              Buying as <span className="font-bold">{user.fullName}</span> ({user.email})
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-dashed border-app-border bg-app-panel/60 px-3.5 py-3 text-[12.5px] text-app-inkSoft">
            Buying as a guest.{' '}
            <Link to="/auth" className="font-bold text-primary">
              Already have an account? Sign in
            </Link>
          </div>
        )}

        {!user && (
          <>
            <div className="mb-2.5 text-[12.5px] font-bold text-app-inkSoft">YOUR DETAILS</div>
            <div className="mb-5 flex flex-col gap-2.5">
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
                placeholder="Email — used to sign in and activate your module"
                className={inputClass}
              />
              <PasswordInput
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={inputClass}
              />
            </div>
          </>
        )}

        <div className="mb-2.5 text-[12.5px] font-bold text-app-inkSoft">PHONE</div>
        <div className="mb-5 flex gap-2.5">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className={`${inputClass} w-[132px] flex-shrink-0`}
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
            placeholder="Number"
            inputMode="tel"
            className={`${inputClass} flex-1`}
          />
        </div>

        <div className="mb-2.5 text-[12.5px] font-bold text-app-inkSoft">SHIPPING ADDRESS</div>
        <div className="mb-5 flex flex-col gap-2.5">
          <input
            required
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Address line 1"
            className={inputClass}
          />
          <input
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Address line 2 (optional)"
            className={inputClass}
          />
          <div className="flex gap-2.5">
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className={`${inputClass} flex-1`}
            />
            <input
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Postcode"
              inputMode="numeric"
              className={`${inputClass} w-[110px]`}
            />
          </div>
          <select required value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
            <option value="" disabled>
              State
            </option>
            {MALAYSIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2.5 text-[12.5px] font-bold text-app-inkSoft">DISCOUNT CODE</div>
        <div className="mb-5">
          {discount ? (
            <div className="flex items-center justify-between rounded-[11px] border border-primary/40 bg-primary/[.08] px-3.5 py-3 text-[13px]">
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
                placeholder="Enter code"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={applyDiscountCode}
                disabled={checkingDiscount || !discountCode.trim()}
                className="flex-shrink-0 rounded-[11px] border border-app-border bg-app-panel2 px-4 text-[12.5px] font-bold text-app-ink disabled:opacity-50"
              >
                {checkingDiscount ? 'Checking…' : 'Apply'}
              </button>
            </div>
          )}
          {discountError && <div className="mt-2 text-[12px] font-semibold text-danger">{discountError}</div>}
        </div>

        <div className="mb-2.5 text-[12.5px] font-bold text-app-inkSoft">PAYMENT METHOD</div>
        <div className="mb-5 flex gap-2.5">
          {PAYMENT_METHODS.map((method) => {
            const active = paymentMethod === method.id
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`flex-1 rounded-xl border py-3 text-center text-[12.5px] font-bold ${
                  active ? 'border-[1.5px] border-primary bg-primary/[.08] text-app-ink' : 'border-app-border text-app-inkSoft'
                }`}
              >
                {method.label}
              </button>
            )
          })}
        </div>

        <div className="mb-1.5 flex justify-between text-[13px] text-app-inkSoft">
          <span>Subtotal ({quantity} × RM{product.price})</span>
          <span>RM{subtotal.toFixed(2)}</span>
        </div>
        {discount && (
          <div className="mb-1.5 flex justify-between text-[13px] text-primary">
            <span>Discount ({discount.code})</span>
            <span>-RM{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="mb-3.5 flex justify-between text-[13px] text-app-inkSoft">
          <span>Shipping</span>
          <span>RM{SHIPPING.toFixed(2)}</span>
        </div>
        <div className="mb-5 flex justify-between border-t border-app-border pt-3 font-poppins text-[15px] font-extrabold">
          <span>Total</span>
          <span className="text-primary">RM{total}</span>
        </div>

        {error && <div className="mb-3.5 text-[13px] font-semibold text-danger">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[13px] bg-primary py-[15px] text-[15px] font-bold text-[#0B2A4A] disabled:opacity-60"
        >
          {submitting ? 'Placing order…' : 'Place order'}
        </button>

        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11.5px] text-app-inkFaint">
          <Icon name="lock" size={13} />
          Your payment is secure
        </div>
      </form>
    </AppShell>
  )
}
