import { supabase } from './supabase.js'

export async function fetchCompletedTopicIds(userId) {
  const { data, error } = await supabase.from('quiz_attempts').select('topic_id').eq('user_id', userId)
  if (error) {
    console.error('Failed to load quiz progress', error)
    return []
  }
  return [...new Set(data.map((row) => row.topic_id))]
}

export async function recordQuizAttempt({ userId, topicId, score }) {
  const { error } = await supabase.from('quiz_attempts').insert({ user_id: userId, topic_id: topicId, score })
  if (error) throw error
}

/** A topic unlocks once the previous topic in the list is complete; the first topic is always unlocked. */
export function getTopicStatuses(topics, doneTopicIds) {
  return topics.map((topic, i) => {
    const isDone = doneTopicIds.includes(topic.id)
    const isLocked = i > 0 && !doneTopicIds.includes(topics[i - 1].id)
    return { ...topic, done: isDone, locked: !isDone && isLocked }
  })
}
