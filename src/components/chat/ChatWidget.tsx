import { useEffect, useRef, useState } from 'react';
import { askAssistant, type ChatMessage } from '@/lib/chat/respond';
import { GREETING, QUICK_REPLIES } from '@/lib/chat/knowledge';
import { businessConfig } from '@/config/business.config';
import { ChatIcon, CloseIcon, SparkleIcon, PhoneIcon, ArrowRightIcon } from '@/components/ui/Icons';

/**
 * ChatWidget — a simple SFA Insurance assistant in the bottom-right corner.
 * Answers questions about the site from a local knowledge base (works offline in the
 * demo); upgrades to a real AI endpoint when VITE_CHAT_ENDPOINT is set (see respond.ts).
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'bot', text: GREETING }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || typing) return;
    setInput('');
    const history = [...messages, { role: 'user' as const, text: clean }];
    setMessages(history);
    setTyping(true);
    // Small delay so the reply feels considered (and lets the typing dots show).
    const reply = await askAssistant(history, clean);
    await new Promise((r) => setTimeout(r, 400));
    setMessages((m) => [...m, { role: 'bot', text: reply }]);
    setTyping(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 px-safe pb-safe print:hidden">
      {/* Panel */}
      {open && (
        <div className="animate-fade-up flex h-[min(34rem,calc(100svh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-brand-steel bg-brand-charcoal shadow-card">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-brand-steel bg-brand-red px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <SparkleIcon className="text-lg" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-sm font-semibold">SFA Assistant</p>
                <p className="text-[0.7rem] text-white/80">Answers about Medicare &amp; our plans</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
            >
              <CloseIcon className="text-lg" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-brand-black/40 p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <p
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-brand-red px-3.5 py-2 text-sm leading-relaxed text-white'
                      : 'max-w-[88%] rounded-2xl rounded-bl-sm border border-brand-steel bg-brand-charcoal px-3.5 py-2 text-sm leading-relaxed text-brand-white'
                  }
                >
                  {m.text}
                </p>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <span className="inline-flex gap-1 rounded-2xl rounded-bl-sm border border-brand-steel bg-brand-charcoal px-3.5 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand-chrome" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand-chrome [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand-chrome [animation-delay:0.4s]" />
                </span>
              </div>
            )}

            {/* Quick replies — only before the visitor has asked anything */}
            {messages.length <= 1 && !typing && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="rounded-full border border-brand-steel bg-brand-charcoal px-3 py-1.5 text-xs font-medium text-brand-white transition-colors hover:border-brand-red hover:text-brand-red"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-brand-steel bg-brand-charcoal p-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Medicare, costs, enrollment…"
              aria-label="Type your question"
              className="min-h-[40px] flex-1 rounded-full border border-brand-steel bg-white px-4 text-sm text-brand-white placeholder:text-brand-chrome/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white transition-all hover:bg-brand-red-dark disabled:opacity-40"
            >
              <ArrowRightIcon className="text-base" />
            </button>
          </form>

          {/* Compliance footer */}
          <div className="flex items-center justify-between gap-2 border-t border-brand-steel bg-brand-charcoal px-3 py-1.5">
            <a
              href={`tel:${businessConfig.phoneE164}`}
              className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-brand-red"
            >
              <PhoneIcon className="text-xs" /> {businessConfig.phone}
            </a>
            <span className="text-[0.62rem] leading-tight text-brand-chrome/70">
              Not affiliated with the U.S. government
            </span>
          </div>
        </div>
      )}

      {/* Launcher button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-red-dark"
      >
        {open ? <CloseIcon className="text-2xl" /> : <ChatIcon className="text-2xl" />}
      </button>
    </div>
  );
}
