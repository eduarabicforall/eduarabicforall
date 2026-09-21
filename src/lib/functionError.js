// supabase.functions.invoke() reports a non-2xx reply as an error whose
// `context` is the raw Response — the function's own JSON body has to be read
// from it. functionErrorBody returns that body (or null); functionErrorCode
// returns just its { error: "code" }, or "unknown" if there isn't one.
export async function functionErrorBody(error) {
  try {
    return (await error?.context?.json?.()) ?? null
  } catch {
    return null
  }
}

export async function functionErrorCode(error) {
  const body = await functionErrorBody(error)
  return body?.error || 'unknown'
}
