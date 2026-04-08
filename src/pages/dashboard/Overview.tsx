import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockStudent, mockTasks } from "@/data/mockData";
import { 
  ArrowRight, CheckCircle2, Circle, Sparkles, Plus, 
  Zap, Map, ChevronDown, ChevronUp, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import AdieWeeklyReview from "@/components/adie/AdieWeeklyReview";
import CommonsSidebarWidget from "@/components/commons/CommonsSidebarWidget";
import ProfileSiteGenerator from "@/components/profile/ProfileSiteGenerator";

export default function Overview() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const nextBestAction = mockTasks.find(t => t.status === 'todo') || mockTasks[0];

  return (
    <div className="max-w-4xl mx-auto w-full pt-16 pb-24 px-6 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-calm-text mb-2">
            Good morning, {mockStudent.name.split(' ')[0]}
          </h1>
          <p className="text-calm-text-muted text-sm font-medium tracking-wide uppercase">
            Intelligence Mesh Active
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')} className="gap-2 bg-calm-primary text-white hover:bg-calm-primary-hover rounded-full px-6 h-10 text-sm shadow-sm transition-all duration-300">
          <Plus className="w-4 h-4" />
          New Agent Run
        </Button>
      </div>

      {/* Next Best Action - Focus Area */}
      <section className="bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-calm-primary" />
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-calm-primary uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Next Best Action
            </div>
            <div>
              <h2 className="text-xl font-medium text-calm-text mb-1">{nextBestAction.title}</h2>
              <p className="text-calm-text-muted text-sm">Complete this task by the deadline to stay on track.</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Button onClick={() => navigate('/dashboard/applications')} className="bg-calm-surface-2 text-calm-text hover:bg-[var(--calm-border)] rounded-full px-5 h-9 text-xs transition-colors border border-calm-border">
                Start Task
              </Button>
              <span className="text-xs text-calm-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Due {nextBestAction.deadline}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Profile Site Generator */}
      <section>
        <ProfileSiteGenerator />
      </section>

      {/* Adie Weekly Review */}
      <section>
        <AdieWeeklyReview />
      </section>

      {/* Commons Widget */}
      <section>
        <CommonsSidebarWidget />
      </section>

      {/* Macro Progress - Progressive Disclosure */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-calm-text-muted uppercase tracking-wider px-1">Macro Progress</h3>
        
        {/* Application Readiness Engine - Gaussian Blur Readiness */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-calm-accent/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-calm-surface-2 flex items-center justify-center border border-calm-border">
                <Sparkles className="w-4 h-4 text-calm-accent" />
              </div>
              <div>
                <h4 className="font-medium text-calm-text">Application Readiness Engine</h4>
                <span className="text-xs text-calm-text-muted">Top Choice Readiness Score</span>
              </div>
            </div>
            <Badge className="bg-calm-accent/10 text-calm-accent border border-calm-accent/20 text-[10px] uppercase tracking-wider">
              Updated Today
            </Badge>
          </div>
          
          <div className="relative z-10 space-y-3">
            <div className="flex justify-between text-xs text-calm-text-muted">
              <span>Readiness Range</span>
              <span className="font-medium text-calm-text">75 - 85</span>
            </div>
            
            {/* The "Lucid Calm" Readiness Range (Gaussian Blur) */}
            <div className="relative h-4 w-full rounded-full bg-calm-surface-2 overflow-hidden">
              {/* Soft gradient block representing the readiness range */}
              <div 
                className="absolute top-0 bottom-0 bg-gradient-to-r from-[var(--calm-accent)]/10 via-[var(--calm-accent)]/70 to-[var(--calm-accent)]/10 blur-[3px] rounded-full"
                style={{ left: '75%', width: '10%' }}
              />
              {/* Subtle center marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-[var(--calm-text)] rounded-full shadow-sm opacity-60"
                style={{ left: '80%' }}
              />
            </div>
            
            <p className="text-xs text-calm-text-muted pt-2 leading-relaxed">
              Based on recent mock test scores and extracurricular updates, your readiness range has narrowed. Focus on the <span className="text-calm-text font-medium">Research Capstone</span> to shift the median upward.
            </p>
          </div>
        </div>

        {/* Preparation OS Expandable */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleSection('prep')}
            className="w-full flex items-center justify-between p-6 hover:bg-calm-surface-2 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-calm-surface-2 flex items-center justify-center border border-calm-border">
                <Zap className="w-4 h-4 text-calm-primary" />
              </div>
              <div>
                <h4 className="font-medium text-calm-text">Preparation OS</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-calm-text-muted">Academic Readiness</span>
                  <div className="w-24 h-1 bg-calm-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-calm-primary w-[78%] rounded-full" />
                  </div>
                  <span className="text-xs font-medium text-calm-text">78%</span>
                </div>
              </div>
            </div>
            {expandedSection === 'prep' ? <ChevronUp className="w-5 h-5 text-calm-text-muted" /> : <ChevronDown className="w-5 h-5 text-calm-text-muted" />}
          </button>
          
          <AnimatePresence>
            {expandedSection === 'prep' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-calm-border bg-calm-bg/50"
              >
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs text-calm-text-muted block mb-1">Standardized Testing</span>
                      <span className="text-sm font-medium text-calm-text">SAT Target: 1520</span>
                    </div>
                    <div>
                      <span className="text-xs text-calm-text-muted block mb-1">Academic Rigor</span>
                      <span className="text-sm font-medium text-calm-warning">AP Calc: Diagnostic Pending</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/dashboard/preparation')} className="w-full text-xs border-calm-border text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2">
                    Open Preparation OS <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Application OS Expandable */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleSection('app')}
            className="w-full flex items-center justify-between p-6 hover:bg-calm-surface-2 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-calm-surface-2 flex items-center justify-center border border-calm-border">
                <Map className="w-4 h-4 text-calm-accent" />
              </div>
              <div>
                <h4 className="font-medium text-calm-text">Application OS</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-calm-text-muted">Submission Readiness</span>
                  <div className="w-24 h-1 bg-calm-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-calm-accent w-[42%] rounded-full" />
                  </div>
                  <span className="text-xs font-medium text-calm-text">42%</span>
                </div>
              </div>
            </div>
            {expandedSection === 'app' ? <ChevronUp className="w-5 h-5 text-calm-text-muted" /> : <ChevronDown className="w-5 h-5 text-calm-text-muted" />}
          </button>
          
          <AnimatePresence>
            {expandedSection === 'app' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-calm-border bg-calm-bg/50"
              >
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs text-calm-text-muted block mb-1">School List</span>
                      <span className="text-sm font-medium text-calm-text">7 Target Schools</span>
                    </div>
                    <div>
                      <span className="text-xs text-calm-text-muted block mb-1">Essays</span>
                      <span className="text-sm font-medium text-calm-text">2/12 Drafted</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/dashboard/applications')} className="w-full text-xs border-calm-border text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2">
                    Open Application OS <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
