import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import BottomTabBar from '../components/layout/BottomTabBar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Icon from '../components/Icon'

export default function Grammar() {
  const { user } = useAuth()
  const [topics, setTopics] = useState([])
  const [doneTopicIds, setDoneTopicIds] = useState(new Set())

  useEffect(() => {
    async function load() {
      const { data: topicList } = await supabase.from('grammar_topics').select('*').order('order_index')
      setTopics(topicList ?? [])
      if (user) {
        const { data: attempts } = await supabase.from('quiz_attempts').select('topic_id').eq('user_id', user.id)
        setDoneTopicIds(new Set((attempts ?? []).map((a) => a.topic_id)))
      }
    }
    load()
  }, [user])

  return (
    <div className="app-frame">
      <header className="px-5 pt-6 pb-4 border-b border-app-gold/20">
        <Badge tone="gold" className="mb-2">FREE</Badge>
        <h1 className="font-title font-extrabold text-2xl">Grammar</h1>
        <p className="text-app-inkSoft text-sm">All topics unlocked — free for every account.</p>
      </header>

      <main className="flex-1 px-5 py-4 flex flex-col gap-2 overflow-y-auto">
        {topics.map((t) => {
          const done = doneTopicIds.has(t.id)
          return (
            <Link key={t.id} to={`/grammar/${t.id}`}>
              <Card className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t.title_en}</p>
                  {t.description && <p className="text-xs text-app-inkSoft mt-0.5">{t.description}</p>}
                </div>
                <Icon name={done ? 'checkmark-circle-02' : 'arrow-right-01'} className={done ? 'text-app-primary' : 'text-app-inkFaint'} />
              </Card>
            </Link>
          )
        })}
      </main>

      <BottomTabBar />
    </div>
  )
}
