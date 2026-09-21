import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { functionErrorCode } from '../lib/functionError.js'
import { supabase } from '../lib/supabase.js'
import { useModuleTree } from './ModuleTreeContext.jsx'

const AdminContext = createContext(null)

// Grammar module is structurally different from the audio modules above — per
// PRD §4.7/§4.8 each topic is a lesson VIDEO plus practice QUIZZES (MCQ,
// word-order, true/false), not units of dialogue audio. Backed by the real
// grammar_topics/quiz_questions tables — the same ones the student-facing
// Grammar pages read — so admin edits here show up for students immediately.
async function loadGrammarTopics() {
  const { data: topics, error: topicsError } = await supabase
    .from('grammar_topics')
    .select('id, title_en, video_r2_key, order_index')
    .order('order_index')
  if (topicsError) throw topicsError

  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('id, topic_id, type, payload_json, order_index')
    .order('order_index')
  if (questionsError) throw questionsError

  return topics.map((t) => ({
    id: t.id,
    titleEn: t.title_en,
    videoUrl: t.video_r2_key,
    quizzes: {
      mcq: questions.filter((q) => q.topic_id === t.id && q.type === 'mcq').map((q) => ({ id: q.id, ...q.payload_json })),
      order: questions.filter((q) => q.topic_id === t.id && q.type === 'order').map((q) => ({ id: q.id, ...q.payload_json })),
      tf: questions.filter((q) => q.topic_id === t.id && q.type === 'tf').map((q) => ({ id: q.id, ...q.payload_json })),
    },
  }))
}

async function loadAdmins() {
  const { data, error } = await supabase
    .from('admin_allowlist')
    .select('email, added_at')
    .order('added_at', { ascending: false })
  if (error) throw error
  return data.map((a) => ({
    email: a.email,
    added: new Date(a.added_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }),
  }))
}

async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, image_urls, module_id, stock, on_sale, is_active, modules(name)')
    .order('created_at')
  if (error) throw error
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: String(p.price),
    imageUrl: p.image_url || '',
    imageUrls: p.image_urls || [],
    moduleId: p.module_id,
    module: p.modules?.name || '',
    stock: p.stock,
    onSale: p.on_sale,
    active: p.is_active,
  }))
}

async function loadCodes() {
  const { data, error } = await supabase
    .from('module_codes')
    .select('id, code, module_id, batch_id, activated_count, status, modules(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((c) => ({
    id: c.id,
    code: c.code,
    module: c.modules?.name || '',
    moduleId: c.module_id,
    batch: c.batch_id,
    activatedCount: c.activated_count,
    status: c.status,
  }))
}

function formatAddress(address) {
  if (!address) return '—'
  if (typeof address === 'string') return address
  const { name, phone, line, city, postcode, state } = address
  return [name, phone, line, [postcode, city].filter(Boolean).join(' '), state].filter(Boolean).join(', ')
}

async function loadOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, user_id, total, payment_status, shipping_status, shipping_address, order_items(quantity, price, products(name))')
    .order('created_at', { ascending: false })
  if (error) throw error

  const userIds = [...new Set(orders.map((o) => o.user_id))]
  const profileById = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    for (const p of profiles || []) profileById[p.id] = p
  }

  return orders.map((o) => ({
    id: o.id,
    customer: profileById[o.user_id]?.full_name || profileById[o.user_id]?.email || 'Unknown customer',
    total: String(o.total),
    payment: o.payment_status,
    ship: o.shipping_status,
    address: formatAddress(o.shipping_address),
    itemsLabel: (o.order_items || []).map((it) => `${it.products?.name || 'Item'} ×${it.quantity}`).join(', ') || '—',
  }))
}

async function loadAiConfigs() {
  const { data, error } = await supabase
    .from('module_ai_config')
    .select('module_id, persona_name, system_prompt, model, daily_quota, modules(slug)')
  if (error) throw error
  const dict = {}
  for (const row of data) {
    if (!row.modules) continue
    dict[row.modules.slug] = {
      moduleId: row.module_id,
      persona: row.persona_name,
      prompt: row.system_prompt,
      model: row.model,
      quota: row.daily_quota,
    }
  }
  return dict
}

// PRD §6 issue #4: the Gemini API key is stored encrypted server-side
// (admin_settings, no client-side RLS policy at all — by design, only an
// Edge Function with the service role can read/write it). This UI can only
// mark a key as "saved"; actually persisting it needs that Edge Function,
// which hasn't been built yet.
const MASKED_KEY_PLACEHOLDER = '••••••••••••••••••••••••••••'

export function AdminProvider({ children }) {
  const moduleTreeStore = useModuleTree()
  const { moduleTree } = moduleTreeStore

  const [admins, setAdmins] = useState([])
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [codes, setCodes] = useState([])
  const [codesLoading, setCodesLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [grammarTopics, setGrammarTopics] = useState([])
  const [grammarTopicsLoading, setGrammarTopicsLoading] = useState(true)
  const [aiConfigs, setAiConfigs] = useState({})
  const [aiConfigsLoading, setAiConfigsLoading] = useState(true)
  // Write-only setting — the client can't tell whether a key is already stored,
  // so this only turns true after a successful save in this session.
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  function showToast(message) {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  const refreshGrammarTopics = useCallback(async () => {
    const topics = await loadGrammarTopics()
    setGrammarTopics(topics)
    return topics
  }, [])

  const refreshAdmins = useCallback(async () => {
    const list = await loadAdmins()
    setAdmins(list)
    return list
  }, [])

  const refreshProducts = useCallback(async () => {
    const list = await loadProducts()
    setProducts(list)
    return list
  }, [])

  const refreshCodes = useCallback(async () => {
    const list = await loadCodes()
    setCodes(list)
    return list
  }, [])

  const refreshOrders = useCallback(async () => {
    const list = await loadOrders()
    setOrders(list)
    return list
  }, [])

  const refreshAiConfigs = useCallback(async () => {
    const dict = await loadAiConfigs()
    setAiConfigs(dict)
    return dict
  }, [])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      loadGrammarTopics().then((v) => active && setGrammarTopics(v)),
      loadAdmins().then((v) => active && setAdmins(v)),
      loadProducts().then((v) => active && setProducts(v)),
      loadCodes().then((v) => active && setCodes(v)),
      loadOrders().then((v) => active && setOrders(v)),
      loadAiConfigs().then((v) => active && setAiConfigs(v)),
    ]).then((results) => {
      results.forEach((r) => {
        if (r.status === 'rejected') console.error('Admin data load failed', r.reason)
      })
      if (!active) return
      setGrammarTopicsLoading(false)
      setAdminsLoading(false)
      setProductsLoading(false)
      setCodesLoading(false)
      setOrdersLoading(false)
      setAiConfigsLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  // Adding an email here only affects future sign-ups (handle_new_user grants
  // 'admin' role at signup time by checking this table) — it does not
  // retroactively promote someone who already has an account.
  async function addAdmin(email) {
    const clean = email.trim().toLowerCase()
    if (!clean) return
    try {
      const { error } = await supabase.from('admin_allowlist').insert({ email: clean })
      if (error) throw error
      await refreshAdmins()
      showToast('Admin added — takes effect when they next sign up.')
    } catch (err) {
      showToast(err.message || 'Could not add admin.')
    }
  }

  async function removeAdmin(email) {
    try {
      const { error } = await supabase.from('admin_allowlist').delete().eq('email', email)
      if (error) throw error
      await refreshAdmins()
      showToast('Admin removed.')
    } catch (err) {
      showToast(err.message || 'Could not remove admin.')
    }
  }

  // Delegated to ModuleTreeContext (real Supabase tables) so admin edits are
  // immediately visible in the student-facing Audio Library, which reads
  // from the same shared store.
  async function addUnit(moduleDbId) {
    try {
      await moduleTreeStore.addUnit(moduleDbId)
      showToast('New unit added.')
    } catch (err) {
      showToast(err.message || 'Could not add unit.')
    }
  }

  // Products and codes point at the module, so their lists are refreshed too.
  // Returns true on success so the caller can navigate away from the
  // now-deleted module's page.
  async function removeModule(moduleDbId) {
    try {
      await moduleTreeStore.removeModule(moduleDbId)
      await Promise.all([refreshProducts(), refreshCodes(), refreshAiConfigs()])
      showToast('Module deleted.')
      return true
    } catch (err) {
      showToast(err.message || 'Could not delete module.')
      return false
    }
  }

  // Deleting a product also removes its module (Manage Materials entry) —
  // unless another product still points at the same module, in which case
  // the module stays. The product goes first because it references the module.
  async function deleteProduct(productId) {
    const product = products.find((p) => p.id === productId)
    try {
      const { data, error } = await supabase.from('products').delete().eq('id', productId).select('id')
      if (error) throw error
      if (!data?.length) throw new Error('Product was not deleted — check your permissions.')
    } catch (err) {
      showToast(err.message || 'Could not delete product.')
      return false
    }

    let message = 'Product deleted.'
    const moduleDbId = product?.moduleId
    const sharedWithOthers = moduleDbId && products.some((p) => p.id !== productId && p.moduleId === moduleDbId)
    if (moduleDbId && !sharedWithOthers) {
      try {
        await moduleTreeStore.removeModule(moduleDbId)
        message = 'Product and its module deleted.'
      } catch (err) {
        message = `Product deleted, but its module could not be removed: ${err.message}`
      }
    }
    await Promise.all([refreshProducts(), refreshCodes(), refreshAiConfigs()])
    showToast(message)
    return true
  }

  async function addAudio(unitId, track) {
    try {
      await moduleTreeStore.addAudio(unitId, track)
      showToast(`"${track.titleEn}" added.`)
    } catch (err) {
      showToast(err.message || 'Could not add audio.')
    }
  }

  async function updateUnitTitle(unitId, title) {
    try {
      await moduleTreeStore.updateUnitTitle(unitId, title)
      showToast('Unit renamed.')
    } catch (err) {
      showToast(err.message || 'Could not rename unit.')
    }
  }

  async function removeUnit(unitId) {
    try {
      await moduleTreeStore.removeUnit(unitId)
      showToast('Unit removed.')
    } catch (err) {
      showToast(err.message || 'Could not remove unit.')
    }
  }

  async function updateTrack(trackId, track) {
    try {
      await moduleTreeStore.updateTrack(trackId, track)
      showToast('Dialogue track updated.')
    } catch (err) {
      showToast(err.message || 'Could not update track.')
    }
  }

  async function removeTrack(trackId) {
    try {
      await moduleTreeStore.removeTrack(trackId)
      showToast('Dialogue track removed.')
    } catch (err) {
      showToast(err.message || 'Could not remove track.')
    }
  }

  async function addGrammarTopic(titleEn) {
    if (!titleEn.trim()) return
    try {
      const { data: existing } = await supabase.from('grammar_topics').select('id')
      const { error } = await supabase
        .from('grammar_topics')
        .insert({ title_en: titleEn.trim(), order_index: existing?.length || 0 })
      if (error) throw error
      await refreshGrammarTopics()
      showToast('New Grammar topic added.')
    } catch (err) {
      showToast(err.message || 'Could not add topic.')
    }
  }

  async function updateGrammarTopicTitle(topicId, titleEn) {
    try {
      const { error } = await supabase.from('grammar_topics').update({ title_en: titleEn }).eq('id', topicId)
      if (error) throw error
      await refreshGrammarTopics()
      showToast('Topic renamed.')
    } catch (err) {
      showToast(err.message || 'Could not rename topic.')
    }
  }

  async function removeGrammarTopic(topicId) {
    try {
      const { error } = await supabase.from('grammar_topics').delete().eq('id', topicId)
      if (error) throw error
      await refreshGrammarTopics()
      showToast('Topic removed.')
    } catch (err) {
      showToast(err.message || 'Could not remove topic.')
    }
  }

  async function setTopicVideo(topicId, url) {
    try {
      const { error } = await supabase.from('grammar_topics').update({ video_r2_key: url }).eq('id', topicId)
      if (error) throw error
      await refreshGrammarTopics()
      showToast('Lesson video URL saved.')
    } catch (err) {
      showToast(err.message || 'Could not save video URL.')
    }
  }

  async function addQuizQuestion(topicId, type, question) {
    try {
      const { data: existing } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('topic_id', topicId)
        .eq('type', type)
      const { error } = await supabase
        .from('quiz_questions')
        .insert({ topic_id: topicId, type, payload_json: question, order_index: existing?.length || 0 })
      if (error) throw error
      await refreshGrammarTopics()
      showToast('Quiz question added.')
    } catch (err) {
      showToast(err.message || 'Could not add quiz question.')
    }
  }

  async function removeQuizQuestion(questionId) {
    try {
      const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId)
      if (error) throw error
      await refreshGrammarTopics()
      showToast('Quiz question removed.')
    } catch (err) {
      showToast(err.message || 'Could not remove quiz question.')
    }
  }

  // Every product must link to a real module in Manage Materials (moduleTree
  // or the Grammar module) — free text here would let Products and Materials
  // drift apart with nothing to actually deliver on activation.
  // Every new product gets its own brand-new module (rather than reusing an
  // existing one) so it immediately has a home in Manage Materials and shows
  // up as a choice in Activation codes — a product with no matching module
  // has nothing for a customer to actually unlock.
  async function addProduct() {
    try {
      const name = 'New product'
      const newModule = await moduleTreeStore.addModule(name)
      const { error } = await supabase
        .from('products')
        .insert({ name, module_id: newModule.id, price: 0, stock: 0, on_sale: false, is_active: false })
      if (error) throw error
      await refreshProducts()
      showToast('Product created — a matching module was also added to Manage Materials.')
    } catch (err) {
      showToast(err.message || 'Could not create product.')
    }
  }

  async function updateProduct(productId, patch) {
    try {
      const dbPatch = {}
      if (patch.name !== undefined) dbPatch.name = patch.name
      if (patch.description !== undefined) dbPatch.description = patch.description
      if (patch.price !== undefined) dbPatch.price = patch.price
      if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl
      if (patch.imageUrls !== undefined) dbPatch.image_urls = patch.imageUrls
      if (patch.moduleId !== undefined) dbPatch.module_id = patch.moduleId
      if (patch.stock !== undefined) dbPatch.stock = patch.stock
      if (patch.onSale !== undefined) dbPatch.on_sale = patch.onSale
      if (patch.active !== undefined) dbPatch.is_active = patch.active
      const { error } = await supabase.from('products').update(dbPatch).eq('id', productId)
      if (error) throw error
      await refreshProducts()
    } catch (err) {
      showToast(err.message || 'Could not update product.')
    }
  }

  // Every copy of a given module's physical book shares the SAME activation
  // code (not one code per copy) — so there's exactly one code per module,
  // reused by every buyer. Regenerating replaces that module's code outright
  // (old code stops working immediately), which is only meant for when a
  // code has leaked.
  async function setModuleCode(moduleDbId) {
    try {
      const { error } = await supabase.rpc('set_module_code', { p_module_id: moduleDbId })
      if (error) throw error
      await refreshCodes()
      showToast('Code generated.')
    } catch (err) {
      showToast(err.message || 'Could not generate code.')
    }
  }

  async function toggleCode(codeId, currentStatus) {
    try {
      const nextStatus = currentStatus === 'active' ? 'disabled' : 'active'
      const { error } = await supabase.from('module_codes').update({ status: nextStatus }).eq('id', codeId)
      if (error) throw error
      await refreshCodes()
    } catch (err) {
      showToast(err.message || 'Could not update code status.')
    }
  }

  function exportCodesCsv() {
    const header = 'code,module,batch,activated_count,status'
    const rows = codes.map((c) => `${c.code},"${c.module}",${c.batch},${c.activatedCount},${c.status}`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'activation-codes.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Codes exported as CSV.')
  }

  async function updateOrderShipping(orderId, shippingStatus) {
    try {
      const { error } = await supabase.from('orders').update({ shipping_status: shippingStatus }).eq('id', orderId)
      if (error) throw error
      await refreshOrders()
    } catch (err) {
      showToast(err.message || 'Could not update shipping status.')
    }
  }

  function saveAiConfig(moduleSlug, patch) {
    setAiConfigs((prev) => ({ ...prev, [moduleSlug]: { ...prev[moduleSlug], ...patch } }))
  }

  async function confirmSaveAiConfig(moduleSlug) {
    const config = aiConfigs[moduleSlug]
    if (!config?.moduleId) return
    try {
      const { error } = await supabase
        .from('module_ai_config')
        .update({
          persona_name: config.persona,
          system_prompt: config.prompt,
          model: config.model,
          daily_quota: config.quota,
        })
        .eq('module_id', config.moduleId)
      if (error) throw error
      await refreshAiConfigs()
      showToast(`Configuration saved for ${config.persona}.`)
    } catch (err) {
      showToast(err.message || 'Could not save configuration.')
    }
  }

  // The key goes straight to the save-admin-settings Edge Function (admin-only,
  // service role). It is write-only: nothing ever reads the value back.
  async function saveApiKey(value) {
    try {
      const { error } = await supabase.functions.invoke('save-admin-settings', {
        body: { key: 'gemini_api_key', value },
      })
      if (error) {
        const code = await functionErrorCode(error)
        throw new Error(code === 'not_authorized' ? 'Only admins can save the API key.' : 'Could not save the API key.')
      }
      setApiKeySaved(true)
      showToast('Gemini API key saved.')
      return true
    } catch (err) {
      showToast(err.message || 'Could not save the API key.')
      return false
    }
  }

  const value = useMemo(
    () => ({
      admins,
      adminsLoading,
      addAdmin,
      removeAdmin,
      moduleTree,
      moduleTreeLoading: moduleTreeStore.loading,
      removeModule,
      deleteProduct,
      addUnit,
      addAudio,
      updateUnitTitle,
      removeUnit,
      updateTrack,
      removeTrack,
      grammarTopics,
      grammarTopicsLoading,
      addGrammarTopic,
      updateGrammarTopicTitle,
      removeGrammarTopic,
      setTopicVideo,
      addQuizQuestion,
      removeQuizQuestion,
      products,
      productsLoading,
      addProduct,
      updateProduct,
      codes,
      codesLoading,
      setModuleCode,
      toggleCode,
      exportCodesCsv,
      orders,
      ordersLoading,
      updateOrderShipping,
      aiConfigs,
      aiConfigsLoading,
      saveAiConfig,
      confirmSaveAiConfig,
      apiKeySaved,
      setApiKeySaved,
      saveApiKey,
      maskedKeyPlaceholder: MASKED_KEY_PLACEHOLDER,
      toast,
      showToast,
    }),
    [
      admins,
      adminsLoading,
      moduleTree,
      moduleTreeStore.loading,
      grammarTopics,
      grammarTopicsLoading,
      products,
      productsLoading,
      codes,
      codesLoading,
      orders,
      ordersLoading,
      aiConfigs,
      aiConfigsLoading,
      apiKeySaved,
      toast,
    ],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
