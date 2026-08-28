/**
 * Calls Google AI Studio (Gemini) API for Arabic correction.
 * Requires API key in localStorage: eduarabic_gai_key
 */
const STORAGE_KEY = 'eduarabic_gai_key'

export function getApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setApiKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key)
  } catch { /* ignore */ }
}

export async function sendToGemini(message, model = 'gemini-2.5-flash') {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No API key configured')

  const systemPrompt = `You are AI Ustaz, a patient and knowledgeable Arabic teacher. When the user writes an Arabic sentence, check it for grammar (nahw), morphology (sarf), and spelling errors. Always respond in JSON format with this exact structure:
{
  "reply": "A friendly response acknowledging the user's attempt",
  "asal": "The original Arabic sentence the user wrote (or empty if it's a question)",
  "betul": "The corrected Arabic sentence (or empty if no correction needed)",
  "penjelasan": "Explanation of the correction in English (or empty if no correction needed)"
}
If the user is asking a question (not submitting an Arabic sentence to check), just reply normally with reply field and empty asal/betul/penjelasan fields.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Try to parse structured JSON from response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch { /* not JSON */ }

  // Fallback: return plain text reply
  return { reply: text, asal: '', betul: '', penjelasan: '' }
}
