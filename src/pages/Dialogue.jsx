import React, { useState } from 'react'
import { MODULES } from '../data/modules'
import Icon from '../components/Icon'

export default function Dialogue() {
  const [selectedModule, setSelectedModule] = useState(MODULES[0])
  const [selectedUnit, setSelectedUnit] = useState(selectedModule.units[0])
  const [activeDialogue, setActiveDialogue] = useState(null)

  const handleModuleChange = (mod) => {
    setSelectedModule(mod)
    setSelectedUnit(mod.units[0])
    setActiveDialogue(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-sora font-bold text-ink mb-1 flex items-center gap-2">
          <span className="text-violet-400"><Icon name="headphones" size={28} /></span>
          Voice Dialogue
        </h1>
        <p className="text-sm text-ink-faint">Listen to and practise real Arabic conversations from your module</p>
      </div>

      {/* Module selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Unit list (sidebar) */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon name="list-03" size={12} /> Units
          </h3>
          {selectedModule.units.map((unit) => (
            <button
              key={unit.id}
              onClick={() => { setSelectedUnit(unit); setActiveDialogue(null) }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                selectedUnit.id === unit.id
                  ? 'bg-primary/15 border border-primary/30 text-primary'
                  : 'bg-panel border border-ea-border text-ink-soft hover:text-ink hover:bg-white/5'
              }`}
            >
              <div className="font-medium">{unit.title}</div>
              <div className="text-xs text-ink-faint mt-0.5" dir="rtl">{unit.titleAr}</div>
            </button>
          ))}
        </div>

        {/* Dialogue content */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-ink flex items-center gap-2">
            <Icon name="chat-message-01" size={18} className="text-ink-faint" />
            {selectedUnit.title}
          </h3>

          {selectedUnit.dialogues.map((dialogue, idx) => (
            <div
              key={dialogue.id}
              className="bg-panel border border-ea-border rounded-2xl p-5 space-y-4"
            >
              {/* Dialogue number */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-faint flex items-center gap-1.5">
                  <Icon name="play-circle" size={14} /> Dialogue {idx + 1}
                </span>
                <button
                  onClick={() => setActiveDialogue(activeDialogue === dialogue.id ? null : dialogue.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                >
                  <Icon name={activeDialogue === dialogue.id ? 'eye-off-01' : 'eye-01'} size={14} />
                  {activeDialogue === dialogue.id ? 'Hide' : 'Translate'}
                </button>
              </div>

              {/* Speaker A */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon name="user" size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-ink-faint mb-1">{dialogue.speakerA.name}</div>
                  <div className="text-lg leading-relaxed" dir="rtl">
                    {dialogue.speakerA.text}
                  </div>
                  {activeDialogue === dialogue.id && (
                    <div className="text-xs text-ink-soft mt-1 italic">{dialogue.speakerA.translation}</div>
                  )}
                </div>
              </div>

              {/* Speaker B */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon name="user" size={16} className="text-violet-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-ink-faint mb-1">{dialogue.speakerB.name}</div>
                  <div className="text-lg leading-relaxed" dir="rtl">
                    {dialogue.speakerB.text}
                  </div>
                  {activeDialogue === dialogue.id && (
                    <div className="text-xs text-ink-soft mt-1 italic">{dialogue.speakerB.translation}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {selectedUnit.dialogues.length === 0 && (
            <div className="text-center py-12 text-ink-faint text-sm flex flex-col items-center gap-2">
              <Icon name="chat-remove-01" size={32} />
              No dialogues yet for this unit.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
