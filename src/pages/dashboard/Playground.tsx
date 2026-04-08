import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search, GraduationCap, BookOpen, Trophy, Star, MapPin,
  ThumbsUp, MessageSquare, Sparkles, Filter, TrendingUp, Users, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Experience {
  id: string;
  anonymous: boolean;
  author: { name: string; initials: string; avatar: string };
  from: string;
  background: { gpa: string; sat?: string; act?: string; ib?: string; aLevel?: string };
  major: string;
  admitted: string[];
  waitlisted: string[];
  rejected: string[];
  tags: string[];
  story: string;
  tip: string;
  reactions: { helpful: number; inspired: number };
  timestamp: string;
  cycle: string;
}

const EXPERIENCES: Experience[] = [
  {
    id: '1',
    anonymous: false,
    author: { name: 'Sarah K.', initials: 'SK', avatar: 'bg-blue-500' },
    from: 'Singapore',
    background: { gpa: '4.0', sat: '1560', ib: '44/45' },
    major: 'Computer Science',
    admitted: ['MIT', 'Stanford', 'CMU'],
    waitlisted: ['Harvard'],
    rejected: ['Caltech'],
    tags: ['#CS', '#Ivy', '#International', '#Singapore'],
    story: 'I started my application journey completely overwhelmed. I had strong grades but no idea how to tell my story. The turning point was realizing that admissions isn\'t about listing achievements — it\'s about showing who you are and why you think the way you do. My CS research project on accessibility tools for visually impaired students became the thread that connected everything.',
    tip: 'Start your essays in June. Your first draft will be terrible — that\'s the point. Give yourself time to iterate.',
    reactions: { helpful: 214, inspired: 89 },
    timestamp: '2 weeks ago',
    cycle: '2025'
  },
  {
    id: '2',
    anonymous: true,
    author: { name: 'Anonymous', initials: '?', avatar: 'bg-purple-400' },
    from: 'UK',
    background: { gpa: 'N/A', aLevel: 'A*A*A*', sat: '1520' },
    major: 'Economics',
    admitted: ['LSE', 'UCL', 'Warwick', 'Princeton'],
    waitlisted: [],
    rejected: ['Oxford', 'Cambridge'],
    tags: ['#Economics', '#UK', '#Oxbridge', '#IvyLeague'],
    story: 'Got rejected from both Oxford and Cambridge but admitted to Princeton — which shows that fit matters more than prestige rankings. Oxford wanted someone who had already published research. Princeton valued my curiosity and the way I wrote about economic inequality through the lens of my community. Don\'t write what you think they want to hear.',
    tip: 'Apply to US schools even if you\'re UK-based. The process is very different but the opportunities are real.',
    reactions: { helpful: 178, inspired: 134 },
    timestamp: '1 month ago',
    cycle: '2025'
  },
  {
    id: '3',
    anonymous: false,
    author: { name: 'Marcus T.', initials: 'MT', avatar: 'bg-emerald-500' },
    from: 'Nigeria',
    background: { gpa: '3.9', sat: '1480' },
    major: 'Medicine / Pre-Med',
    admitted: ['Johns Hopkins', 'Duke', 'Emory'],
    waitlisted: ['Yale'],
    rejected: ['Harvard', 'Penn'],
    tags: ['#PreMed', '#Africa', '#FirstGen', '#Scholarship'],
    story: 'As a first-generation student from Lagos, I thought top US medical programs were out of reach. What changed my perspective was attending a virtual information session and realizing these schools actively want diverse global perspectives. My volunteer work at a community health clinic became my most powerful application asset — not my SAT score.',
    tip: 'Apply for every scholarship you can find. Financial aid exists for international students at more schools than you think.',
    reactions: { helpful: 302, inspired: 201 },
    timestamp: '3 weeks ago',
    cycle: '2025'
  },
  {
    id: '4',
    anonymous: false,
    author: { name: 'Priya M.', initials: 'PM', avatar: 'bg-rose-500' },
    from: 'India',
    background: { gpa: '3.95', ib: '43/45', sat: '1540' },
    major: 'Architecture',
    admitted: ['Columbia', 'Cornell', 'UCL Bartlett'],
    waitlisted: ['Yale School of Architecture'],
    rejected: ['Harvard GSD'],
    tags: ['#Architecture', '#India', '#Portfolio', '#Design'],
    story: 'Architecture applications are completely different from regular college apps — your portfolio IS your application. I spent 6 months curating 15 projects down to 8 that told a coherent design story. My strongest piece was a speculative project reimagining affordable housing in Mumbai using locally-sourced materials. Admissions committees can spot passion vs. performance.',
    tip: 'Your portfolio needs a narrative arc. Don\'t just show your best work — show your thinking process.',
    reactions: { helpful: 156, inspired: 98 },
    timestamp: '5 days ago',
    cycle: '2025'
  },
  {
    id: '5',
    anonymous: true,
    author: { name: 'Anonymous', initials: '?', avatar: 'bg-amber-500' },
    from: 'China',
    background: { gpa: '4.0', sat: '1590', aLevel: 'A*A*A*A*' },
    major: 'Mathematics',
    admitted: ['Cambridge', 'Imperial', 'Oxford'],
    waitlisted: [],
    rejected: ['Harvard', 'MIT', 'Princeton'],
    tags: ['#Math', '#Oxbridge', '#China', '#STEM'],
    story: 'Perfect stats don\'t guarantee US Ivy admissions — especially for Chinese international students in STEM. I had 1590 SAT, 4.0 GPA, and multiple math olympiad medals. Harvard, MIT, Princeton all rejected me. Cambridge and Oxford admitted me to read Mathematics. I think the lesson is: know which systems value what you bring. UK universities valued my olympiad results far more.',
    tip: 'Don\'t only apply to the US. The UK, Canada, and Europe have world-class programs with better admission rates for international STEM students.',
    reactions: { helpful: 445, inspired: 267 },
    timestamp: '2 months ago',
    cycle: '2024'
  },
  {
    id: '6',
    anonymous: false,
    author: { name: 'Amara J.', initials: 'AJ', avatar: 'bg-teal-500' },
    from: 'Ghana',
    background: { gpa: '3.85', sat: '1440' },
    major: 'Public Policy',
    admitted: ['Georgetown', 'GWU', 'Sciences Po Paris'],
    waitlisted: ['Columbia SIPA'],
    rejected: ['Princeton WWS', 'Harvard Kennedy'],
    tags: ['#PublicPolicy', '#Africa', '#International', '#Government'],
    story: 'I interned at Ghana\'s Ministry of Finance at 17 and that changed everything about how I approached my applications. Specific, real-world impact matters infinitely more than theoretical interest. My essay about a specific budget allocation decision I observed — and why it was wrong — got me into every policy school I cared about.',
    tip: 'Get real experience before you apply. Even one summer internship in your field transforms how you write and what you have to say.',
    reactions: { helpful: 189, inspired: 143 },
    timestamp: '1 week ago',
    cycle: '2025'
  }
];

const FILTERS = ['All', 'CS & Tech', 'Medicine', 'Economics', 'Architecture', 'Math', 'Policy', 'UK', 'US', 'International'];
const CYCLES = ['All Years', '2025', '2024', '2023'];

export default function Playground() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeCycle, setActiveCycle] = useState('All Years');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, { helpful: number; inspired: number }>>({});

  const filtered = EXPERIENCES.filter(exp => {
    const matchesSearch = !search ||
      exp.story.toLowerCase().includes(search.toLowerCase()) ||
      exp.major.toLowerCase().includes(search.toLowerCase()) ||
      exp.admitted.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      exp.from.toLowerCase().includes(search.toLowerCase()) ||
      exp.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'CS & Tech' && exp.tags.some(t => t.includes('CS') || t.includes('Tech'))) ||
      (activeFilter === 'Medicine' && exp.tags.some(t => t.includes('Med') || t.includes('Pre'))) ||
      (activeFilter === 'Economics' && exp.tags.some(t => t.includes('Econ'))) ||
      (activeFilter === 'Architecture' && exp.tags.some(t => t.includes('Arch'))) ||
      (activeFilter === 'Math' && exp.tags.some(t => t.includes('Math'))) ||
      (activeFilter === 'Policy' && exp.tags.some(t => t.includes('Policy'))) ||
      (activeFilter === 'UK' && exp.tags.some(t => t.includes('UK') || t.includes('Oxbridge'))) ||
      (activeFilter === 'US' && exp.tags.some(t => t.includes('Ivy') || t.includes('IvyLeague'))) ||
      (activeFilter === 'International' && exp.tags.some(t => t.includes('International')));

    const matchesCycle = activeCycle === 'All Years' || exp.cycle === activeCycle;

    return matchesSearch && matchesFilter && matchesCycle;
  });

  const handleReact = (id: string, type: 'helpful' | 'inspired') => {
    setReactions(prev => ({
      ...prev,
      [id]: {
        helpful: (prev[id]?.helpful ?? EXPERIENCES.find(e => e.id === id)!.reactions.helpful) + (type === 'helpful' ? 1 : 0),
        inspired: (prev[id]?.inspired ?? EXPERIENCES.find(e => e.id === id)!.reactions.inspired) + (type === 'inspired' ? 1 : 0),
      }
    }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-calm-bg">
      {/* Header */}
      <div className="bg-calm-surface border-b border-calm-border px-8 pt-8 pb-0 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-calm-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-calm-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-calm-text">Peers Experience Playground</h1>
              <p className="text-xs text-calm-text-muted">Real stories from students who've been through it</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-4 mb-6 text-xs text-calm-text-muted">
            <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-calm-primary" /><span><strong className="text-calm-text">2,400+</strong> experiences shared</span></div>
            <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-calm-primary" /><span><strong className="text-calm-text">68</strong> countries</span></div>
            <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-calm-primary" /><span><strong className="text-calm-text">340+</strong> universities</span></div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-calm-text-muted" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by school, major, country, or keyword..."
              className="pl-9 bg-calm-surface-2 border-calm-border"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-calm-text-muted shrink-0" />
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  'shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  activeFilter === f
                    ? 'bg-calm-primary text-white border-calm-primary'
                    : 'bg-calm-surface text-calm-text-muted border-calm-border hover:border-calm-primary/50'
                )}
              >
                {f}
              </button>
            ))}
            <div className="w-px h-4 bg-calm-border mx-1 shrink-0" />
            {CYCLES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCycle(c)}
                className={cn(
                  'shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  activeCycle === c
                    ? 'bg-calm-surface-2 text-calm-text border-calm-border'
                    : 'bg-calm-surface text-calm-text-muted border-calm-border hover:bg-calm-surface-2'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-calm-text-muted">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No experiences match your search.</p>
            </div>
          )}

          {filtered.map(exp => {
            const isExpanded = expandedId === exp.id;
            const r = reactions[exp.id] ?? exp.reactions;
            return (
              <div key={exp.id} className="bg-calm-surface border border-calm-border rounded-2xl overflow-hidden hover:border-calm-primary/30 transition-colors">
                <div className="p-5">
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0', exp.author.avatar)}>
                        {exp.anonymous ? '?' : exp.author.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-calm-text">{exp.author.name}</span>
                          {exp.anonymous && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Anonymous</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-calm-text-muted mt-0.5">
                          <MapPin className="w-3 h-3" />{exp.from}
                          <span>·</span>
                          <BookOpen className="w-3 h-3" />{exp.major}
                          <span>·</span>
                          <span>{exp.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{exp.cycle} Cycle</Badge>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {exp.background.ib && (
                      <div className="flex items-center gap-1.5 bg-calm-surface-2 px-2.5 py-1 rounded-lg text-xs">
                        <Star className="w-3 h-3 text-calm-warning" /><span className="text-calm-text font-medium">IB {exp.background.ib}</span>
                      </div>
                    )}
                    {exp.background.aLevel && (
                      <div className="flex items-center gap-1.5 bg-calm-surface-2 px-2.5 py-1 rounded-lg text-xs">
                        <Star className="w-3 h-3 text-calm-warning" /><span className="text-calm-text font-medium">A-Level {exp.background.aLevel}</span>
                      </div>
                    )}
                    {exp.background.gpa && (
                      <div className="flex items-center gap-1.5 bg-calm-surface-2 px-2.5 py-1 rounded-lg text-xs">
                        <Trophy className="w-3 h-3 text-calm-primary" /><span className="text-calm-text font-medium">GPA {exp.background.gpa}</span>
                      </div>
                    )}
                    {exp.background.sat && (
                      <div className="flex items-center gap-1.5 bg-calm-surface-2 px-2.5 py-1 rounded-lg text-xs">
                        <span className="text-calm-text font-medium">SAT {exp.background.sat}</span>
                      </div>
                    )}
                  </div>

                  {/* Outcomes */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {exp.admitted.map(s => (
                      <span key={s} className="flex items-center gap-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-[11px] px-2 py-0.5 rounded-full font-medium">
                        <GraduationCap className="w-3 h-3" />{s}
                      </span>
                    ))}
                    {exp.waitlisted.map(s => (
                      <span key={s} className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[11px] px-2 py-0.5 rounded-full font-medium">
                        WL: {s}
                      </span>
                    ))}
                    {exp.rejected.map(s => (
                      <span key={s} className="bg-calm-surface-2 text-calm-text-muted border border-calm-border text-[11px] px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Story */}
                  <p className={cn('text-sm text-calm-text-muted leading-relaxed', !isExpanded && 'line-clamp-3')}>
                    {exp.story}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 bg-calm-primary/5 border border-calm-primary/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-calm-primary" />
                        <span className="text-xs font-semibold text-calm-primary">Top Tip</span>
                      </div>
                      <p className="text-sm text-calm-text italic">"{exp.tip}"</p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {exp.tags.map(tag => (
                      <span key={tag} className="bg-calm-surface-2 text-calm-text-muted border border-calm-border text-[10px] px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-calm-border px-5 py-3 flex items-center justify-between bg-calm-surface-2/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReact(exp.id, 'helpful')}
                      className="flex items-center gap-1.5 text-xs text-calm-text-muted hover:text-calm-primary transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />{r.helpful} helpful
                    </button>
                    <button
                      onClick={() => handleReact(exp.id, 'inspired')}
                      className="flex items-center gap-1.5 text-xs text-calm-text-muted hover:text-calm-primary transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />{r.inspired} inspired
                    </button>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                    className="text-xs font-medium text-calm-primary hover:underline"
                  >
                    {isExpanded ? 'Show less' : 'Read full story + tip →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
