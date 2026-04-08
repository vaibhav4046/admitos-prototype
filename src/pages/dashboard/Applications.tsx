import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  FileText, 
  Users, 
  Send, 
  GraduationCap,
  Map,
  ShieldCheck,
  History,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Applications() {
  const milestones = [
    {
      title: "Case Intake and Positioning",
      progress: 100,
      icon: Users,
      tasks: [
        { title: "Collect student profile & academic records", status: "done", date: "Sep 1" },
        { title: "Collect testing status & target majors", status: "done", date: "Sep 5" },
        { title: "Generate positioning report & risk assessment", status: "done", date: "Sep 10" },
      ]
    },
    {
      title: "Roadmap and Strategic School List",
      progress: 100,
      icon: GraduationCap,
      tasks: [
        { title: "Generate reach/match/likely list", status: "done", date: "Sep 15" },
        { title: "Assign ED/EA/RD strategy", status: "done", date: "Sep 20" },
        { title: "Build application calendar & backup strategy", status: "done", date: "Sep 25" },
      ]
    },
    {
      title: "Testing and Academic Support",
      progress: 80,
      icon: ShieldCheck,
      tasks: [
        { title: "Decide SAT or ACT & set target scores", status: "done", date: "Oct 1" },
        { title: "Assign diagnostic test & generate study plan", status: "done", date: "Oct 10" },
        { title: "Route to tutor if needed", status: "in-progress", date: "Oct 15" },
      ]
    },
    {
      title: "Extracurricular and Leadership Development",
      progress: 60,
      icon: Map,
      tasks: [
        { title: "Audit current activities & identify profile gaps", status: "done", date: "Oct 20" },
        { title: "Recommend honors, competitions & summer programs", status: "in-progress", date: "Oct 25" },
        { title: "Recommend capstone or research path", status: "todo", date: "Nov 1" },
      ]
    },
    {
      title: "Research / Capstone Execution",
      progress: 20,
      icon: FileText,
      tasks: [
        { title: "Select project type & generate scope", status: "in-progress", date: "Nov 5" },
        { title: "Assign mentor type & track deliverables", status: "todo", date: "Nov 15" },
        { title: "Capture evidence of impact", status: "todo", date: "Nov 30" },
      ]
    },
    {
      title: "Essay and Narrative System",
      progress: 0,
      icon: FileText,
      tasks: [
        { title: "Generate personal statement topics & supplement matrix", status: "todo", date: "Dec 1" },
        { title: "Draft essay versions & track feedback cycles", status: "todo", date: "Dec 10" },
        { title: "Check narrative consistency", status: "todo", date: "Dec 15" },
      ]
    },
    {
      title: "Recommendations and Supporting Documents",
      progress: 0,
      icon: Users,
      tasks: [
        { title: "Select recommenders & generate brag sheet", status: "todo", date: "Dec 20" },
        { title: "Track recommendation deadlines", status: "todo", date: "Jan 5" },
        { title: "Assemble resume, activities, and honors", status: "todo", date: "Jan 10" },
      ]
    },
    {
      title: "Former Admissions Officer Review",
      progress: 0,
      icon: ShieldCheck,
      tasks: [
        { title: "Run full application consistency check", status: "todo", date: "Jan 15" },
        { title: "Generate submission readiness score", status: "todo", date: "Jan 20" },
        { title: "Route to human FAO review & simulate feedback", status: "todo", date: "Jan 25" },
      ]
    },
    {
      title: "Submission, Interview, Waitlist and Conversion",
      progress: 0,
      icon: Send,
      tasks: [
        { title: "Check submission readiness & approve submission", status: "todo", date: "Feb 1" },
        { title: "Track portals & prepare interview pack", status: "todo", date: "Feb 15" },
        { title: "Generate LOCI if waitlisted & compare offers", status: "todo", date: "Mar 1" },
      ]
    }
  ];

  const auditTrail = [
    { action: "School List Generated", user: "AI Agent", date: "2h ago", evidence: "Strategy Memo v2" },
    { action: "Essay Approved", user: "Human Consultant (Alex)", date: "5h ago", evidence: "Common App PS v4" },
    { action: "Diagnostic Uploaded", user: "Student", date: "1d ago", evidence: "SAT Mock #3" },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full pt-12 pb-24 px-6 space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-calm-text-muted text-sm font-medium mb-1 uppercase tracking-wider">
            <Map className="w-4 h-4" />
            Application OS
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-calm-text mb-2">Submission Roadmap</h1>
          <p className="text-calm-text-muted text-lg">Intake → Roadmap → Preparation → Execution → Submission</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-calm-text-muted mb-1">Overall Readiness</div>
            <div className="flex items-center gap-3">
              <Progress value={68} className="h-2 w-32 bg-calm-surface-2" />
              <span className="text-sm font-mono font-bold">68%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {milestones.map((milestone, i) => (
            <div key={i} className="bg-calm-surface border border-calm-border rounded-2xl overflow-hidden shadow-sm hover:border-calm-border transition-all">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-64 bg-calm-surface-2 p-6 border-b md:border-b-0 md:border-r border-calm-border flex flex-col justify-center relative overflow-hidden">
                  <milestone.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-calm-border/40" />
                  <div className="relative z-10">
                    <h3 className="font-semibold text-calm-text mb-3">{milestone.title}</h3>
                    <div className="flex items-center gap-3">
                      <Progress value={milestone.progress} className="h-1 flex-1 bg-calm-surface-2" />
                      <span className="text-[10px] font-mono font-bold text-calm-text-muted">{milestone.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <div className="grid gap-1">
                    {milestone.tasks.map((task, j) => (
                      <div key={j} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-calm-surface-2 transition-colors cursor-pointer">
                        {task.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-calm-success shrink-0" />
                        ) : task.status === 'in-progress' ? (
                          <Clock className="w-4 h-4 text-calm-warning shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-calm-text-muted shrink-0 group-hover:text-calm-text-muted transition-colors" />
                        )}
                        <span className={cn(
                          "text-sm flex-1",
                          task.status === 'done' ? 'text-calm-text-muted' : 'text-calm-text-muted font-medium'
                        )}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-calm-text-muted">{task.date}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-calm-text-muted group-hover:text-calm-text transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Evidence & Audit Trail */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-calm-text mb-6 flex items-center gap-2">
              <History className="w-4 h-4 text-calm-text-muted" />
              Evidence & Audit Trail
            </h3>
            <div className="space-y-6">
              {auditTrail.map((log, i) => (
                <div key={i} className="relative pl-4 border-l border-calm-border last:border-0 pb-6 last:pb-0">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-calm-border border-2 border-calm-surface" />
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-calm-text">{log.action}</div>
                    <div className="text-[10px] text-calm-text-muted flex items-center gap-2">
                      <span>{log.user}</span>
                      <span className="w-1 h-1 rounded-full bg-calm-border" />
                      <span>{log.date}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 p-1.5 bg-calm-surface-2 rounded-lg border border-calm-border hover:bg-calm-surface-2 transition-colors cursor-pointer">
                      <FileText className="w-3 h-3 text-calm-text-muted" />
                      <span className="text-[10px] font-medium text-calm-text-muted">{log.evidence}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-calm-text-muted ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Gate */}
          <div className="bg-calm-surface rounded-2xl p-6 text-calm-text border border-calm-border">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-calm-text-muted" />
              Submission Gate
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-calm-surface-2 rounded-xl border border-calm-border">
                <div className="text-[10px] text-calm-text-muted uppercase font-bold mb-1">Next Deadline</div>
                <div className="text-sm font-medium">Common App ED - Nov 1</div>
                <div className="text-xs text-calm-text-muted mt-1">15 days remaining</div>
              </div>
              <button className="w-full py-2.5 bg-calm-surface text-calm-text rounded-xl text-xs font-bold hover:bg-calm-surface-2 transition-colors">
                Run Final Consistency Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
