import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import BottomTabBar from '../components/BottomTabBar.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { fetchCompletedTopicIds, getTopicStatuses } from '../lib/progress.js'

export default function Grammar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rawTopics, setRawTopics] = useState(null)
  const [doneIds, setDoneIds] = useState([])

  useEffect(() => {
    supabase
      .from('grammar_topics')
      .select('id, title_en')
      .order('order_index')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load grammar topics', error)
          setRawTopics([])
          return
        }
        setRawTopics(data.map((t) => ({ id: t.id, titleEn: t.title_en })))
      })
  }, [])

  useEffect(() => {
    if (!user?.id) return
    fetchCompletedTopicIds(user.id).then(setDoneIds)
  }, [user?.id])

  if (rawTopics === null) {
    return (
      <AppShell>
        <div className="p-5 text-sm text-app-inkFaint">Loading…</div>
        <BottomTabBar />
      </AppShell>
    )
  }

  const topics = getTopicStatuses(rawTopics, doneIds)

  return (
    <AppShell>
      <div
        className="px-5 pb-4 pt-5.5 pt-[22px]"
        style={{ background: 'linear-gradient(180deg, rgba(198,148,67,.10), transparent)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-gold/[.18]">
              <Icon name="mortarboard-01" size={19} className="text-gold" />
            </div>
            <div className="font-sora text-[17px] font-extrabold">Grammar module</div>
          </div>
          <div className="rounded-pill border border-gold/30 bg-gold/[.16] px-2.5 py-1 text-[11px] font-extrabold text-gold">
            FREE
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.locked}
            onClick={() => navigate(`/grammar/${t.id}`)}
            className={`mb-2.5 flex w-full items-center gap-3 rounded-2xl border border-app-border bg-app-panel p-3.5 text-left ${
              t.locked ? 'opacity-50' : ''
            }`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] bg-gold/[.1]">
              <Icon name="book-02" size={18} className="text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold">{t.titleEn}</div>
            </div>
            {t.done && <Icon name="checkmark-circle-02" size={18} className="text-primary" />}
            {!t.done && <Icon name="arrow-right-01" size={16} className="text-app-inkFaint" />}
          </button>
        ))}
      </div>

      <BottomTabBar />
    </AppShell>
  )
}
