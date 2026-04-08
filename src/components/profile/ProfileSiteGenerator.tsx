import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockStudent, mockSchools } from '@/data/mockData';
import {
  Globe, Sparkles, Check, ChevronRight, ExternalLink,
  Zap, Copy, RefreshCw, Layout, Palette, ArrowRight,
  GraduationCap, Code2, Briefcase, Star, Lock, Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TEMPLATES = [
  {
    id: 'signal',
    name: 'Signal',
    vibe: 'Minimal · Dark · Hacker',
    accent: '#6366f1',
    bg: 'bg-gray-950',
    preview: 'dark',
    desc: 'Dark-mode terminal aesthetic. Code-forward. Stanford/MIT CS energy.',
    tags: ['CS', 'Engineering', 'Research'],
    popularAt: ['MIT', 'CMU', 'Stanford'],
  },
  {
    id: 'clarity',
    name: 'Clarity',
    vibe: 'Clean · Light · Editorial',
    accent: '#0ea5e9',
    bg: 'bg-white',
    preview: 'light',
    desc: 'Swiss-grid typography. Journalism, Economics, Law. Ivy energy.',
    tags: ['Economics', 'Policy', 'Law'],
    popularAt: ['Harvard', 'Yale', 'Princeton'],
  },
  {
    id: 'canvas',
    name: 'Canvas',
    vibe: 'Bold · Creative · Portfolio',
    accent: '#f97316',
    bg: 'bg-zinc-50',
    preview: 'warm',
    desc: 'Full-bleed imagery and asymmetric layout. Art, Architecture, Design.',
    tags: ['Architecture', 'Design', 'Art'],
    popularAt: ['RISD', 'Columbia', 'UCL'],
  },
  {
    id: 'meridian',
    name: 'Meridian',
    vibe: 'Warm · Narrative · Human',
    accent: '#10b981',
    bg: 'bg-stone-50',
    preview: 'warm-light',
    desc: 'Story-driven layout with a human-first feel. Medicine, Social Sciences.',
    tags: ['Medicine', 'Biology', 'Public Health'],
    popularAt: ['Johns Hopkins', 'Duke', 'Penn'],
  },
  {
    id: 'orbit',
    name: 'Orbit',
    vibe: 'Futuristic · Interactive · Scroll',
    accent: '#8b5cf6',
    bg: 'bg-slate-900',
    preview: 'dark-purple',
    desc: 'Scroll-triggered animations. 3D depth. Entrepreneurship, AI, Startups.',
    tags: ['AI', 'Startup', 'Product'],
    popularAt: ['Stanford', 'Berkeley', 'Wharton'],
  },
  {
    id: 'atlas',
    name: 'Atlas',
    vibe: 'Global · Clean · International',
    accent: '#f59e0b',
    bg: 'bg-amber-50',
    preview: 'amber',
    desc: 'Multicultural, map-inspired identity. International students, global affairs.',
    tags: ['International', 'Policy', 'Languages'],
    popularAt: ['Georgetown', 'Sciences Po', 'LSE'],
  },
];

const DOMAIN_FORMATS = [
  { label: 'firstname.com', example: (name: string) => `${name.split(' ')[0].toLowerCase()}.com` },
  { label: 'fullname.com', example: (name: string) => `${name.replace(' ', '').toLowerCase()}.com` },
  { label: 'firstname.me', example: (name: string) => `${name.split(' ')[0].toLowerCase()}.me` },
  { label: 'Custom domain', example: () => 'yourown.com' },
];

interface TemplatePreviewProps {
  template: typeof TEMPLATES[0];
  student: typeof mockStudent;
}

function TemplatePreview({ template, student }: TemplatePreviewProps) {
  const firstName = student.name.split(' ')[0];
  const isDark = template.preview === 'dark' || template.preview === 'dark-purple';

  return (
    <div className={cn(
      'w-full h-full rounded-xl overflow-hidden relative',
      isDark ? 'bg-gray-950' : template.preview === 'warm' || template.preview === 'amber' ? 'bg-stone-50' : 'bg-white'
    )}>
      {/* Mock browser chrome */}
      <div className={cn('h-6 flex items-center px-2 gap-1.5 border-b', isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200')}>
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <div className={cn('flex-1 mx-2 h-3 rounded-sm text-[7px] flex items-center px-1.5 font-mono', isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500 border border-gray-200')}>
          {DOMAIN_FORMATS[0].example(student.name)}
        </div>
      </div>

      {/* Page content mock */}
      <div className="p-3 space-y-2">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <div className={cn('h-2 w-12 rounded', isDark ? 'bg-gray-700' : 'bg-gray-200')} />
          <div className="flex gap-1.5">
            {[1,2,3].map(i => <div key={i} className={cn('h-1.5 w-8 rounded', isDark ? 'bg-gray-800' : 'bg-gray-100')} />)}
          </div>
        </div>

        {/* Hero */}
        <div className={cn('rounded-lg p-3 mt-1', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: template.accent }}>
              {firstName[0]}
            </div>
            <div className="space-y-0.5">
              <div className={cn('h-2 w-16 rounded', isDark ? 'bg-gray-600' : 'bg-gray-300')} />
              <div className={cn('h-1.5 w-24 rounded', isDark ? 'bg-gray-700' : 'bg-gray-200')} />
            </div>
          </div>
          <div className={cn('h-1.5 w-full rounded mb-1', isDark ? 'bg-gray-800' : 'bg-gray-200')} />
          <div className={cn('h-1.5 w-3/4 rounded', isDark ? 'bg-gray-800' : 'bg-gray-200')} />
          <div className="flex gap-1.5 mt-2">
            <div className="h-3 w-12 rounded" style={{ backgroundColor: template.accent, opacity: 0.9 }} />
            <div className={cn('h-3 w-10 rounded border', isDark ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-transparent')} />
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-2 gap-1.5">
          {['Research', 'Awards', 'Essays', 'Schools'].map(s => (
            <div key={s} className={cn('rounded p-1.5', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
              <div className="h-1.5 w-8 rounded mb-1" style={{ backgroundColor: template.accent, opacity: 0.6 }} />
              <div className={cn('h-1 w-full rounded', isDark ? 'bg-gray-800' : 'bg-gray-200')} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfileSiteGenerator() {
  const [step, setStep] = useState<'intro' | 'template' | 'domain' | 'generating' | 'done'>('intro');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);

  const student = mockStudent;
  const firstName = student.name.split(' ')[0].toLowerCase();
  const domain = DOMAIN_FORMATS[selectedDomain].example(student.name);
  const template = TEMPLATES.find(t => t.id === selectedTemplate) ?? TEMPLATES[0];

  const handleGenerate = async () => {
    setStep('generating');
    await new Promise(r => setTimeout(r, 2200));
    setStep('done');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${domain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-calm-surface border border-calm-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-calm-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-calm-primary/10 flex items-center justify-center">
            <Globe className="w-4.5 h-4.5 text-calm-primary" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 className="font-semibold text-calm-text text-sm">Personal Profile Site</h3>
            <p className="text-xs text-calm-text-muted">Auto-generated from your AdmitOS profile</p>
          </div>
        </div>
        {step === 'done' && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
            <Check className="w-3.5 h-3.5" /> Live
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* INTRO */}
        {step === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
            <div className="flex gap-4 items-start mb-6">
              <div className="flex-1">
                <p className="text-sm text-calm-text leading-relaxed mb-3">
                  AdmitOS will generate a professional personal website at{' '}
                  <span className="font-mono text-calm-primary font-medium">{firstName}.com</span>{' '}
                  — automatically populated with your profile, achievements, essays, and school list.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['AI-generated content', 'Real-time sync', 'Admissions-optimized', 'Privacy controls'].map(tag => (
                    <span key={tag} className="text-[11px] px-2.5 py-1 bg-calm-surface-2 border border-calm-border rounded-full text-calm-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-32 h-24 shrink-0 rounded-xl border border-calm-border overflow-hidden shadow-sm">
                <TemplatePreview template={TEMPLATES[0]} student={student} />
              </div>
            </div>

            {/* What gets included */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { icon: GraduationCap, label: 'Academic profile & grades' },
                { icon: Star, label: 'Awards & achievements' },
                { icon: Code2, label: 'Projects & research' },
                { icon: Briefcase, label: 'Extracurriculars' },
                { icon: Globe, label: 'School list (optional)' },
                { icon: Sparkles, label: 'AI-crafted bio' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-calm-text-muted">
                  <Icon className="w-3.5 h-3.5 text-calm-primary shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('template')}
              className="w-full py-2.5 bg-calm-primary text-white rounded-xl text-sm font-medium hover:bg-calm-primary-hover transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Generate My Site
            </button>
          </motion.div>
        )}

        {/* TEMPLATE PICKER */}
        {step === 'template' && (
          <motion.div key="template" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-calm-text">Choose a template</p>
              <span className="text-xs text-calm-text-muted">6 available</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={cn(
                    'relative text-left rounded-xl border-2 overflow-hidden transition-all',
                    selectedTemplate === t.id ? 'border-calm-primary shadow-md' : 'border-calm-border hover:border-calm-primary/40'
                  )}
                >
                  {/* Mini preview */}
                  <div className="h-24 relative">
                    <TemplatePreview template={t} student={student} />
                    {selectedTemplate === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-calm-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 bg-calm-surface border-t border-calm-border">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }} />
                      <span className="text-xs font-semibold text-calm-text">{t.name}</span>
                    </div>
                    <p className="text-[10px] text-calm-text-muted leading-tight">{t.vibe}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Popular at schools */}
            {selectedTemplate && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-calm-primary/5 border border-calm-primary/20 rounded-xl text-xs text-calm-text-muted">
                <span className="text-calm-text font-medium">{template.name}</span> is popular among applicants to{' '}
                <span className="text-calm-primary">{template.popularAt.join(', ')}</span>
              </motion.div>
            )}

            {/* Custom option */}
            <div className="border border-dashed border-calm-border rounded-xl p-3 flex items-center gap-3 mb-5 hover:border-calm-primary/40 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-lg bg-calm-surface-2 flex items-center justify-center">
                <Layout className="w-4 h-4 text-calm-text-muted" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-calm-text">Import from Framer / Webflow / Notion</p>
                <p className="text-[10px] text-calm-text-muted">Use your own template or external platform</p>
              </div>
              <ChevronRight className="w-4 h-4 text-calm-text-muted" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('intro')} className="flex-1 py-2.5 border border-calm-border rounded-xl text-sm text-calm-text-muted hover:bg-calm-surface-2 transition-colors">
                Back
              </button>
              <button
                onClick={() => setStep('domain')}
                disabled={!selectedTemplate}
                className="flex-1 py-2.5 bg-calm-primary text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-calm-primary-hover transition-colors"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}

        {/* DOMAIN + SETTINGS */}
        {step === 'domain' && (
          <motion.div key="domain" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
            <p className="text-sm font-medium text-calm-text mb-4">Choose your domain</p>

            <div className="space-y-2 mb-5">
              {DOMAIN_FORMATS.map((fmt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDomain(i)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                    selectedDomain === i ? 'border-calm-primary bg-calm-primary/5' : 'border-calm-border hover:border-calm-primary/40'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-calm-text-muted" />
                    <div>
                      <p className="text-sm font-mono text-calm-text">{fmt.example(student.name)}</p>
                      <p className="text-[10px] text-calm-text-muted">{fmt.label}</p>
                    </div>
                  </div>
                  {selectedDomain === i && <Check className="w-4 h-4 text-calm-primary" />}
                </button>
              ))}
            </div>

            {/* Privacy toggle */}
            <div className="flex items-center justify-between p-4 bg-calm-surface-2 rounded-xl border border-calm-border mb-5">
              <div className="flex items-center gap-3">
                {isPublic ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-calm-text-muted" />}
                <div>
                  <p className="text-sm font-medium text-calm-text">{isPublic ? 'Public' : 'Private'}</p>
                  <p className="text-xs text-calm-text-muted">{isPublic ? 'Anyone with the link can view' : 'Only you can view'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublic(p => !p)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  isPublic ? 'bg-calm-primary' : 'bg-calm-surface border border-calm-border'
                )}
              >
                <div className={cn('w-3.5 h-3.5 bg-white rounded-full shadow absolute top-0.5 transition-all', isPublic ? 'left-5' : 'left-0.5')} />
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('template')} className="flex-1 py-2.5 border border-calm-border rounded-xl text-sm text-calm-text-muted hover:bg-calm-surface-2 transition-colors">
                Back
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-2.5 bg-calm-primary text-white rounded-xl text-sm font-medium hover:bg-calm-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Generate
              </button>
            </div>
          </motion.div>
        )}

        {/* GENERATING */}
        {step === 'generating' && (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[280px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-calm-primary border-t-transparent"
            />
            <div>
              <p className="font-semibold text-calm-text mb-1">Building your site...</p>
              <p className="text-xs text-calm-text-muted">Pulling profile data · Generating bio · Applying template</p>
            </div>
            <div className="flex gap-1 mt-2">
              {['Profile', 'Projects', 'Bio', 'Design', 'Domain'].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  className="text-[10px] px-2 py-0.5 bg-calm-surface-2 border border-calm-border rounded-full text-calm-text-muted"
                >
                  {s}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-6">
            {/* Live preview */}
            <div className="relative rounded-xl overflow-hidden border border-calm-border shadow-md mb-5 h-48">
              <TemplatePreview template={template} student={student} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
                <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl px-5 py-3 text-center shadow-xl border border-calm-border/50">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-semibold text-calm-text">Live at</span>
                  </div>
                  <p className="font-mono text-calm-primary font-bold text-sm">{domain}</p>
                </div>
              </div>
            </div>

            {/* Domain + copy */}
            <div className="flex items-center gap-2 p-3 bg-calm-surface-2 border border-calm-border rounded-xl mb-4">
              <Globe className="w-4 h-4 text-calm-primary shrink-0" />
              <span className="font-mono text-sm text-calm-text flex-1 truncate">{domain}</span>
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-calm-text-muted hover:text-calm-primary transition-colors px-2 py-1 rounded-lg hover:bg-calm-surface">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Sections', value: '8' },
                { label: 'Template', value: template.name },
                { label: 'Visibility', value: isPublic ? 'Public' : 'Private' },
              ].map(s => (
                <div key={s.label} className="text-center p-2.5 bg-calm-surface-2 rounded-xl border border-calm-border">
                  <p className="text-sm font-semibold text-calm-text">{s.value}</p>
                  <p className="text-[10px] text-calm-text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('template')}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-calm-border rounded-xl text-sm text-calm-text-muted hover:bg-calm-surface-2 transition-colors"
              >
                <Palette className="w-3.5 h-3.5" /> Change template
              </button>
              <button
                onClick={() => setStep('intro')}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-calm-border rounded-xl text-sm text-calm-text-muted hover:bg-calm-surface-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-calm-primary text-white rounded-xl text-sm font-medium hover:bg-calm-primary-hover transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Open site
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
