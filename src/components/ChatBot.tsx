import { useEffect, useRef, useState } from 'react';
import { chatApi, type ChatMessage } from '../api/chat';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    sender: 'bot',
    text: "Hey! I'm VibeBot, your anonymous AI companion on VibeWall. 💜\nFeeling overwhelmed, need to vent, or want advice? I'm here to listen without judgment.",
    timestamp: Date.now(),
  },
];

const QUICK_PROMPTS = [
  'Feeling stressed and need to vent...',
  'How does anonymous posting work?',
  'Give me some positive encouragement today!',
  'What should I do if I feel overwhelmed?',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('vw_chat_history');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('vw_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatApi.sendMessage(text);
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: response.reply || "I'm right here with you, always listening.",
        timestamp: response.timestamp || Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; msg?: string } }; message?: string };
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text:
          e.response?.data?.message ??
          e.response?.data?.msg ??
          e.message ??
          "I couldn't connect right now. Please try again in a moment!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessages(INITIAL_MESSAGES);
    try {
      sessionStorage.removeItem('vw_chat_history');
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 flex h-[520px] w-[350px] flex-col overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-2xl transition-all duration-200 sm:w-[380px] dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-4 py-3 text-white dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">VibeBot</h3>
                <span className="text-[11px] text-violet-100">AI Companion</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                title="Clear conversation"
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm sm:text-sm ${
                    m.sender === 'user'
                      ? 'rounded-tr-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                      : 'rounded-tl-sm border border-gray-200/80 bg-gray-50 text-gray-800 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gray-200/80 bg-gray-50 px-4 py-3 text-gray-500 dark:border-zinc-800 dark:bg-zinc-800">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-500" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-pink-500" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (shown when only initial message) */}
          {messages.length <= 1 && (
            <div className="border-t border-gray-100 bg-gray-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <span className="mb-1.5 block text-[11px] font-medium text-gray-400 dark:text-zinc-400">
                Quick vibes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] text-violet-700 transition hover:border-violet-400 hover:bg-violet-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-violet-300 dark:hover:bg-zinc-800"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-gray-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Talk to VibeBot..."
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 transition focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-violet-500/30 focus:outline-none focus:ring-4 focus:ring-violet-400/30"
        aria-label="Open AI Chatbot"
      >
        {isOpen ? (
          <svg className="h-6 w-6 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-pink-500" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
