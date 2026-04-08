import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Sparkles, CheckCircle2, Loader2, FileText, ArrowRight,
  Paperclip, Globe, LayoutDashboard, Code, LayoutPanelLeft,
  ChevronDown, ChevronRight, User, FileCode2,
  Bell, Zap, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { GoogleCalendarIcon, GmailIcon, NotionIcon, GithubIcon, FigmaIcon, SlackIcon } from "@/components/icons";

type TabType = 'output';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  isStreaming?: boolean;
}

async function streamAgentResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const res = await fetch('/api/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
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

export default function Agent() {
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const runAgent = async (objective: string) => {
    if (isRunning || !objective.trim()) return;

    const userMsgId = Date.now().toString();
    const agentMsgId = (Date.now() + 1).toString();

    const newHistory = [...history, { role: 'user' as const, content: objective }];
    setHistory(newHistory);

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: objective },
      { id: agentMsgId, role: 'agent', content: '', isStreaming: true },
    ]);
    setInput("");
    setIsRunning(true);

    let fullResponse = '';

    await streamAgentResponse(
      newHistory,
      (chunk) => {
        fullResponse += chunk;
        setMessages(msgs => msgs.map(m =>
          m.id === agentMsgId ? { ...m, content: fullResponse } : m
        ));
      },
      () => {
        setMessages(msgs => msgs.map(m =>
          m.id === agentMsgId ? { ...m, isStreaming: false } : m
        ));
        setHistory(prev => [...prev, { role: 'assistant', content: fullResponse }]);
        setIsRunning(false);
      },
      (err) => {
        setMessages(msgs => msgs.map(m =>
          m.id === agentMsgId ? { ...m, content: `Error: ${err}`, isStreaming: false } : m
        ));
        setIsRunning(false);
      }
    );
  };

  return (
    <div className="flex-1 flex h-[calc(100vh)] bg-calm-surface overflow-hidden">

      {/* Left Panel: Chat (40%) */}
      <div className="w-[40%] min-w-[380px] max-w-[560px] border-r border-calm-border flex flex-col bg-calm-surface relative z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">

        {/* Header */}
        <div className="h-14 border-b border-calm-border flex items-center px-4 shrink-0">
          <h2 className="font-semibold text-calm-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-calm-primary" />
            Agent Chat
          </h2>
          <span className="ml-2 text-xs text-calm-text-muted bg-calm-surface-2 border border-calm-border px-2 py-0.5 rounded-full">
            claude sonnet 4.6
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-calm-text mb-4">
                What can I do for you?
              </h1>
              <p className="text-lg text-calm-text-muted mb-10 max-w-md">
                Turn a student into a strategically positioned, fully prepared, submission-ready Ivy/Top 30 applicant
              </p>
              <div className="mt-2 flex flex-col gap-2 w-full max-w-sm">
                <button onClick={() => runAgent("Run Case Intake & Positioning for a student with GPA 42/45 IB predicted, SAT 1480, interested in CS at Ivy League and Oxbridge")} className="text-sm text-left p-3 rounded-xl border border-calm-border hover:bg-calm-surface-2 text-calm-text-muted transition-colors">
                  "Run Case Intake & Positioning"
                </button>
                <button onClick={() => runAgent("Generate a strategic school list for a strong STEM student targeting Top 20 US universities and G5 UK")} className="text-sm text-left p-3 rounded-xl border border-calm-border hover:bg-calm-surface-2 text-calm-text-muted transition-colors">
                  "Generate Strategic School List"
                </button>
                <button onClick={() => runAgent("Help me brainstorm Common App essay topics that highlight leadership and intellectual curiosity")} className="text-sm text-left p-3 rounded-xl border border-calm-border hover:bg-calm-surface-2 text-calm-text-muted transition-colors">
                  "Brainstorm Essay Topics"
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}
                >
                  <div className={cn(
                    "w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1 transition-all duration-500",
                    msg.role === 'user' ? "bg-calm-surface-2 text-calm-primary" : "bg-calm-surface-2 text-calm-text-muted border border-calm-border",
                    msg.role === 'agent' && msg.isStreaming ? "ai-glow border-calm-accent text-calm-accent" : ""
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    {msg.role === 'user' ? (
                      <div className="bg-calm-primary text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow-sm">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="text-sm text-calm-text leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-calm-primary ml-0.5 animate-pulse rounded-sm" />
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-calm-surface border-t border-calm-border shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); runAgent(input); }}
            className="relative flex flex-col bg-calm-surface-2 border border-calm-border shadow-sm rounded-2xl p-2 focus-within:ring-2 focus-within:ring-calm-primary/20 focus-within:border-calm-primary transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent to do something..."
              className="w-full bg-transparent border-0 focus:ring-0 resize-none px-2 py-2 text-sm min-h-[60px] max-h-[150px]"
              disabled={isRunning}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  runAgent(input);
                }
              }}
            />
            <div className="flex items-center justify-between pt-2 px-1">
              <div className="flex items-center gap-1">
                <button type="button" className="p-1.5 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-lg transition-colors" title="Attach File">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-lg transition-colors" title="Web Search">
                  <Globe className="w-4 h-4" />
                </button>
              </div>
              <Button
                type="submit"
                size="icon"
                className={cn(
                  "rounded-xl w-8 h-8 transition-all",
                  input.trim() ? "bg-calm-primary text-white hover:bg-calm-primary-hover shadow-sm" : "bg-calm-surface-2 text-calm-text-muted"
                )}
                disabled={isRunning || !input.trim()}
              >
                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </form>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-calm-text-muted">
            <button onClick={() => setIsConnectorsOpen(true)} className="hover:text-calm-text transition-colors">
              Connect your tools to AdmitOS
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsConnectorsOpen(true)} className="p-1 rounded-md hover:bg-calm-surface-2 hover:text-calm-text transition-colors" title="GitHub">
                <GithubIcon className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsConnectorsOpen(true)} className="p-1 rounded-md hover:bg-calm-surface-2 hover:text-calm-text transition-colors" title="Figma">
                <FigmaIcon className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsConnectorsOpen(true)} className="p-1 rounded-md hover:bg-calm-surface-2 hover:text-calm-text transition-colors" title="Slack">
                <SlackIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Workspace */}
      <div className="flex-1 flex flex-col bg-calm-bg relative">

        {/* Top Header */}
        <div className="h-14 border-b border-calm-border bg-calm-surface flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center">
            <button className="flex items-center gap-1.5 text-sm font-medium text-calm-text-muted hover:bg-calm-surface-2 px-2.5 py-1.5 rounded-lg transition-colors">
              <span>admitos 1.0</span>
              <ChevronDown className="w-3.5 h-3.5 text-calm-text-muted" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm font-medium text-calm-text-muted hover:bg-calm-surface-2 px-2.5 py-1.5 rounded-lg transition-colors" title="Credits">
              <Zap className="w-4 h-4 text-calm-warning fill-calm-warning" />
              <span>450</span>
            </button>
            <button className="p-2 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-lg transition-colors relative" title="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-calm-error rounded-full border border-calm-surface"></span>
            </button>
            <button className="ml-1 w-7 h-7 rounded-full bg-gradient-to-tr from-calm-primary to-calm-secondary text-white flex items-center justify-center text-xs font-bold shadow-sm border border-calm-border hover:opacity-90 transition-opacity" title="My Account">
              AC
            </button>
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-calm-text-muted">
              <LayoutPanelLeft className="w-12 h-12 mb-4 opacity-20" />
              <p>Start a conversation to see the agent work here.</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl">
              {isRunning && (
                <div className="flex items-center gap-3 text-calm-text-muted text-sm mb-6">
                  <Loader2 className="w-4 h-4 animate-spin text-calm-primary" />
                  <span>Agent is thinking...</span>
                </div>
              )}
              {!isRunning && messages.length > 0 && (
                <div className="bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-calm-success" />
                    <span className="font-semibold text-calm-text">Response ready</span>
                  </div>
                  <div className="text-sm text-calm-text-muted whitespace-pre-wrap leading-relaxed">
                    {messages.filter(m => m.role === 'agent').slice(-1)[0]?.content}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connectors Modal */}
      <AnimatePresence>
        {isConnectorsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-calm-surface rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-calm-border"
            >
              <div className="w-64 bg-calm-surface-2 border-r border-calm-border p-4 flex flex-col gap-2 shrink-0">
                <h2 className="text-lg font-semibold text-calm-text mb-4 px-2">Connectors</h2>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-calm-surface-2 text-calm-text font-medium text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  Built-in
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text font-medium text-sm transition-colors">
                  <Code className="w-4 h-4" />
                  Custom
                </button>
              </div>

              <div className="flex-1 flex flex-col bg-calm-surface overflow-hidden">
                <div className="p-6 border-b border-calm-border flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-xl font-semibold text-calm-text">Built-in Connectors</h3>
                    <p className="text-sm text-calm-text-muted mt-1">Connect your favorite tools to AdmitOS.</p>
                  </div>
                  <button onClick={() => setIsConnectorsOpen(false)} className="p-2 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[
                      { icon: <GoogleCalendarIcon className="w-6 h-6" />, name: "Google Calendar", desc: "Sync deadlines, meetings, and application milestones." },
                      { icon: <GmailIcon className="w-6 h-6" />, name: "Gmail", desc: "Read and draft emails to admissions offices." },
                      { icon: <NotionIcon className="w-6 h-6" />, name: "Notion", desc: "Read and write to your Notion workspace." },
                      { icon: <GithubIcon className="w-6 h-6" />, name: "GitHub", desc: "Access repositories, issues, and pull requests." },
                      { icon: <FigmaIcon className="w-6 h-6" />, name: "Figma", desc: "Read designs, extract assets and comments." },
                      { icon: <SlackIcon className="w-6 h-6" />, name: "Slack", desc: "Send messages and read channel history." },
                    ].map(c => (
                      <div key={c.name} className="border border-calm-border rounded-xl p-4 flex items-start gap-4 hover:border-calm-border transition-colors bg-calm-surface cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-calm-surface-2 flex items-center justify-center shrink-0">
                          {c.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-calm-text text-sm">{c.name}</h4>
                          <p className="text-xs text-calm-text-muted mt-1 mb-3">{c.desc}</p>
                          <Button variant="outline" size="sm" className="h-8 text-xs font-medium">Connect</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
