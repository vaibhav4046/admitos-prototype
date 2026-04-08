import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Plus, 
  Compass, 
  Users, 
  CreditCard, 
  LogIn, 
  Paperclip, 
  Globe, 
  Lightbulb, 
  ArrowUp, 
  GraduationCap,
  Play,
  CheckCircle2,
  Zap,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'home' | 'how-it-works' | 'human-expertise' | 'pricing'>('home');

  return (
    <div className="flex h-screen bg-calm-surface text-calm-text font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[68px] flex flex-col items-center py-4 border-r border-calm-border bg-calm-surface-2 shrink-0">
        {/* Logo */}
        <button onClick={() => setActiveSection('home')} className="w-10 h-10 bg-calm-surface text-calm-text border border-calm-border rounded-xl flex items-center justify-center mb-8 hover:bg-calm-surface-2 transition-colors">
          <GraduationCap className="w-6 h-6" />
        </button>

        {/* Nav Icons */}
        <nav className="flex flex-col gap-3 flex-1 w-full items-center">
          <button 
            onClick={() => setActiveSection('home')} 
            title="New Application"
            className={`p-2.5 rounded-xl transition-colors ${activeSection === 'home' ? 'bg-calm-surface-2 text-calm-text' : 'text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text'}`}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveSection('how-it-works')} 
            title="How it Works"
            className={`p-2.5 rounded-xl transition-colors ${activeSection === 'how-it-works' ? 'bg-calm-surface-2 text-calm-text' : 'text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text'}`}
          >
            <Compass className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveSection('human-expertise')} 
            title="Human Expertise"
            className={`p-2.5 rounded-xl transition-colors ${activeSection === 'human-expertise' ? 'bg-calm-surface-2 text-calm-text' : 'text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text'}`}
          >
            <Users className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveSection('pricing')} 
            title="Pricing"
            className={`p-2.5 rounded-xl transition-colors ${activeSection === 'pricing' ? 'bg-calm-surface-2 text-calm-text' : 'text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text'}`}
          >
            <CreditCard className="w-5 h-5" />
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-3 items-center mt-auto">
          <button 
            onClick={() => navigate('/auth')} 
            title="Sign In"
            className="p-2.5 rounded-xl text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text transition-colors"
          >
            <LogIn className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">

        {activeSection === 'home' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 max-w-3xl mx-auto w-full"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-calm-text mb-4">
                AdmitOS
              </h1>
              <p className="text-lg text-calm-text-muted">
                The Operating System for University Applications
              </p>
            </div>

            {/* Chat Input Box */}
            <div className="w-full bg-calm-surface border border-calm-border rounded-2xl shadow-sm p-3 focus-within:ring-1 focus-within:ring-zinc-300 transition-shadow">
              <textarea 
                placeholder="Start your admissions journey..."
                className="w-full bg-transparent border-none focus:ring-0 resize-none h-14 text-calm-text placeholder:text-calm-text-muted text-lg px-2"
                readOnly
                onClick={() => navigate('/auth')}
              />
              <div className="flex items-center justify-between mt-2 px-2">
                <div className="flex items-center gap-2 text-calm-text-muted">
                  <button className="p-1.5 hover:text-calm-text-muted hover:bg-calm-surface-2 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 hover:text-calm-text-muted hover:bg-calm-surface-2 rounded-lg transition-colors">
                    <Globe className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 hover:text-calm-text-muted hover:bg-calm-surface-2 rounded-lg transition-colors">
                    <Lightbulb className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={() => navigate('/auth')}
                  className="w-8 h-8 bg-calm-surface text-calm-text border border-calm-border rounded-lg flex items-center justify-center hover:bg-calm-surface-2 transition-colors"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-calm-border text-sm font-medium text-calm-text-muted hover:bg-calm-surface-2 transition-colors">
                <Play className="w-4 h-4" /> Demo Video
              </button>
              <button 
                onClick={() => setActiveSection('how-it-works')}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-calm-border text-sm font-medium text-calm-text-muted hover:bg-calm-surface-2 transition-colors"
              >
                <Compass className="w-4 h-4" /> How it works
              </button>
              <button 
                onClick={() => setActiveSection('pricing')}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-calm-border text-sm font-medium text-calm-text-muted hover:bg-calm-surface-2 transition-colors"
              >
                <CreditCard className="w-4 h-4" /> View pricing
              </button>
            </div>
          </motion.div>
        )}

        {activeSection === 'how-it-works' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 px-6 w-full max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">How AdmitOS Works</h2>
              <p className="text-calm-text-muted">AdmitOS transforms school applications from a confusing process into a structured system.</p>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-calm-surface text-calm-text border border-calm-border flex items-center justify-center font-medium mb-6">1</div>
                <h3 className="text-xl font-semibold mb-4">Build Your Student Profile</h3>
                <p className="text-calm-text-muted mb-6">Tell AdmitOS about:</p>
                <ul className="space-y-3 mb-8 inline-block text-left text-sm">
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> grades and predicted scores</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> academic interests</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> extracurricular activities</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> awards and achievements</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> target countries and schools</li>
                </ul>
                <p className="text-calm-text font-medium text-sm">Our AI builds a structured student readiness profile and identifies your competitive positioning.</p>
              </div>

              <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-calm-surface text-calm-text border border-calm-border flex items-center justify-center font-medium mb-6">2</div>
                <h3 className="text-xl font-semibold mb-4">Run Your AI Admissions Agent</h3>
                <p className="text-calm-text-muted mb-6">Launch your AI Admissions Agent to plan and execute key application tasks. Your AI agent can:</p>
                <ul className="space-y-3 mb-8 inline-block text-left text-sm">
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> generate a balanced school shortlist</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> build a complete application roadmap</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> create essay ideas and outlines</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> design a test preparation strategy</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> generate interview preparation plans</li>
                </ul>
                <div className="bg-calm-surface p-4 rounded-xl border border-calm-border mb-6 w-full max-w-sm">
                  <p className="text-calm-text-muted text-xs mb-2">Every task follows a transparent execution loop:</p>
                  <p className="font-mono font-medium text-calm-text text-sm">Plan → Execute → Verify → Deliver</p>
                </div>
                <p className="text-calm-text font-medium text-sm">You always see what the AI is doing and why.</p>
              </div>

              <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-calm-surface text-calm-text border border-calm-border flex items-center justify-center font-medium mb-6">3</div>
                <h3 className="text-xl font-semibold mb-4">Track Your Entire Application Journey</h3>
                <p className="text-calm-text-muted mb-6">AdmitOS organizes the full process in one system. Your dashboard includes:</p>
                <ul className="space-y-3 mb-8 inline-block text-left text-sm">
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> application milestones</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> deadlines and reminders</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> essay progress</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> test preparation plans</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> document management</li>
                  <li className="flex items-center gap-3 text-calm-text-muted"><CheckCircle2 className="w-4 h-4 text-calm-text-muted" /> submission readiness tracking</li>
                </ul>
                <p className="text-calm-text font-medium text-sm">Everything is visible, structured, and easy to follow.</p>
              </div>

              <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-calm-surface text-calm-text border border-calm-border flex items-center justify-center font-medium mb-6">4</div>
                <h3 className="text-xl font-semibold mb-4">Upgrade When Human Expertise Matters</h3>
                <p className="text-calm-text-muted mb-4">AI runs the workflow. Experts guide the critical decisions.</p>
                <p className="text-calm-text font-medium text-sm">When you need deeper support, connect with experienced specialists directly inside the platform.</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'human-expertise' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 px-6 w-full max-w-3xl mx-auto">
            {/* Human Expertise */}
            <section className="mb-24">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold tracking-tight mb-4">Human Expertise When It Matters</h2>
                <p className="text-calm-text-muted">AdmitOS combines AI execution with expert human guidance. Human services are integrated into your application workflow so support arrives exactly when it is needed.</p>
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                  <h3 className="text-xl font-semibold mb-3">Private Tutors</h3>
                  <p className="text-calm-text-muted text-sm">Top-tier subject specialists help you strengthen academic performance and prepare for key exams.</p>
                </div>
                <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                  <h3 className="text-xl font-semibold mb-3">Admissions Counsellors</h3>
                  <p className="text-calm-text-muted text-sm">Experienced admissions advisors review your strategy, school selection, and application positioning.</p>
                </div>
                <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                  <h3 className="text-xl font-semibold mb-3">Interview Coaches</h3>
                  <p className="text-calm-text-muted text-sm">Prepare for Oxbridge, Ivy League, and top institution interviews through structured mock sessions and feedback.</p>
                </div>
                <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                  <h3 className="text-xl font-semibold mb-3">Application Review Experts</h3>
                  <p className="text-calm-text-muted text-sm">Ensure your essays, personal statements, and application materials meet the highest standards before submission.</p>
                </div>
              </div>
            </section>

            {/* Why AdmitOS */}
            <section>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold tracking-tight mb-4">Why AdmitOS</h2>
                <p className="text-calm-text-muted">
                  University applications are traditionally fragmented, manual, and expensive.<br/>
                  AdmitOS replaces that system with an <strong>AI-powered execution platform</strong>.
                </p>
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-calm-surface border border-calm-border rounded-xl flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-calm-text" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">AI-Driven Workflow</h3>
                  <p className="text-calm-text-muted text-sm">From strategy to submission, every step is automated and structured.</p>
                </div>
                <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-calm-surface border border-calm-border rounded-xl flex items-center justify-center mb-6">
                    <LayoutDashboard className="w-6 h-6 text-calm-text" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Transparent Progress</h3>
                  <p className="text-calm-text-muted text-sm">Every action, decision, and milestone is tracked in your dashboard.</p>
                </div>
                <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-calm-surface border border-calm-border rounded-xl flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-calm-text" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">AI + Human Collaboration</h3>
                  <p className="text-calm-text-muted text-sm">AI handles the process. Experts guide the moments that matter.</p>
                </div>
                <div className="p-8 rounded-2xl bg-calm-surface-2 border border-calm-border flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-calm-surface border border-calm-border rounded-xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-calm-text" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">One Complete System</h3>
                  <p className="text-calm-text-muted text-sm">School selection, Application strategy, Essay planning, Test preparation, Interview readiness. All in one platform.</p>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeSection === 'pricing' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 px-6 w-full max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">Simple, Transparent Pricing</h2>
              <p className="text-calm-text-muted">Start with AI. Upgrade when you need human expertise.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl border border-calm-border bg-calm-surface">
                <h3 className="text-lg font-semibold mb-2">Basic</h3>
                <div className="text-3xl font-bold mb-2">£19<span className="text-sm text-calm-text-muted font-normal"> / month</span></div>
                <p className="text-calm-text-muted text-xs mb-6">Your AI admissions assistant.</p>
                <div className="text-xs font-semibold mb-4">Includes:</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> AI admissions agent</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> school shortlist generator</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> application roadmap</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> essay brainstorming tools</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> interview preparation framework</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> application timeline tracking</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> standard AI usage included</li>
                </ul>
                <button onClick={() => navigate('/auth')} className="w-full py-2 rounded-lg border border-calm-border text-sm font-medium hover:bg-calm-surface-2 transition-colors">Get Started</button>
              </div>
              
              <div className="p-8 rounded-2xl border border-calm-border bg-calm-surface text-calm-text relative shadow-sm">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-calm-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">POPULAR</div>
                <h3 className="text-lg font-semibold mb-2">Plus</h3>
                <div className="text-3xl font-bold mb-2">£49<span className="text-sm text-calm-text-muted font-normal"> / month</span></div>
                <p className="text-calm-text-muted text-xs mb-6">For students who want deeper AI execution.</p>
                <div className="text-xs font-semibold mb-4 text-calm-text">Includes everything in Basic plus:</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-primary shrink-0" /> additional AI agent runs</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-primary shrink-0" /> deeper school research</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-primary shrink-0" /> extended planning and document generation</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-primary shrink-0" /> pay-as-you-go AI credits for advanced tasks</li>
                </ul>
                <button onClick={() => navigate('/auth')} className="w-full py-2 rounded-lg bg-calm-primary text-white text-sm font-medium hover:bg-calm-primary-hover transition-colors">Start Plus</button>
              </div>

              <div className="p-8 rounded-2xl border border-calm-border bg-calm-surface">
                <h3 className="text-lg font-semibold mb-2">Premium</h3>
                <div className="text-xl font-bold mb-2">AI + Human Experts</div>
                <p className="text-calm-text-muted text-xs mb-6">For families who want both AI efficiency and expert guidance.</p>
                <div className="text-xs font-semibold mb-4">Includes everything in Plus plus:</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> private tutor sessions</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> admissions counsellor reviews</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> interview coaching</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> essay and application review</li>
                  <li className="flex items-start gap-3 text-calm-text-muted text-xs"><CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> priority AI usage</li>
                </ul>
                <button onClick={() => navigate('/auth')} className="w-full py-2 rounded-lg border border-calm-border text-sm font-medium hover:bg-calm-surface-2 transition-colors">Contact Sales</button>
              </div>
            </div>
          </motion.div>
        )}
        {/* Footer */}
        <footer className="mt-auto py-4 px-6 border-t border-calm-border flex items-center justify-center gap-6 text-xs text-calm-text-muted">
          <span>© 2026 Admitos Limited</span>
          <Link to="/terms" className="hover:text-calm-text transition-colors underline underline-offset-4">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-calm-text transition-colors underline underline-offset-4">
            Privacy Policy
          </Link>
        </footer>
      </main>
    </div>
  );
}
