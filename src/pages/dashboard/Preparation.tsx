import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpenCheck, 
  Target, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Beaker, 
  Briefcase, 
  UserCircle, 
  PenTool, 
  BrainCircuit, 
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Preparation() {
  const prepTracks = [
    {
      title: "Academic & GPA Planning",
      icon: BookOpenCheck,
      progress: 85,
      status: "On Track",
      details: "Course rigor review complete. Gap analysis delivered.",
      type: "Strategy"
    },
    {
      title: "Standardized Testing",
      icon: Target,
      progress: 60,
      status: "In Progress",
      details: "Diagnostic complete. Target: 1520. Next mock: Saturday.",
      type: "Diagnosis"
    },
    {
      title: "Extracurricular & Leadership",
      icon: TrendingUp,
      progress: 40,
      status: "In Progress",
      details: "Activities audit complete. Priority planning underway.",
      type: "Profile"
    },
    {
      title: "Research Program",
      icon: Beaker,
      progress: 20,
      status: "Starting",
      details: "10-week structured track. Proposal drafting.",
      type: "Academic"
    }
  ];

  const resources = [
    { name: "Khan Academy SAT", provider: "Official Partner", type: "Free", link: "https://www.khanacademy.org/sat" },
    { name: "College Board BigFuture", provider: "Official", type: "Free", link: "https://bigfuture.collegeboard.org/" },
    { name: "ArborBridge Diagnostic", provider: "Premium", type: "Paid", link: "#" },
    { name: "Revolution Prep Mock", provider: "Premium", type: "Paid", link: "#" },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full pt-12 pb-24 px-6 space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-calm-text-muted text-sm font-medium mb-1 uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            Preparation OS
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-calm-text mb-2">Candidacy Building</h1>
          <p className="text-calm-text-muted text-lg">Diagnosis → Path → Resource → Weekly Plan → Supervision</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-calm-success/10 text-calm-success border-calm-success/30">
            Accountability: Active
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Tracks */}
          <div className="grid md:grid-cols-2 gap-4">
            {prepTracks.map((track, i) => (
              <div key={i} className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-sm hover:border-calm-border transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-calm-surface-2 border border-calm-border flex items-center justify-center group-hover:bg-calm-surface transition-colors">
                      <track.icon className="w-5 h-5 text-calm-text-muted group-hover:text-calm-text transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-medium text-calm-text text-sm">{track.title}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-calm-text-muted font-semibold">{track.type}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] font-medium px-1.5 py-0 ${
                    track.status === 'On Track' ? 'bg-calm-success/10 text-calm-success border-calm-success/30/50' : 
                    track.status === 'In Progress' ? 'bg-calm-info/10 text-calm-info border-calm-info/30/50' : 
                    'bg-calm-surface-2 text-calm-text-muted border-calm-border'
                  }`}>
                    {track.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs text-calm-text-muted leading-relaxed">{track.details}</p>
                  <div className="flex items-center gap-3">
                    <Progress value={track.progress} className="h-1 flex-1 bg-calm-surface-2" />
                    <span className="text-[10px] font-mono text-calm-text-muted w-8 text-right">{track.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Supervision Plan */}
          <div className="bg-calm-surface rounded-2xl p-6 text-calm-text overflow-hidden relative border border-calm-border">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Calendar className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Weekly Supervision Plan</h3>
                <span className="text-xs text-calm-text-muted">Week 12 of 24</span>
              </div>
              <div className="space-y-4">
                {[
                  { day: "Mon", task: "SAT Math: Advanced Functions", status: "completed" },
                  { day: "Wed", task: "Research Proposal Review", status: "pending" },
                  { day: "Sat", task: "Full Diagnostic Mock Exam", status: "upcoming" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-calm-border last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-calm-text-muted w-8">{item.day}</span>
                      <span className={cn("text-sm", item.status === 'completed' && "text-calm-text-muted line-through")}>{item.task}</span>
                    </div>
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-calm-success" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-calm-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Resource Router */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-calm-text mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-calm-text-muted" />
              Resource Router
            </h3>
            <div className="space-y-3">
              {resources.map((res, i) => (
                <a 
                  key={i} 
                  href={res.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-calm-border hover:bg-calm-surface-2 transition-colors group"
                >
                  <div>
                    <div className="text-xs font-medium text-calm-text group-hover:underline">{res.name}</div>
                    <div className="text-[10px] text-calm-text-muted">{res.provider}</div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] px-1.5 py-0",
                    res.type === 'Free' ? "text-calm-success bg-calm-success/10 border-calm-success/20" : "text-calm-info bg-calm-info/10 border-calm-info/20"
                  )}>
                    {res.type}
                  </Badge>
                </a>
              ))}
            </div>
          </div>

          {/* Human Intervention Trigger */}
          <div className="bg-calm-warning/10 border border-calm-warning/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-calm-warning font-medium text-sm mb-2">
              <AlertCircle className="w-4 h-4" />
              Human Approval Required
            </div>
            <p className="text-xs text-calm-warning/80 mb-4 leading-relaxed">
              Your SAT Diagnostic score (1380) is below the target (1520). 
              A specialized tutor intervention is recommended for the Math section.
            </p>
            <button className="w-full py-2 bg-calm-warning text-calm-bg rounded-lg text-xs font-medium hover:bg-calm-warning/80 transition-colors">
              Request Tutor Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
