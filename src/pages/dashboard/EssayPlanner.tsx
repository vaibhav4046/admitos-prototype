import { Badge } from "@/components/ui/badge";
import { PenTool, Sparkles, MessageSquare, FileText, Plus } from "lucide-react";

export default function EssayPlanner() {
  const essays = [
    {
      title: "UCAS Personal Statement",
      target: "UK Universities",
      status: "Drafting",
      wordCount: "450 / 4000 chars",
      theme: "Intersection of CS and Economics",
      lastEdited: "2 days ago"
    },
    {
      title: "Common App Main Essay",
      target: "US Universities",
      status: "Brainstorming",
      wordCount: "0 / 650 words",
      theme: "Overcoming failure in robotics competition",
      lastEdited: "1 week ago"
    },
    {
      title: "Stanford Supplemental",
      target: "Stanford",
      status: "Not Started",
      wordCount: "0 / 250 words",
      theme: "Intellectual Vitality",
      lastEdited: "-"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto w-full pt-12 pb-24 px-6 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-calm-text mb-2">Essay Planner</h1>
          <p className="text-calm-text-muted text-lg">Brainstorm, outline, and refine your personal statements.</p>
        </div>
        <button className="flex items-center gap-2 bg-calm-surface text-calm-text border border-calm-border hover:bg-calm-surface-2 rounded-full px-6 h-12 text-base shadow-sm transition-colors">
          <Plus className="w-5 h-5" />
          New Essay
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {essays.map((essay, i) => (
          <div key={i} className="group flex flex-col bg-calm-surface border border-calm-border hover:border-calm-border rounded-2xl p-6 transition-all hover:shadow-sm cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-calm-surface-2 border border-calm-border flex items-center justify-center">
                <FileText className="w-5 h-5 text-calm-text-muted" />
              </div>
              <Badge variant="secondary" className={`font-normal px-2.5 py-0.5 ${
                essay.status === 'Not Started' ? 'bg-calm-surface-2 text-calm-text-muted border-calm-border' : 
                essay.status === 'Drafting' ? 'bg-calm-info/10 text-calm-info border-calm-info/30/50' : 
                'bg-calm-warning/10 text-calm-warning border-calm-warning/30/50'
              }`}>
                {essay.status}
              </Badge>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-calm-text leading-tight mb-1 group-hover:text-calm-info transition-colors">{essay.title}</h3>
              <p className="text-sm text-calm-text-muted">{essay.target}</p>
            </div>

            <div className="mt-auto space-y-4 pt-4 border-t border-calm-border">
              <div>
                <div className="text-xs font-medium text-calm-text-muted mb-1">Core Theme</div>
                <p className="text-sm text-calm-text-muted leading-relaxed">{essay.theme}</p>
              </div>
              
              <div className="flex justify-between items-center text-xs text-calm-text-muted bg-calm-surface-2 p-2.5 rounded-lg border border-calm-border">
                <span className="font-medium">{essay.wordCount}</span>
                <span>Edited {essay.lastEdited}</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium text-calm-text-muted bg-calm-surface border border-calm-border hover:bg-calm-surface-2 transition-colors">
                  <PenTool className="w-4 h-4 text-calm-text-muted" /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium text-calm-text-muted bg-calm-surface-2 border border-calm-border hover:bg-calm-surface-2 transition-colors">
                  <MessageSquare className="w-4 h-4 text-calm-text-muted" /> Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-calm-surface-2 border border-calm-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-2xl bg-calm-surface border border-calm-border flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-8 h-8 text-calm-text" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-semibold text-calm-text mb-2">Stuck on a blank page?</h3>
          <p className="text-calm-text-muted leading-relaxed max-w-2xl">
            Use the AI Agent to generate an outline based on your extracurricular profile and target major. It will help you find the perfect narrative angle without writing the essay for you.
          </p>
        </div>
        <button className="bg-calm-surface text-calm-text border border-calm-border hover:bg-calm-surface-2 rounded-full px-6 py-3 font-medium whitespace-nowrap shadow-sm transition-colors shrink-0">
          Start Outline Agent
        </button>
      </div>
    </div>
  );
}
