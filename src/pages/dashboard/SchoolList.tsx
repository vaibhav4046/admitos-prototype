import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { mockSchools } from "@/data/mockData";
import { 
  Search, MapPin, Trophy, BookmarkPlus, BookmarkCheck, 
  GraduationCap, Activity, FileText, ShieldCheck, ExternalLink,
  AlertCircle, CheckCircle2, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchoolList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedIds, setSavedIds] = useState<number[]>([1, 3, 4, 5]);
  const [activeFilter, setActiveFilter] = useState("All");

  const toggleSave = (id: number) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter(i => i !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const filteredSchools = mockSchools.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || u.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const resources = [
    { name: "Common App Requirements", provider: "Common App", type: "Free", link: "https://www.commonapp.org/explore/" },
    { name: "UCAS Course Search", provider: "UCAS", type: "Free", link: "https://digital.ucas.com/search" },
    { name: "Fiske Guide Online", provider: "Fiske", type: "Premium", link: "#" },
    { name: "BigFuture College Search", provider: "College Board", type: "Free", link: "https://bigfuture.collegeboard.org/" },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full pt-12 pb-24 px-6 space-y-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <div className="flex-1 space-y-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-calm-text mb-2">School List Strategy</h1>
            <p className="text-calm-text-muted text-lg">Manage target institutions, application tracks, and candidacy readiness.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-calm-surface-2 p-2 rounded-2xl border border-calm-border">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-calm-text-muted" />
              <Input 
                placeholder="Search institutions..." 
                className="pl-9 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 px-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {["All", "Reach", "Target", "Safer"].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    activeFilter === filter 
                      ? "bg-calm-surface border border-calm-border shadow-sm text-calm-text" 
                      : "text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredSchools.map(school => (
              <div key={school.id} className="group flex flex-col bg-calm-surface border border-calm-border hover:border-calm-border rounded-2xl p-6 transition-all hover:shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-calm-surface-2 border border-calm-border flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-calm-text-muted" />
                  </div>
                  <button onClick={() => toggleSave(school.id)} className="text-calm-text-muted hover:text-calm-text transition-colors">
                    {savedIds.includes(school.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-calm-text fill-zinc-900" />
                    ) : (
                      <BookmarkPlus className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-calm-text leading-tight mb-1">{school.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-calm-text-muted">
                    <MapPin className="w-3.5 h-3.5" /> {school.country} • {school.trackType}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Badge variant="secondary" className={cn(
                    "font-normal px-2.5 py-0.5",
                    school.category === 'Reach' ? 'bg-calm-error/10 text-calm-error border-calm-error/30/50' : 
                    school.category === 'Target' ? 'bg-calm-info/10 text-calm-info border-calm-info/30/50' : 
                    'bg-calm-success/10 text-calm-success border-calm-success/30/50'
                  )}>
                    {school.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm font-medium text-calm-text bg-calm-surface-2 px-3 py-1 rounded-full border border-calm-border relative overflow-hidden group" title="Based on academic and extracurricular alignment">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--calm-accent)]/0 via-[var(--calm-accent)]/10 to-[var(--calm-accent)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Trophy className="w-3.5 h-3.5 text-calm-primary" />
                    <span className="relative z-10 flex items-center gap-1.5">
                      Profile Fit:
                      <span className="text-calm-text-muted font-normal">
                        {school.fitScore >= 85 ? "Strong" : school.fitScore >= 70 ? "Competitive" : "Stretch"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-calm-text bg-calm-surface-2 px-3 py-1 rounded-full border border-calm-border relative overflow-hidden group" title="Based on application milestone completion">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--calm-primary)]/0 via-[var(--calm-primary)]/10 to-[var(--calm-primary)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Activity className="w-3.5 h-3.5 text-calm-accent" />
                    <span className="relative z-10 flex items-center gap-1.5">
                      Readiness:
                      <span className="text-calm-text-muted font-normal">
                        {school.readinessScore >= 85 ? "High" : school.readinessScore >= 70 ? "On Track" : "Developing"}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="mt-auto space-y-5 pt-4 border-t border-calm-border">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-calm-text-muted flex items-center gap-1.5" title="Compares current profile against historically admitted students.">
                        <Activity className="w-3.5 h-3.5 text-calm-accent" />
                        Historical Data Alignment
                      </span>
                      <span className="text-calm-text font-medium">
                        {school.fitScore >= 85 ? "High" : school.fitScore >= 70 ? "Moderate" : "Low"}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full">
                      <div className={cn("flex-1 rounded-full transition-colors", school.fitScore >= 40 ? "bg-calm-primary" : "bg-calm-surface-2")} />
                      <div className={cn("flex-1 rounded-full transition-colors", school.fitScore >= 70 ? "bg-calm-primary" : "bg-calm-surface-2")} />
                      <div className={cn("flex-1 rounded-full transition-colors", school.fitScore >= 85 ? "bg-calm-primary" : "bg-calm-surface-2")} />
                      <div className={cn("flex-1 rounded-full transition-colors", school.fitScore >= 95 ? "bg-calm-primary" : "bg-calm-surface-2")} />
                    </div>
                    <p className="text-[10px] text-calm-text-muted italic leading-tight mt-0.5">
                      *Alignment is based on past data and does not guarantee future admission outcomes.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-calm-text-muted flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {school.applicationCategory}</span>
                    <span className={cn(
                      "font-medium",
                      school.status === 'Submitted' ? 'text-calm-primary' :
                      school.status === 'Drafting' ? 'text-calm-accent' :
                      'text-calm-text-muted'
                    )}>{school.status}</span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-calm-text-muted mb-2 uppercase tracking-wider">Strengths</div>
                    <div className="flex flex-wrap gap-1.5">
                      {school.strengths.map(s => (
                        <span key={s} className="px-2 py-1 bg-calm-surface-2 border border-calm-border rounded-md text-xs text-calm-text-muted">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Strategy Audit */}
          <div className="bg-calm-surface rounded-2xl p-6 border border-calm-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-calm-accent/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <ShieldCheck className="w-5 h-5 text-calm-primary" />
              <h3 className="font-semibold text-calm-text">Strategy Audit</h3>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-calm-bg/50 rounded-xl border border-calm-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-calm-text-muted uppercase tracking-wider">List Balance</span>
                  <Badge className="bg-calm-primary/10 text-calm-primary border border-calm-primary/20 text-[10px]">OPTIMIZED</Badge>
                </div>
                {/* Softened Probability/Balance Bar */}
                <div className="relative h-2.5 mb-3 rounded-full overflow-hidden bg-calm-surface-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-calm-error/40 via-calm-info/40 to-calm-success/40 blur-[2px]" />
                  <div className="absolute inset-0 flex">
                    <div className="flex-[2] border-r border-[var(--calm-bg)]/40" />
                    <div className="flex-[3] border-r border-[var(--calm-bg)]/40" />
                    <div className="flex-[2]" />
                  </div>
                </div>
                <p className="text-[11px] text-calm-text-muted">2 Reach, 3 Target, 2 Safer. Healthy distribution.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-calm-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-calm-primary shrink-0 mt-0.5" />
                  <span>Major alignment verified for all schools.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-calm-text-muted">
                  <AlertCircle className="w-3.5 h-3.5 text-calm-warning shrink-0 mt-0.5" />
                  <span>Financial aid strategy needed for 2 schools.</span>
                </div>
              </div>

              <button className="w-full py-2.5 mt-2 bg-calm-surface-2 text-calm-text border border-calm-border rounded-xl text-sm font-medium hover:bg-[var(--calm-border)] transition-colors">
                Request Expert Review
              </button>
            </div>
          </div>

          {/* Resource Router */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6">
            <h3 className="font-semibold text-calm-text mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-calm-text-muted" />
              Research Resources
            </h3>
            <div className="space-y-3">
              {resources.map((res) => (
                <a 
                  key={res.name}
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3 rounded-xl border border-calm-border hover:border-calm-border hover:bg-calm-surface-2 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-calm-text group-hover:text-calm-primary transition-colors">{res.name}</span>
                    <ExternalLink className="w-3 h-3 text-calm-text-muted group-hover:text-calm-text-muted" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
                    <span className="text-calm-text-muted">{res.provider}</span>
                    <span className={cn(
                      res.type === 'Premium' ? "text-calm-warning" : "text-calm-success"
                    )}>{res.type}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
