import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Send, Heart, Wind, Moon, Sun, Smile, Meh, Frown,
  ChevronRight, BookOpen, Music, Flower2, Brain, Shield, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: 'adie' | 'user';
  text: string;
}

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Good', value: 5, color: 'text-green-500' },
  { emoji: '😐', label: 'Okay', value: 3, color: 'text-amber-500' },
  { emoji: '😟', label: 'Stressed', value: 2, color: 'text-orange-500' },
  { emoji: '😔', label: 'Low', value: 1, color: 'text-red-400' },
];

const QUICK_PROMPTS = [
  { icon: Wind, label: 'Breathing exercise', prompt: "Guide me through a quick breathing exercise to calm my nerves" },
  { icon: Brain, label: 'Reframe my anxiety', prompt: "I'm feeling anxious about my applications. Help me reframe this" },
  { icon: Moon, label: 'Can\'t sleep', prompt: "I can't sleep because I'm worried about my applications. What should I do?" },
  { icon: Star, label: 'Motivation boost', prompt: "I need a motivational boost. I've been working hard but feel defeated" },
  { icon: Heart, label: 'Talk it out', prompt: "I just need to talk. This whole process is really getting to me" },
  { icon: Shield, label: 'Handle rejection', prompt: "I just got rejected from my top choice school. How do I cope?" },
];

const RESOURCES = [
  { icon: Wind, title: 'Box Breathing', desc: '4-4-4-4 technique to calm the nervous system in under 2 minutes', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' },
  { icon: BookOpen, title: 'Journaling Prompt', desc: 'Write about one thing you\'re proud of this week, no matter how small', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400' },
  { icon: Music, title: 'Focus Playlist', desc: 'Lo-fi study music clinically shown to reduce cortisol during studying', color: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-400' },
  { icon: Flower2, title: '5-4-3-2-1 Grounding', desc: 'Bring yourself back to the present moment using your 5 senses', color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' },
];

async function streamAdieResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void
) {
  try {
    const res = await fetch('/api/adie/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) { onDone(); return; }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value).split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') { onDone(); return; }
        try { const p = JSON.parse(data); if (p.text) onChunk(p.text); } catch {}
      }
    }
    onDone();
  } catch { onDone(); }
}

export default function Wellbeing() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', sender: 'adie', text: "Hi, I'm Adie 💜 I'm here to support you through the stress and uncertainty of the application process. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodCheckedIn, setMoodCheckedIn] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'resources'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsgId = Date.now().toString();
    const adieMsgId = (Date.now() + 1).toString();
    const newHistory = [...history, { role: 'user' as const, content: text }];
    setHistory(newHistory);
    setMessages(prev => [...prev,
      { id: userMsgId, sender: 'user', text },
      { id: adieMsgId, sender: 'adie', text: '' }
    ]);
    setInput('');
    setIsStreaming(true);
    let full = '';
    await streamAdieResponse(
      newHistory,
      chunk => {
        full += chunk;
        setMessages(msgs => msgs.map(m => m.id === adieMsgId ? { ...m, text: full } : m));
      },
      () => {
        setHistory(h => [...h, { role: 'assistant', content: full }]);
        setIsStreaming(false);
      }
    );
  };

  const handleMoodCheckin = () => {
    if (!selectedMood) return;
    const mood = MOOD_OPTIONS.find(m => m.value === selectedMood);
    setMoodCheckedIn(true);
    handleSend(`I'm feeling ${mood?.label.toLowerCase()} today (${mood?.emoji})`);
  };

  return (
    <div className="flex-1 flex h-[calc(100vh)] bg-calm-bg overflow-hidden">
      {/* Left Panel */}
      <div className="w-[340px] shrink-0 border-r border-calm-border bg-calm-surface flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-calm-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h1 className="font-semibold text-calm-text">Wellbeing</h1>
              <p className="text-xs text-calm-text-muted">Mental health & emotional support</p>
            </div>
          </div>
        </div>

        {/* Mood Check-in */}
        <div className="p-5 border-b border-calm-border">
          <p className="text-xs font-semibold text-calm-text-muted uppercase tracking-wider mb-3">Daily Check-in</p>
          {!moodCheckedIn ? (
            <>
              <p className="text-sm text-calm-text mb-3">How are you feeling right now?</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {MOOD_OPTIONS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMood(m.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all',
                      selectedMood === m.value
                        ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                        : 'border-calm-border hover:border-[#7C3AED]/40 bg-calm-surface-2'
                    )}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[10px] text-calm-text-muted">{m.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleMoodCheckin}
                disabled={!selectedMood}
                className="w-full py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#6D28D9] transition-colors"
              >
                Check in with Adie
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-calm-text-muted">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Checked in today. Adie is here for you 💜</span>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="p-4 border-b border-calm-border">
          <div className="flex bg-calm-surface-2 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveView('chat')}
              className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors',
                activeView === 'chat' ? 'bg-calm-surface text-calm-text shadow-sm' : 'text-calm-text-muted')}
            >
              Chat with Adie
            </button>
            <button
              onClick={() => setActiveView('resources')}
              className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors',
                activeView === 'resources' ? 'bg-calm-surface text-calm-text shadow-sm' : 'text-calm-text-muted')}
            >
              Resources
            </button>
          </div>
        </div>

        {/* Quick Prompts (only in chat view) */}
        {activeView === 'chat' && (
          <div className="p-4 overflow-y-auto flex-1">
            <p className="text-xs font-semibold text-calm-text-muted uppercase tracking-wider mb-3">Quick Start</p>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleSend(p.prompt)}
                  disabled={isStreaming}
                  className="flex items-center gap-3 p-3 rounded-xl border border-calm-border hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5 text-left transition-colors group disabled:opacity-50"
                >
                  <p.icon className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span className="text-sm text-calm-text-muted group-hover:text-calm-text">{p.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-calm-text-muted ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {activeView === 'resources' && (
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            <p className="text-xs font-semibold text-calm-text-muted uppercase tracking-wider mb-3">Coping Tools</p>
            {RESOURCES.map(r => (
              <div key={r.title} className={cn('p-4 rounded-xl border', r.color)}>
                <div className="flex items-center gap-2 mb-1">
                  <r.icon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{r.title}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{r.desc}</p>
              </div>
            ))}
            <div className="p-4 rounded-xl border border-calm-border bg-calm-surface-2 text-xs text-calm-text-muted leading-relaxed">
              <strong className="text-calm-text block mb-1">Crisis Support</strong>
              Adie is not a licensed therapist. If you're experiencing a mental health crisis, please reach out to a qualified professional or crisis line in your country.
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Full Adie Chat */}
      <div className="flex-1 flex flex-col bg-calm-surface">
        {/* Chat Header */}
        <div className="h-14 border-b border-calm-border flex items-center px-6 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-sm mr-3">A</div>
          <div>
            <div className="text-sm font-semibold text-calm-text">Adie AI Assistant</div>
            <div className="text-xs text-calm-text-muted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online · Powered by Claude
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.sender === 'adie' && (
                  <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">A</div>
                )}
                <div className={cn(
                  'max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.sender === 'user'
                    ? 'bg-calm-primary text-white rounded-tr-sm'
                    : 'bg-[#F5F3FF] dark:bg-[#2D1B69]/30 text-calm-text rounded-tl-sm'
                )}>
                  {msg.text || (isStreaming && msg.id === messages[messages.length - 1].id && msg.sender === 'adie' && (
                    <span className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ))}
                  {msg.text && isStreaming && msg.id === messages[messages.length - 1].id && msg.sender === 'adie' && (
                    <span className="inline-block w-1.5 h-3.5 bg-[#7C3AED] ml-0.5 animate-pulse rounded-sm" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-calm-border shrink-0">
          <form
            onSubmit={e => { e.preventDefault(); handleSend(input); }}
            className="flex items-end gap-3 bg-calm-surface-2 border border-calm-border rounded-2xl p-3 focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:border-[#7C3AED]/50 transition-all"
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
              placeholder="Talk to Adie..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-calm-text placeholder:text-calm-text-muted max-h-[120px] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#6D28D9] transition-colors shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <p className="text-center text-[10px] text-calm-text-muted mt-2">
            Adie is an AI companion, not a licensed therapist. In crisis, please contact a professional.
          </p>
        </div>
      </div>
    </div>
  );
}
