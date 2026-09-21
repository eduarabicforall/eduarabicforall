import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'

const QUIZ_TYPES = [
  { id: 'mcq', label: 'Multiple choice', icon: 'checkmark-square-01' },
  { id: 'order', label: 'Arrange the words', icon: 'text-align-left-01' },
  { id: 'tf', label: 'True & False', icon: 'tick-double-02' },
]

const inputClass =
  'rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[13px] text-app-ink placeholder:text-app-inkFaint'

function McqForm({ onAdd, onCancel }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)

  function submit(e) {
    e.preventDefault()
    if (!question.trim() || options.some((o) => !o.trim())) return
    onAdd({ question, options, correctIndex })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-[11px] border border-gold/[.3] bg-app-panel p-3">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question text"
        className={inputClass}
      />
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={correctIndex === i}
            onChange={() => setCorrectIndex(i)}
            title="Mark as correct answer"
          />
          <input
            value={opt}
            onChange={(e) => setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
            placeholder={`Option ${i + 1}`}
            className={`flex-1 ${inputClass}`}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-gold px-3.5 py-1.5 text-xs font-bold text-[#241a04]">
          Add question
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-app-border px-3.5 py-1.5 text-xs text-app-inkSoft">
          Cancel
        </button>
      </div>
    </form>
  )
}

function OrderForm({ onAdd, onCancel }) {
  const [prompt, setPrompt] = useState('')
  const [wordsText, setWordsText] = useState('')

  function submit(e) {
    e.preventDefault()
    const words = wordsText
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean)
    if (!prompt.trim() || words.length < 2) return
    onAdd({ question: prompt, words })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-[11px] border border-gold/[.3] bg-app-panel p-3">
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder='Instruction — e.g. Build the sentence: "The teacher wrote the lesson."'
        className={inputClass}
      />
      <input
        value={wordsText}
        onChange={(e) => setWordsText(e.target.value)}
        placeholder="Arabic words, comma separated — كَتَبَ, المُعَلِّمُ, الدَّرْسَ"
        dir="rtl"
        className={`font-amiri ${inputClass}`}
      />
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-gold px-3.5 py-1.5 text-xs font-bold text-[#241a04]">
          Add question
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-app-border px-3.5 py-1.5 text-xs text-app-inkSoft">
          Cancel
        </button>
      </div>
    </form>
  )
}

function TfForm({ onAdd, onCancel }) {
  const [statement, setStatement] = useState('')
  const [answer, setAnswer] = useState(true)

  function submit(e) {
    e.preventDefault()
    if (!statement.trim()) return
    onAdd({ statement, correct: answer })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-[11px] border border-gold/[.3] bg-app-panel p-3">
      <input
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="Statement to judge true or false"
        className={inputClass}
      />
      <div className="flex gap-4 text-[12.5px] text-app-inkSoft">
        <label className="flex items-center gap-1.5">
          <input type="radio" name="tf-answer" checked={answer === true} onChange={() => setAnswer(true)} /> True
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" name="tf-answer" checked={answer === false} onChange={() => setAnswer(false)} /> False
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-gold px-3.5 py-1.5 text-xs font-bold text-[#241a04]">
          Add question
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-app-border px-3.5 py-1.5 text-xs text-app-inkSoft">
          Cancel
        </button>
      </div>
    </form>
  )
}

const QUIZ_FORMS = { mcq: McqForm, order: OrderForm, tf: TfForm }

function QuizSection({ topicId, type, label, icon, questions, addQuizQuestion, removeQuizQuestion }) {
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const FormComponent = QUIZ_FORMS[type]

  return (
    <div className="border-t border-app-border pt-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2.5 text-left">
        <Icon name={icon} size={15} className="text-gold" />
        <span className="flex-1 text-[13px] font-semibold">{label}</span>
        <span className="text-xs text-app-inkFaint">{questions.length} questions</span>
        <Icon name="arrow-down-01" size={14} className={`text-app-inkFaint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-2.5 flex flex-col gap-2 pl-6">
          {questions.map((q) => (
            <div key={q.id} className="flex items-start justify-between gap-2 rounded-lg bg-app-panel px-3 py-2 text-xs text-app-inkSoft">
              <span className="flex-1">{q.question || q.statement}</span>
              <button type="button" onClick={() => removeQuizQuestion(q.id)} className="flex-shrink-0 text-danger">
                Remove
              </button>
            </div>
          ))}

          {adding ? (
            <FormComponent
              onAdd={(question) => {
                addQuizQuestion(topicId, type, question)
                setAdding(false)
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="self-start rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft"
            >
              + Add question
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function VideoUrlField({ topic, setTopicVideo }) {
  const [editing, setEditing] = useState(!topic.videoUrl)
  const [url, setUrl] = useState(topic.videoUrl || '')

  function submit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setTopicVideo(topic.id, url.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <form onSubmit={submit} className="mb-3 flex flex-col gap-2 rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-3 sm:flex-row sm:items-center">
        <Icon name="play" size={15} className="flex-shrink-0 text-app-inkSoft" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Embed URL — R2/Worker URL, YouTube, Vimeo, etc."
          className="flex-1 rounded-[9px] border border-app-border bg-app-bg px-2.5 py-1.5 text-[12.5px] text-app-ink placeholder:text-app-inkFaint"
        />
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-[#0B2A4A]">
            Save
          </button>
          {topic.videoUrl && (
            <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft">
              Cancel
            </button>
          )}
        </div>
      </form>
    )
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-3">
      <Icon name="play" size={15} className="text-app-inkSoft" />
      <div className="min-w-[120px] flex-1 truncate text-[12.5px] text-app-ink">{topic.videoUrl}</div>
      <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft">
        Replace URL
      </button>
    </div>
  )
}

function TopicCard({ topic, setTopicVideo, addQuizQuestion, removeQuizQuestion, updateGrammarTopicTitle, removeGrammarTopic }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(topic.titleEn)
  const [open, setOpen] = useState(false)

  function saveTitle() {
    if (titleDraft.trim()) updateGrammarTopicTitle(topic.id, titleDraft.trim())
    setEditingTitle(false)
  }

  return (
    <div className="rounded-[14px] border border-app-border bg-app-panel p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Icon name="book-02" size={16} className="flex-shrink-0 text-gold" />

        {editingTitle ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveTitle()
            }}
            className="flex min-w-[160px] flex-1 items-center gap-1.5"
          >
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="w-full rounded-lg border border-app-border bg-app-panel2 px-2 py-1 text-[13.5px] text-app-ink"
            />
            <button type="submit" className="text-xs font-bold text-primary">
              Save
            </button>
            <button type="button" onClick={() => setEditingTitle(false)} className="text-xs text-app-inkSoft">
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTitleDraft(topic.titleEn)
              setEditingTitle(true)
            }}
            className="min-w-[120px] flex-1 text-left text-[13.5px] font-bold underline decoration-dotted decoration-app-inkFaint"
          >
            {topic.titleEn}
          </button>
        )}

        <button
          type="button"
          onClick={() => removeGrammarTopic(topic.id)}
          className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs text-danger"
        >
          Remove topic
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse topic' : 'Expand topic'}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-app-border text-app-inkSoft"
        >
          <Icon name="arrow-down-01" size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <>
          <VideoUrlField topic={topic} setTopicVideo={setTopicVideo} />

          <div className="flex flex-col gap-3">
            {QUIZ_TYPES.map((qt) => (
              <QuizSection
                key={qt.id}
                topicId={topic.id}
                type={qt.id}
                label={qt.label}
                icon={qt.icon}
                questions={topic.quizzes[qt.id]}
                addQuizQuestion={addQuizQuestion}
                removeQuizQuestion={removeQuizQuestion}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminGrammarMaterial() {
  const {
    grammarTopics,
    grammarTopicsLoading,
    addGrammarTopic,
    updateGrammarTopicTitle,
    removeGrammarTopic,
    setTopicVideo,
    addQuizQuestion,
    removeQuizQuestion,
  } = useAdmin()
  const [newTopicTitle, setNewTopicTitle] = useState('')

  function handleAddTopic(e) {
    e.preventDefault()
    addGrammarTopic(newTopicTitle)
    setNewTopicTitle('')
  }

  if (grammarTopicsLoading) {
    return <div className="text-sm text-app-inkFaint">Loading materials…</div>
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 text-xs font-bold tracking-wide text-app-inkFaint">MANAGE MATERIALS</div>
          <h1 className="flex items-center gap-2.5 font-sora text-2xl font-extrabold">
            Grammar module
            <span className="rounded-pill bg-gold/[.16] px-2.5 py-1 text-[11px] font-extrabold text-gold">FREE</span>
          </h1>
        </div>
        <form onSubmit={handleAddTopic} className="flex gap-2">
          <input
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            placeholder="New topic title"
            className="rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink placeholder:text-app-inkFaint"
          />
          <button type="submit" className="self-start rounded-[11px] bg-primary px-4.5 px-[18px] py-2.5 text-[13.5px] font-bold text-[#0B2A4A]">
            + Add topic
          </button>
        </form>
      </div>
      <div className="mb-5.5 mb-[22px] text-[12.5px] text-app-inkFaint">
        {grammarTopics.length} topics — each with a lesson video and practice quizzes, not audio units.
      </div>

      <div className="flex flex-col gap-3">
        {grammarTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            setTopicVideo={setTopicVideo}
            addQuizQuestion={addQuizQuestion}
            removeQuizQuestion={removeQuizQuestion}
            updateGrammarTopicTitle={updateGrammarTopicTitle}
            removeGrammarTopic={removeGrammarTopic}
          />
        ))}
      </div>
    </div>
  )
}
