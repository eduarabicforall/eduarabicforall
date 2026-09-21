// supabase.functions.invoke() reports a non-2xx reply as an error whose
// `context` is the raw Response — the function's own { error: "code" } JSON
// has to be read from it. Returns that code (e.g. "quota_exceeded"), or
// "unknown" if there isn't one.
export async function functionErrorCode(error) {
  try {
    const body = await error?.context?.json?.()
    return body?.error || 'unknown'
  } catch {
    return 'unknown'
  }
}
