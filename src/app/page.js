'use client';

import { useState, useEffect, useCallback } from 'react';

// -- tiny SVG icon components (saves importing a whole icon library) --
const Icons = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
  ),
  spark: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
    </svg>
  ),
  user: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
  ),
  workflow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49"/></svg>
  ),
};

function fmtState(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fmtArtifact(t) {
  return { school_list: 'School List', personal_statement: 'Personal Statement', activity_summary: 'Activity Summary' }[t] || t;
}

// ===== DASHBOARD =====
function Dashboard({ cases, user, onSelect, onNew }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const visible = cases.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    const name = (c.student_name || c.student_name_from_user || '').toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  const stats = {
    total: cases.length,
    active: cases.filter(c => c.status === 'active').length,
    attention: cases.filter(c => ['essay_review', 'school_research'].includes(c.current_state)).length,
    done: cases.filter(c => c.status === 'completed').length,
  };

  return (
    <div>
      <div className="page-header">
        <h1>Case Dashboard</h1>
        {user.role !== 'student' && (
          <button className="btn btn-primary" onClick={onNew}>{Icons.plus} New Case</button>
        )}
      </div>

      <div className="stat-grid">
        {[
          { val: stats.total, label: 'Total Cases' },
          { val: stats.active, label: 'Active' },
          { val: stats.attention, label: 'Needs Attention' },
          { val: stats.done, label: 'Completed' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input
          type="text" placeholder="Search students..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320 }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <h3>No cases found</h3>
          <p>{user.role === 'student' ? 'Your advisor will set up your case soon.' : 'Create a new case to get started.'}</p>
        </div>
      ) : (
        <div className="card-grid">
          {visible.map(c => {
            // rough progress estimate based on state order
            const stateOrder = ['intake','profile_complete','school_research','school_list_approved','essay_brainstorming','essay_drafting','essay_review','activity_list_prep','activity_list_approved','application_assembly','advisor_final_review','submitted','post_submission'];
            const idx = stateOrder.indexOf(c.current_state);
            const pct = idx >= 0 ? Math.round((idx / (stateOrder.length - 1)) * 100) : 0;

            return (
              <div key={c.id} className="case-card" onClick={() => onSelect(c.id)}>
                <div className="case-card-header">
                  <h3>{c.student_name || c.student_name_from_user || 'Unknown'}</h3>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </div>
                <div className="case-card-meta">
                  <span>{Icons.workflow} {fmtState(c.current_state)}</span>
                  <span>{Icons.calendar} {c.workflow_type === 'us_undergraduate' ? 'US Undergrad' : 'UK UCAS'}</span>
                  <span>Class of {c.target_year}</span>
                </div>
                {c.advisor_name && (
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Icons.user} {c.advisor_name}
                  </div>
                )}
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== CASE DETAIL =====
function CaseDetail({ caseId, user, onBack }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [generating, setGenerating] = useState(null);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    const r = await fetch(`/api/cases/${caseId}`, { headers: { 'x-user-id': user.id } });
    setData(await r.json());
  }, [caseId, user.id]);

  useEffect(() => { load(); }, [load]);

  async function transition(target) {
    const r = await fetch(`/api/cases/${caseId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ targetState: target }),
    });
    const j = await r.json();
    if (j.error) alert('Transition blocked: ' + j.error);
    else load();
  }

  async function generate(type) {
    setGenerating(type);
    const r = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ caseId, artifactType: type }),
    });
    const j = await r.json();
    setGenerating(null);
    if (j.error) alert('Generation error: ' + j.error);
    else load();
  }

  async function review(artifactId, action) {
    await fetch(`/api/artifacts/${artifactId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ action, comments: comment }),
    });
    setComment('');
    load();
  }

  if (!data) return <div className="loading">Loading case...</div>;
  if (!data.case) return <div className="loading">Case not found</div>;

  const { case: c, progress, artifacts, timeline } = data;
  const isAdvisor = user.role !== 'student';

  // figure out what transitions are available
  const nextStates = [];
  if (c.current_state === 'essay_review') {
    nextStates.push('essay_drafting', 'activity_list_prep');
  } else {
    const upcoming = (progress?.states || []).filter(s => s.status === 'upcoming');
    if (upcoming.length > 0) nextStates.push(upcoming[0].name);
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-outline" onClick={onBack}>{Icons.back} Back</button>
          <h1 style={{ fontSize: 22 }}>{c.student_name || c.student_name_from_user}</h1>
          <span className={`badge badge-${c.status}`}>{c.status}</span>
        </div>
        {isAdvisor && nextStates.length > 0 && (
          <div className="btn-group">
            {nextStates.map(s => (
              <button key={s} className="btn btn-primary" onClick={() => transition(s)}>
                Advance to {fmtState(s)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tabs">
        {['overview', 'artifacts', 'timeline'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="detail-layout">
        <div>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              <div className="detail-section">
                <h2>Student Profile</h2>
                <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    ['GPA', c.gpa],
                    ['SAT Score', c.sat_score],
                    ['Intended Major', c.intended_major],
                    ['Target Year', c.target_year],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{val || 'N/A'}</div>
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>Activities</div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginTop: 2 }}>
                      {JSON.parse(c.extracurriculars || '[]').join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {isAdvisor && (
                <div className="detail-section">
                  <h2>AI Generation</h2>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                    Generate artifacts using the AI pipeline. Each output goes through advisor review before the student sees it.
                  </p>
                  <div className="btn-group">
                    {['school_list', 'personal_statement', 'activity_summary'].map(type => (
                      <button key={type} className="btn btn-outline" onClick={() => generate(type)} disabled={!!generating}>
                        {generating === type ? (
                          <span className="generating">{Icons.spark} Generating...</span>
                        ) : (
                          <>{Icons.spark} {fmtArtifact(type)}</>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ARTIFACTS */}
          {tab === 'artifacts' && (
            <div className="detail-section">
              <h2>Artifacts ({artifacts?.length || 0})</h2>
              {(!artifacts || !artifacts.length) ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <h3>No artifacts yet</h3>
                  <p>Use AI generation to create school lists, essays, and activity summaries.</p>
                </div>
              ) : artifacts.map(art => (
                <div key={art.id} className="artifact-card">
                  <div className="artifact-header">
                    <h4>{fmtArtifact(art.artifact_type)} <span style={{ fontWeight: 400, color: '#9ca3af' }}>v{art.version}</span></h4>
                    <span className={`badge badge-${art.status}`}>{art.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
                    {art.model_version || 'gpt-4-turbo'} &middot; {art.token_count || 0} tokens &middot; {art.created_at}
                  </div>

                  <div className="artifact-content">
                    {art.artifact_type === 'school_list' && art.content?.schools ? (
                      art.content.schools.map((s, i) => (
                        <div key={i} className="school-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="school-name">{s.name}</span>
                            <span className={`badge badge-${s.type}`}>{s.type}</span>
                            {s.acceptance_rate && <span style={{ fontSize: 11, color: '#9ca3af' }}>({s.acceptance_rate})</span>}
                          </div>
                          <div className="school-reason">{s.reason}</div>
                        </div>
                      ))
                    ) : art.artifact_type === 'personal_statement' && art.content ? (
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>{art.content.title} ({art.content.word_count} words)</div>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                          {(art.content.content || '').substring(0, 700)}
                          {(art.content.content || '').length > 700 && '...'}
                        </div>
                      </div>
                    ) : art.artifact_type === 'activity_summary' && art.content?.activities ? (
                      art.content.activities.map((a, i) => (
                        <div key={i} className="school-item">
                          <div className="school-name">{a.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{a.position} &middot; {a.hours_per_week}h/wk &middot; {a.weeks_per_year} wks/yr</div>
                          <div className="school-reason">{a.description}</div>
                        </div>
                      ))
                    ) : (
                      <pre style={{ fontSize: 12, overflow: 'auto' }}>{JSON.stringify(art.content, null, 2)}</pre>
                    )}
                  </div>

                  {isAdvisor && art.status === 'pending_review' && (
                    <div className="review-panel">
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Review</div>
                      <textarea placeholder="Comments (optional)..." value={comment} onChange={e => setComment(e.target.value)} />
                      <div className="btn-group">
                        <button className="btn btn-success" onClick={() => review(art.id, 'approved')}>Approve</button>
                        <button className="btn btn-warning" onClick={() => review(art.id, 'revision_requested')}>Revise</button>
                        <button className="btn btn-danger" onClick={() => review(art.id, 'rejected')}>Reject</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TIMELINE */}
          {tab === 'timeline' && (
            <div className="detail-section">
              <h2>Activity Timeline</h2>
              {(!timeline || !timeline.length) ? (
                <div className="empty-state" style={{ padding: 40 }}><h3>No activity yet</h3></div>
              ) : timeline.map(entry => {
                const d = JSON.parse(entry.details || '{}');
                let desc = entry.action_type;
                if (entry.action_type === 'state_transition') desc = `${fmtState(d.from)} \u2192 ${fmtState(d.to)}`;
                else if (entry.action_type === 'artifact_created') desc = `Generated ${fmtArtifact(d.artifact_type)}`;
                else if (entry.action_type === 'approval_action') {
                  desc = d.action === 'approved' ? 'Approved artifact' : d.action === 'revision_requested' ? 'Requested revision' : 'Rejected artifact';
                  if (d.comments) desc += ` \u2014 "${d.comments}"`;
                } else if (entry.action_type === 'case_created') desc = 'Case created';

                return (
                  <div key={entry.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div><span className="timeline-actor">{entry.actor_name || 'System'}</span> {desc}</div>
                      <div className="timeline-time">{entry.created_at}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: workflow + case info */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 650, marginBottom: 14, color: '#4b5563' }}>Workflow Progress</h3>
            <div style={{ marginBottom: 14 }}>
              <div className="progress-bar-container" style={{ height: 7 }}>
                <div className="progress-bar-fill" style={{ width: `${progress?.percentComplete || 0}%` }} />
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                {progress?.percentComplete || 0}% &mdash; Step {progress?.currentStateOrder || 0} of {progress?.totalStates || 0}
              </div>
            </div>
            <div className="workflow-stages">
              {(progress?.states || []).map((s, i) => (
                <div key={i} className={`workflow-stage ${s.status}`}>
                  <div className="stage-dot" />
                  <div>
                    <div style={{ fontSize: 13 }}>{fmtState(s.name)}</div>
                    {s.status === 'current' && <div style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>{s.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 650, marginBottom: 10, color: '#4b5563' }}>Case Info</h3>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><span style={{ color: '#9ca3af' }}>Workflow:</span> {c.workflow_type === 'us_undergraduate' ? 'US Undergraduate' : 'UK UCAS'}</div>
              <div><span style={{ color: '#9ca3af' }}>Advisor:</span> {c.advisor_name || 'Unassigned'}</div>
              <div><span style={{ color: '#9ca3af' }}>Created:</span> {c.created_at}</div>
              <div><span style={{ color: '#9ca3af' }}>Updated:</span> {c.updated_at}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== APPROVALS QUEUE =====
function Approvals({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/cases', { headers: { 'x-user-id': user.id } });
      const { cases } = await r.json();
      const pending = [];
      // yeah this is an N+1 — would batch in production
      for (const c of (cases || [])) {
        const ar = await fetch(`/api/cases/${c.id}/artifacts`, { headers: { 'x-user-id': user.id } });
        const { artifacts } = await ar.json();
        for (const a of (artifacts || [])) {
          if (a.status === 'pending_review') pending.push({ ...a, studentName: c.student_name || c.student_name_from_user });
        }
      }
      setItems(pending);
      setLoading(false);
    })();
  }, [user.id]);

  if (loading) return <div className="loading">Loading approvals...</div>;

  return (
    <div>
      <div className="page-header"><h1>Pending Approvals ({items.length})</h1></div>
      {items.length === 0 ? (
        <div className="empty-state"><h3>All caught up</h3><p>Nothing waiting for your review.</p></div>
      ) : items.map(a => (
        <div key={a.id} className="artifact-card">
          <div className="artifact-header">
            <div>
              <h4>{fmtArtifact(a.artifact_type)} &mdash; {a.studentName}</h4>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>v{a.version} &middot; {a.created_at}</div>
            </div>
            <span className="badge badge-pending_review">Pending</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [view, setView] = useState('dashboard');
  const [caseId, setCaseId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/auth', { method: 'POST' });
      const { users: all } = await r.json();
      setUsers(all);
      setUser(all.find(u => u.id === 'usr_advisor_001') || all[0]);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const r = await fetch('/api/cases', { headers: { 'x-user-id': user.id } });
      const { cases: data } = await r.json();
      setCases(data || []);
    })();
  }, [user]);

  function switchUser(id) {
    setUser(users.find(u => u.id === id));
    setView('dashboard');
    setCaseId(null);
  }

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280', gap: 10 }}>
        {Icons.spark}
        <span style={{ fontSize: 16, fontWeight: 500 }}>Loading AdmitOS...</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">Admit<span>OS</span></div>
        <nav className="sidebar-nav">
          <div className={`sidebar-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => { setView('dashboard'); setCaseId(null); }}>
            {Icons.grid} Dashboard
          </div>
          {user?.role !== 'student' && (
            <div className={`sidebar-link ${view === 'approvals' ? 'active' : ''}`} onClick={() => setView('approvals')}>
              {Icons.check} Approvals
            </div>
          )}
          <div className="sidebar-link">{Icons.settings} Settings</div>
        </nav>
        <div className="sidebar-role">
          <div>Signed in as:</div>
          <div style={{ color: 'white', fontWeight: 550, margin: '4px 0 2px' }}>{user?.name}</div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>{user?.role?.replace('_', ' ')}</div>
          <select value={user?.id || ''} onChange={e => switchUser(e.target.value)}>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>)}
          </select>
        </div>
      </aside>

      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard cases={cases} user={user} onSelect={id => { setCaseId(id); setView('detail'); }}
            onNew={() => alert('New case dialog — stubbed for prototype')} />
        )}
        {view === 'detail' && caseId && (
          <CaseDetail caseId={caseId} user={user} onBack={() => { setView('dashboard'); setCaseId(null); }} />
        )}
        {view === 'approvals' && <Approvals user={user} />}
      </main>
    </div>
  );
}
