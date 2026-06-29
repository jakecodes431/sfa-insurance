/**
 * respond.ts — the assistant's answer engine.
 *
 * Today it runs a fully-local intent match over the SFA knowledge base (knowledge.ts),
 * so the chat works offline in the demo with zero credentials. If VITE_CHAT_ENDPOINT is
 * set at go-live, it POSTs the conversation there instead (an Edge Function that calls
 * Claude with the same KB as context) and falls back to the local answer on any error.
 */
import { KB, FALLBACK } from './knowledge';

export type ChatRole = 'user' | 'bot';
export interface ChatMessage {
  role: ChatRole;
  text: string;
}

/** Local intent match: score each KB entry by how many of its terms appear. */
export function localAnswer(input: string): string {
  const q = ' ' + input.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  let best: string | null = null;
  let bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const k of entry.keywords) {
      const term = k.trim();
      if (!term) continue;
      if (q.includes(' ' + term + ' ')) score += term.includes(' ') ? 3 : 2;
      else if (q.includes(term)) score += term.includes(' ') ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry.answer;
    }
  }
  return bestScore > 0 && best ? best : FALLBACK;
}

const CHAT_ENDPOINT = (import.meta.env.VITE_CHAT_ENDPOINT as string | undefined) ?? '';

/**
 * Get an answer for the latest user message. Uses the remote AI endpoint when
 * configured, otherwise the local KB. Never throws into the UI.
 */
export async function askAssistant(history: ChatMessage[], input: string): Promise<string> {
  if (CHAT_ENDPOINT) {
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, input }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reply?: string };
        if (data.reply) return data.reply;
      }
    } catch {
      /* fall through to local */
    }
  }
  return localAnswer(input);
}
