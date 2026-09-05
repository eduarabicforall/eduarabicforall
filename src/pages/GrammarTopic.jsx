import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import SecureVideo from '../components/SecureVideo'
import Button from '../components/ui/Button'
import Icon from '../components/Icon'

function OrderQuestion({ q, answer, onAnswer }) {
  const [pool, setPool] = useState(() => [...q.words].sort(() => Math.random() - 0.5))
  const [chosen, setChosen] = useState(answer ?? [])

  function pick(word, idx) {
    if (answer) return
    const next = [...chosen, word]
    setChosen(next)
    setPool((p) => p.filter((_, i) => i !== idx))
    if (next.length === q.words.length) onAnswer(next)
  }

  return (
    <div>
      <div dir="rtl" className="rtl-ar min-h-[48px] flex flex-wrap gap-2 border border-app-border rounded-xl p-3 mb-3">
        {chosen.map((w, i) => <span key={i} className="bg-app-primary/15 rounded-lg px-2 py-1">{w}</span>)}
      </div>
      <div dir="rtl" className="rtl-ar flex flex-wrap gap-2">
        {pool.map((w, i) => (
          <button key={i} onClick={() => pick(w, i)} className="bg-app-panel2 rounded-lg px-3 py-1.5">{w}</button>
        ))}
      </div>
    </div>
  )
}

export default function GrammarTopic() {
  const { topicId } = useParams()
  const { user } = useAuth()
  const [topic, setTopic] = useState(null)
  const [view, setView] = useState('lesson')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  useEffect(() => {
    supabase.from('grammar_topics').select('*').eq('id', topicId).single().then(({ data }) => setTopic(data))
    supabase.from('quiz_questions').select('*').eq('topic_id', topicId).order('order_index').then(({ data }) => setQuestions(data ?? []))
  }, [topicId])

  function setAnswer(qid, value) {
    setAnswers((a) => ({ ...a, [qid]: value }))
  }

  async function finishQuiz() {
    let correct = 0
    questions.forEach((q) => {
      const a = answers[q.id]
      if (q.type === 'mcq' && a === q.payload_json.correctIndex) correct++
      if (q.type === 'tf' && a === q.payload_json.correct) correct++
      if (q.type === 'order' && JSON.stringify(a) === JSON.stringify(q.payload_json.words)) correct++
    })
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0
    setResult(score)
    if (user) {
      await supabase.from('quiz_attempts').insert({ user_id: user.id, topic_id: topicId, score })
    }
  }

  if (!topic) return null

  return (
    <div className="min-h-screen bg-app-bg px-5 py-6 max-w-lg mx-auto">
      <Link to="/grammar" className="text-app-inkFaint text-sm mb-4 inline-flex items-center gap-1">
        <Icon name="arrow-left-01" size={16} /> Grammar
      </Link>
      <h1 className="font-title font-extrabold text-2xl mb-4">{topic.title_en}</h1>

      {view === 'lesson' && (
        <div className="flex flex-col gap-5">
          <SecureVideo r2Key={topic.video_r2_key} />
          <p className="text-app-inkSoft text-sm">{topic.description}</p>
          <Button onClick={() => setView('quiz')} disabled={questions.length === 0}>
            {questions.length === 0 ? 'No quiz yet for this topic' : 'Start quiz'}
          </Button>
        </div>
      )}

      {view === 'quiz' && result === null && (
        <div className="flex flex-col gap-6">
          <div className="h-1.5 bg-app-panel2 rounded-pill">
            <div className="h-1.5 bg-app-primary rounded-pill" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
          </div>

          {questions.map((q, i) => (
            <div key={q.id} className="bg-app-panel border border-app-border rounded-card p-4">
              <p className="text-xs text-app-inkFaint mb-2">Question {i + 1}</p>

              {q.type === 'mcq' && (
                <>
                  <p className="font-medium mb-3">{q.payload_json.question}</p>
                  <div className="flex flex-col gap-2">
                    {q.payload_json.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswer(q.id, oi)}
                        className={`text-left rounded-xl px-3 py-2 border ${answers[q.id] === oi ? 'bg-app-primary/20 border-app-primary' : 'border-app-border bg-app-panel2'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {q.type === 'tf' && (
                <>
                  <p className="font-medium mb-3">{q.payload_json.statement}</p>
                  <div className="flex gap-3">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        onClick={() => setAnswer(q.id, v)}
                        className={`flex-1 rounded-xl py-2 border ${answers[q.id] === v ? 'bg-app-primary/20 border-app-primary' : 'border-app-border bg-app-panel2'}`}
                      >
                        {v ? 'True' : 'False'}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {q.type === 'order' && (
                <>
                  <p className="font-medium mb-3">{q.payload_json.question}</p>
                  <OrderQuestion q={q.payload_json} answer={answers[q.id]} onAnswer={(v) => setAnswer(q.id, v)} />
                </>
              )}
            </div>
          ))}

          <Button onClick={finishQuiz} disabled={Object.keys(answers).length < questions.length}>Finish quiz</Button>
        </div>
      )}

      {result !== null && (
        <div className="text-center py-10">
          <Icon name="trophy-01" size={48} className="text-app-gold mx-auto mb-3" />
          <p className="font-title font-extrabold text-3xl mb-1">{result}%</p>
          <p className="text-app-inkSoft mb-6">Quiz complete</p>
          <Button onClick={() => { setView('lesson'); setResult(null); setAnswers({}) }}>Back to lesson</Button>
        </div>
      )}
    </div>
  )
}
