// The Ustaz answers word lookups in a fixed plain-text layout (see the
// guardrails in supabase/functions/ai-ustaz-chat):
//
//   Topik: …
//   Perkataan yang ditanya: …
//   Tulisan Arab: …
//   Transliterasi: …
//   Terjemahan: …
//
//   Contoh dialog:
//   A: <Arabic>
//   (Transliterasi — Maksud)
//
// parseUstazReply() finds the saveable pieces and attaches each to the line it
// belongs to, so the chat can put a save button right beside it.

const field = (line, label) => {
  const m = line.match(new RegExp(`^\\s*${label}\\s*:\\s*(.+?)\\s*$`, 'i'))
  return m ? m[1] : null
}

// "(Transliterasi — Maksud)" -> { transliteration, translation }
function parseGloss(line) {
  const m = line?.match(/^\s*\((.+)\)\s*$/)
  if (!m) return null
  const [transliteration, ...rest] = m[1].split(/\s+[—–-]\s+/)
  return { transliteration: transliteration.trim(), translation: rest.join(' — ').trim() }
}

const hasArabic = (text) => /[؀-ۿ]/.test(text)

// Returns { [lineIndex]: item } where item = { kind, arabic, transliteration, translation, topic }
export function parseUstazReply(text) {
  const lines = text.split('\n')
  const actions = {}

  let topic = ''
  let asked = ''
  let arabic = ''
  let transliteration = ''
  let translation = ''
  let translationLine = -1

  lines.forEach((line, i) => {
    topic = field(line, 'Topik') ?? topic
    asked = field(line, 'Perkataan yang ditanya') ?? asked
    arabic = field(line, 'Tulisan Arab') ?? arabic
    transliteration = field(line, 'Transliterasi') ?? transliteration
    const t = field(line, 'Terjemahan')
    if (t) {
      translation = t
      translationLine = i
    }
  })

  if (arabic && hasArabic(arabic) && translationLine >= 0) {
    actions[translationLine] = { kind: 'word', arabic, transliteration, translation, topic }
  }

  lines.forEach((line, i) => {
    const m = line.match(/^\s*[A-Z]\s*:\s*(.+?)\s*$/)
    if (!m || !hasArabic(m[1])) return
    const gloss = parseGloss(lines[i + 1]) || { transliteration: '', translation: '' }
    actions[i] = { kind: 'sentence', arabic: m[1], ...gloss, topic }
  })

  return actions
}
