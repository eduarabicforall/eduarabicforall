import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { recordQuizAttempt } from '../lib/progress.js'

const QUIZ_TYPE_META = {
  mcq: { title: 'Multiple choice', icon: 'checkmark-square-01' },
  order: { title: 'Arrange the words', icon: 'text-align-left-01' },
  tf: { title: 'True & False', icon: 'tick-double-02' },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function GrammarTopic() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [topic, setTopic] = useState(null)
  const [questions, setQuestions] = useState(null)

  const [view, setView] = useState('lesson') // lesson | quiz | result
  const [activeType, setActiveType] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [mcqSelected, setMcqSelected] = useState(null)
  const [tfAnswer, setTfAnswer] = useState(null)
  const [orderChosen, setOrderChosen] = useState([])
  const [orderShuffled, setOrderShuffled] = useState([])
  const [finalScore, setFinalScore] = useState(null)

  useEffect(() => {
    supabase
      .from('grammar_topics')
      .select('id, title_en, description, video_r2_key')
      .eq('id', topicId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load topic', error)
          return
        }
        setTopic(data)
      })

    supabase
      .from('quiz_questions')
      .select('id, type, payload_json, order_index')
      .eq('topic_id', topicId)
      .order('order_index')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load quiz questions', error)
          setQuestions([])
          return
        }
        setQuestions(data)
      })
  }, [topicId])

  const byType = useMemo(() => {
    const grouped = { mcq: [], order: [], tf: [] }
    for (const q of questions || []) {
      if (grouped[q.type]) grouped[q.type].push(q)
    }
    return grouped
  }, [questions])

  const currentQuestion = activeType ? byType[activeType]?.[qIndex] : null

  function resetQuestionState(question) {
    setAnswered(false)
    setMcqSelected(null)
    setTfAnswer(null)
    setOrderChosen([])
    if (question?.type === 'order') {
      setOrderShuffled(shuffle(question.payload_json.words.map((_, i) => i)))
    } else {
      setOrderShuffled([])
    }
  }

  function openQuiz(type) {
    setActiveType(type)
    setQIndex(0)
    setCorrectCount(0)
    resetQuestionState(byType[type]?.[0])
    setView('quiz')
  }

  function submitMcq(optionIndex) {
    if (answered) return
    setMcqSelected(optionIndex)
    setAnswered(true)
    if (optionIndex === currentQuestion.payload_json.correctIndex) setCorrectCount((c) => c + 1)
  }

  function submitTf(value) {
    if (answered) return
    setTfAnswer(value)
    setAnswered(true)
    if (value === currentQuestion.payload_json.correct) setCorrectCount((c) => c + 1)
  }

  function submitOrder() {
    if (answered) return
    setAnswered(true)
    const isCorrect =
      orderChosen.length === currentQuestion.payload_json.words.length && orderChosen.every((idx, i) => idx === i)
    if (isCorrect) setCorrectCount((c) => c + 1)
  }

  async function nextQuestion() {
    const list = byType[activeType]
    if (qIndex + 1 < list.length) {
      const next = qIndex + 1
      setQIndex(next)
      resetQuestionState(list[next])
      return
    }
    const total = list.length
    const score = total > 0 ? correctCount / total : 0
    setFinalScore({ correct: correctCount, total })
    if (user?.id) {
      try {
        await recordQuizAttempt({ userId: user.id, topicId, score })
      } catch (err) {
        console.error('Failed to record quiz attempt', err)
      }
    }
    setView('result')
  }

  if (!topic || !questions) {
    return (
      <AppShell>
        <div className="p-5 text-sm text-app-inkFaint">Loading…</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {view === 'lesson' && (
        <div>
          <div className="flex items-center gap-3 px-5 pb-1.5 pt-5.5 pt-[22px]">
            <button
              type="button"
              onClick={() => navigate('/grammar')}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
            >
              <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
            </button>
            <div className="font-poppins text-base font-extrabold">{topic.title_en}</div>
          </div>

          <div className="px-5 pb-2 pt-3.5">
            {topic.video_r2_key ? (
              <video controls className="aspect-video w-full rounded-2xl bg-black" src={topic.video_r2_key} />
            ) : (
              <div className="relative flex aspect-video items-center justify-center rounded-2xl bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.06)_0_8px,rgba(255,255,255,.02)_8px_16px)]">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gold/90">
                  <Icon name="play" size={22} className="text-[#241a04]" />
                </div>
                <span className="absolute bottom-2.5 left-3 font-mono text-[10.5px] text-app-inkFaint">
                  lesson video not uploaded yet
                </span>
              </div>
            )}
            <p className="mt-4 text-[13.5px] leading-relaxed text-app-inkSoft">{topic.description}</p>
          </div>

          <div className="px-5 pb-2 pt-5">
            <div className="mb-2.5 text-[12.5px] font-bold tracking-wide text-app-inkSoft">PRACTICE QUIZ</div>
            {Object.entries(QUIZ_TYPE_META).map(([type, meta]) => {
              const count = byType[type].length
              return (
                <button
                  key={type}
                  type="button"
                  disabled={count === 0}
                  onClick={() => openQuiz(type)}
                  className={`mb-2.5 flex w-full items-center gap-3 rounded-2xl border border-app-border bg-app-panel p-3.5 text-left ${
                    count === 0 ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] bg-gold/[.12]">
                    <Icon name={meta.icon} size={18} className="text-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-[13.5px] font-bold">{meta.title}</div>
                    <div className="text-[11.5px] text-app-inkFaint">
                      {count === 0 ? 'No questions yet' : `${count} question${count > 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <Icon name="arrow-right-01" size={17} className="flex-shrink-0 text-app-inkFaint" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {view === 'quiz' && currentQuestion && (
        <div>
          <div className="flex items-center gap-3 px-5 pb-1.5 pt-5.5 pt-[22px]">
            <button
              type="button"
              onClick={() => setView('lesson')}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
            >
              <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
            </button>
            <div className="font-poppins text-base font-extrabold">{QUIZ_TYPE_META[activeType].title}</div>
          </div>

          <div className="px-5 py-2">
            <div className="my-2.5 mb-6 h-1.5 overflow-hidden rounded-full bg-app-panel2">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${((qIndex + 1) / byType[activeType].length) * 100}%` }}
              />
            </div>

            {activeType === 'mcq' && (
              <div>
                <div className="mb-2 text-xs font-bold text-app-inkFaint">
                  QUESTION {qIndex + 1} OF {byType.mcq.length}
                </div>
                <div className="mb-5 text-base font-bold leading-relaxed">{currentQuestion.payload_json.question}</div>
                {currentQuestion.payload_json.options.map((label, i) => {
                  const selected = mcqSelected === i
                  const isCorrectOption = i === currentQuestion.payload_json.correctIndex
                  let stateClass = 'border-app-border bg-app-panel2'
                  if (answered && isCorrectOption) stateClass = 'border-primary/[.35] bg-primary/[.14]'
                  else if (answered && selected) stateClass = 'border-danger/30 bg-danger/[.1]'
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => submitMcq(i)}
                      disabled={answered}
                      className={`mb-2.5 w-full rounded-[13px] border px-4 py-3.5 text-left text-[13.5px] font-semibold ${stateClass}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}

            {activeType === 'order' && (
              <div>
                <div className="mb-2 text-xs font-bold text-app-inkFaint">
                  QUESTION {qIndex + 1} OF {byType.order.length}
                </div>
                <div className="mb-5 text-base font-bold leading-relaxed">{currentQuestion.payload_json.question}</div>
                <div className="mb-4 flex min-h-[56px] flex-wrap gap-2 rounded-[13px] border border-dashed border-app-border bg-app-panel p-3">
                  {orderChosen.map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      dir="rtl"
                      disabled={answered}
                      onClick={() => setOrderChosen((prev) => prev.filter((i) => i !== idx))}
                      className="rounded-[9px] border border-gold/30 bg-gold/[.16] px-3.5 py-2 font-amiri text-base text-gold"
                    >
                      {currentQuestion.payload_json.words[idx]}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {orderShuffled.map((idx) =>
                    orderChosen.includes(idx) ? null : (
                      <button
                        key={idx}
                        type="button"
                        dir="rtl"
                        disabled={answered}
                        onClick={() => setOrderChosen((prev) => [...prev, idx])}
                        className="rounded-[9px] border border-app-border bg-app-panel2 px-3.5 py-2 font-amiri text-base text-app-ink"
                      >
                        {currentQuestion.payload_json.words[idx]}
                      </button>
                    ),
                  )}
                </div>
                {!answered && (
                  <button
                    type="button"
                    onClick={submitOrder}
                    disabled={orderChosen.length !== currentQuestion.payload_json.words.length}
                    className="mt-4 w-full rounded-[13px] bg-gold py-3.5 text-sm font-bold text-[#241a04] disabled:opacity-40"
                  >
                    Check answer
                  </button>
                )}
                {answered && (
                  <div
                    className={`mt-4 rounded-[13px] px-4 py-3 text-center text-sm font-bold ${
                      orderChosen.every((idx, i) => idx === i)
                        ? 'bg-primary/[.14] text-primary'
                        : 'bg-danger/[.1] text-danger'
                    }`}
                  >
                    {orderChosen.every((idx, i) => idx === i) ? 'Correct!' : 'Not quite — keep practicing.'}
                  </div>
                )}
              </div>
            )}

            {activeType === 'tf' && (
              <div>
                <div className="mb-2 text-xs font-bold text-app-inkFaint">
                  QUESTION {qIndex + 1} OF {byType.tf.length}
                </div>
                <div className="mb-6 text-base font-bold leading-relaxed">{currentQuestion.payload_json.statement}</div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => submitTf(true)}
                    className={`flex-1 rounded-[13px] border px-4 py-4 text-sm font-bold ${
                      answered && currentQuestion.payload_json.correct === true
                        ? 'border-primary/40 bg-primary/[.18] text-primary'
                        : answered && tfAnswer === true
                          ? 'border-danger/40 bg-danger/[.16] text-danger'
                          : 'border-primary/30 bg-primary/[.12] text-primary'
                    }`}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => submitTf(false)}
                    className={`flex-1 rounded-[13px] border px-4 py-4 text-sm font-bold ${
                      answered && currentQuestion.payload_json.correct === false
                        ? 'border-primary/40 bg-primary/[.18] text-primary'
                        : answered && tfAnswer === false
                          ? 'border-danger/40 bg-danger/[.16] text-danger'
                          : 'border-danger/30 bg-danger/[.1] text-danger'
                    }`}
                  >
                    False
                  </button>
                </div>
              </div>
            )}

            {answered && activeType !== 'order' && (
              <button
                type="button"
                onClick={nextQuestion}
                className="mt-7 w-full rounded-[13px] bg-gold py-[15px] text-[15px] font-bold text-[#241a04]"
              >
                {qIndex + 1 < byType[activeType].length ? 'Next question' : 'Finish quiz'}
              </button>
            )}
            {answered && activeType === 'order' && (
              <button
                type="button"
                onClick={nextQuestion}
                className="mt-3.5 w-full rounded-[13px] border border-app-border py-[15px] text-[15px] font-bold text-app-ink"
              >
                {qIndex + 1 < byType[activeType].length ? 'Next question' : 'Finish quiz'}
              </button>
            )}
          </div>
        </div>
      )}

      {view === 'result' && (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4.5 mb-[18px] flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[.18]">
            <Icon name="checkmark-circle-02" size={26} className="text-primary" />
          </div>
          <div className="mb-2 font-poppins text-[19px] font-extrabold">Quiz complete!</div>
          <div className="mb-6 text-[13px] leading-relaxed text-app-inkSoft">
            You got {finalScore?.correct} out of {finalScore?.total} correct.
          </div>
          <button
            type="button"
            onClick={() => setView('lesson')}
            className="w-full rounded-[13px] bg-primary py-[15px] text-[15px] font-bold text-[#0B2A4A]"
          >
            Back to lesson
          </button>
        </div>
      )}
    </AppShell>
  )
}
