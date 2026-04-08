import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Minus, Maximize2, Send, X } from 'lucide-react';
import AdieMoodWidget from './AdieMoodWidget';

interface Message {
  id: string;
  sender: 'adie' | 'user';
  text: string;
  timestamp: string;
  isMoodWidget?: boolean;
  isStreaming?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'adie',
    text: "Hey! I noticed you've been working really hard this week. How are you feeling about everything right now? 🌿",
    timestamp: '2 minutes ago'
  }
];

const QUICK_REPLIES = [
  "I'm feeling overwhelmed",
  "Give me a breathing exercise",
  "I'm okay, thanks"
];

interface AdieChatWindowProps {
  onClose: () => void;
  position: { x: number; y: number };
}

async function streamAdieResponse(
  history: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const res = await fetch('/api/adie/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history }),
  });

  if (!res.ok) {
    onError(`Server error: ${res.status}`);
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) { onError(parsed.error); return; }
        if (parsed.text) onChunk(parsed.text);
      } catch {}
    }
  }
  onDone();
}

export default function AdieChatWindow({ onClose, position }: AdieChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showPromo, setShowPromo] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsgId = Date.now().toString();
    const adieMsgId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: 'just now'
    }]);
    setInputValue('');
    setShowQuickReplies(false);
    setIsStreaming(true);

    const newHistory = [...history, { role: 'user' as const, content: text }];
    setHistory(newHistory);

    setMessages(prev => [...prev, {
      id: adieMsgId,
      sender: 'adie',
      text: '',
      timestamp: 'just now',
      isStreaming: true
    }]);

    let fullResponse = '';
    let isMoodWidget = false;

    await streamAdieResponse(
      newHistory,
      (chunk) => {
        fullResponse += chunk;
        setMessages(msgs => msgs.map(m =>
          m.id === adieMsgId ? { ...m, text: fullResponse } : m
        ));
      },
      () => {
        // Check if we should show mood widget after response
        if (text.toLowerCase().includes("okay") || text.toLowerCase().includes("fine")) {
          isMoodWidget = true;
        }
        setMessages(msgs => msgs.map(m =>
          m.id === adieMsgId ? { ...m, isStreaming: false, isMoodWidget } : m
        ));
        setHistory(prev => [...prev, { role: 'assistant', content: fullResponse }]);
        setIsStreaming(false);
      },
      (err) => {
        setMessages(msgs => msgs.map(m =>
          m.id === adieMsgId ? { ...m, text: `Sorry, I couldn't connect right now. (${err})`, isStreaming: false } : m
        ));
        setIsStreaming(false);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed z-[9998] w-[320px] h-[420px] bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden"
      style={{
        bottom: 24 - position.y + 64,
        right: 24 - position.x,
        transformOrigin: 'bottom right'
      }}
    >
      {/* Header */}
      <div className="h-[52px] border-b border-gray-100 flex items-center px-4 shrink-0 bg-white">
        <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-medium text-sm mr-3">
          A
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#7C3AED] leading-none mb-1">Adie AI Assistant</div>
          <div className="text-[11px] text-gray-500 leading-none">Your wellbeing companion</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <Minus className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`text-[13px] leading-[1.6] px-[13px] py-[10px] ${
                msg.sender === 'user'
                  ? 'bg-[#F5F5F5] text-gray-800 rounded-[12px_0_12px_12px]'
                  : 'bg-[#F5F3FF] text-gray-800 rounded-[0_12px_12px_12px] max-w-[85%]'
              }`}
            >
              {msg.text}
              {msg.isStreaming && (
                <span className="inline-block w-1.5 h-3.5 bg-[#7C3AED] ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>
            {msg.isMoodWidget && (
              <div className="mt-2 w-full max-w-[85%]">
                <AdieMoodWidget inChat />
              </div>
            )}
            <div className="text-[10px] text-gray-400 mt-1">{msg.timestamp}</div>
          </div>
        ))}

        {showQuickReplies && !isStreaming && (
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSend(reply)}
                className="px-3 py-1.5 rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#7C3AED] text-[11px] hover:bg-[#EDE9FE] transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 bg-white shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 text-[13px] bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 resize-none py-1.5 max-h-[80px] disabled:opacity-60"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isStreaming}
            className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6D28D9] transition-colors shrink-0 mb-0.5"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <p className="text-[9px] text-gray-400 leading-tight">
            Adie AI Assistant is an AI assistant, not a licensed professional. By chatting, you agree to our <Link to="/terms" target="_blank" className="underline hover:text-gray-600">Terms of Service</Link>.
          </p>
        </div>
      </div>

      {/* Promotional Banner */}
      {showPromo && (
        <div className="bg-gradient-to-r from-[#F5F3FF] to-[#F3E8FF] border-t border-[#E9D5FF] px-3 py-2 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5B21B6]">
            <span className="text-sm leading-none">🎁</span>
            <span className="leading-tight">
              <strong className="font-semibold">AdmitOS Desktop Promo:</strong><br/>
              Tasks consume 50% fewer credits.
            </span>
          </div>
          <button
            onClick={() => setShowPromo(false)}
            className="absolute top-1.5 right-1.5 text-[#7C3AED]/60 hover:text-[#7C3AED] transition-colors"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
