import React, { useState } from 'react'
import { MODULES } from '../data/modules'

export default function Practice() {
  const [selectedModule, setSelectedModule] = useState(MODULES[0])
  const [selectedUnit, setSelectedUnit] = useState(selectedModule.units[0])
  const [revealed, setRevealed] = useState(new Set())
  const [mastered, setMastered] = useState(new Set())

  const handleModuleChange = (mod) => {
    setSelectedModule(mod)
    setSelectedUnit(mod.units[0])
    setRevealed(new Set())
    setMastered(new Set())
  }

  const toggleReveal = (id) => {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleMastered = (id, e) => {
    e.stopPropagation()
    setMastered(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exercises = selectedUnit.pronunciation || []
  const totalWords = exercises.length
  const masteredCount = exercises.filter(p => mastered.has(p.id)).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-sora font-bold text-ink mb-1">📝 Pronunciation Practice</h1>
        <p className="text-sm text-ink-faint">Tap each word to reveal transliteration and meaning</p>
      </div>

      {/* Module selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {MODULES.map(mod => (
          <button
            key={mod.id}
            onClick={() => handleModuleChange(mod)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedModule.id === mod.id
                ? 'bg-primary text-bg'
                : 'bg-panel border border-ea-border text-ink-soft hover:text-ink hover:border-primary/30'
            }`}
          >
            {mod.title}
          </button>
        ))}
      </div>

      {/* Unit selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {selectedModule.units.map(unit => (
          <button
            key={unit.id}
            onClick={() => { setSelectedUnit(unit); setRevealed(new Set()); setMastered(new Set()) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedUnit.id === unit.id
                ? 'bg-panel-2 text-ink border border-ea-border'
                : 'text-ink-faint hover:text-ink hover:bg-white/5'
            }`}
          >
            {unit.title}
          </button>
        ))}
      </div>

      {/* Progress */}
      {totalWords > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-ink-faint mb-2">
            <span>{masteredCount} / {totalWords} mastered</span>
            <span>{Math.round((masteredCount / totalWords) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-panel rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(masteredCount / totalWords) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Word cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exercises.map((word) => {
          const isRevealed = revealed.has(word.id)
          const isMastered = mastered.has(word.id)

          return (
            <button
              key={word.id}
              onClick={() => toggleReveal(word.id)}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-300 ${
                isMastered
                  ? 'bg-primary/10 border-primary/30'
                  : isRevealed
                    ? 'bg-panel-2 border-ea-border'
                    : 'bg-panel border-ea-border hover:border-primary/20 hover:bg-white/[0.04]'
              }`}
            >
              {/* Mastered badge */}
              {isMastered && (
                <div className="absolute top-3 right-3 text-xs text-primary">✅</div>
              )}

              {/* Arabic word */}
              <div className="text-2xl font-amiri text-ink mb-3" dir="rtl">
                {word.word}
              </div>

              {/* Revealed info */}
              {isRevealed ? (
                <div className="space-y-2">
                  <div className="text-sm text-primary font-medium">{word.transliteration}</div>
                  <div className="text-sm text-ink-soft">{word.meaning}</div>
                  <div className="text-xs text-ink-faint bg-panel rounded-lg px-3 py-1.5 font-mono">
                    🔊 {word.audioHint}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-ink-faint">Tap to reveal</div>
              )}

              {/* Mark mastered */}
              {isRevealed && (
                <button
                  onClick={(e) => toggleMastered(word.id, e)}
                  className={`mt-3 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isMastered
                      ? 'bg-primary/20 text-primary'
                      : 'bg-white/5 text-ink-faint hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  {isMastered ? '✓ Mastered' : 'Mark as mastered'}
                </button>
              )}
            </button>
          )
        })}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-12 text-ink-faint text-sm">
          No pronunciation exercises yet for this unit.
        </div>
      )}
    </div>
  )
}
