// sql.js gives us SQLite in-memory via WASM — no native build deps
// swap for pg/Prisma when deploying to real infra

let db = null;

async function getDb() {
  if (db) return db;

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'senior_advisor', 'advisor', 'student')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id),
      advisor_id TEXT NOT NULL REFERENCES users(id),
      workflow_type TEXT NOT NULL DEFAULT 'us_undergraduate',
      current_state TEXT NOT NULL DEFAULT 'intake',
      status TEXT NOT NULL DEFAULT 'active',
      target_year INTEGER NOT NULL DEFAULT 2026,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      case_id TEXT UNIQUE NOT NULL REFERENCES cases(id),
      student_name TEXT NOT NULL DEFAULT '',
      gpa TEXT DEFAULT '',
      sat_score TEXT DEFAULT '',
      act_score TEXT DEFAULT '',
      intended_major TEXT DEFAULT '',
      extracurriculars TEXT DEFAULT '[]',
      preferences TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS workflow_definitions (
      id TEXT PRIMARY KEY,
      workflow_type TEXT NOT NULL,
      state_name TEXT NOT NULL,
      state_order INTEGER NOT NULL,
      allowed_transitions TEXT NOT NULL DEFAULT '[]',
      required_artifacts TEXT NOT NULL DEFAULT '[]',
      description TEXT,
      UNIQUE(workflow_type, state_name)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      artifact_type TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      content TEXT NOT NULL DEFAULT '{}',
      prompt_used TEXT,
      model_version TEXT,
      token_count INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now')),
      created_by TEXT REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      artifact_id TEXT NOT NULL REFERENCES artifacts(id),
      reviewer_id TEXT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL CHECK (action IN ('approved', 'revision_requested', 'rejected')),
      comments TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      case_id TEXT REFERENCES cases(id),
      actor_id TEXT REFERENCES users(id),
      action_type TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Seed workflow definitions for US undergraduate
  const usStates = [
    { name: 'intake', order: 1, transitions: ['profile_complete'], artifacts: [], desc: 'Initial case creation and student onboarding' },
    { name: 'profile_complete', order: 2, transitions: ['school_research'], artifacts: [], desc: 'Student profile fully filled out' },
    { name: 'school_research', order: 3, transitions: ['school_list_approved'], artifacts: ['school_list'], desc: 'AI generates school recommendations' },
    { name: 'school_list_approved', order: 4, transitions: ['essay_brainstorming'], artifacts: [], desc: 'Advisor approved the school list' },
    { name: 'essay_brainstorming', order: 5, transitions: ['essay_drafting'], artifacts: [], desc: 'Student and advisor discuss essay topics' },
    { name: 'essay_drafting', order: 6, transitions: ['essay_review'], artifacts: ['personal_statement'], desc: 'AI assists with essay drafts' },
    { name: 'essay_review', order: 7, transitions: ['activity_list_prep', 'essay_drafting'], artifacts: [], desc: 'Advisor reviews essays' },
    { name: 'activity_list_prep', order: 8, transitions: ['activity_list_approved'], artifacts: ['activity_summary'], desc: 'AI helps format activity list' },
    { name: 'activity_list_approved', order: 9, transitions: ['application_assembly'], artifacts: [], desc: 'Activity list finalised' },
    { name: 'application_assembly', order: 10, transitions: ['advisor_final_review'], artifacts: [], desc: 'All materials compiled' },
    { name: 'advisor_final_review', order: 11, transitions: ['submitted'], artifacts: [], desc: 'Final advisor sign-off' },
    { name: 'submitted', order: 12, transitions: ['post_submission'], artifacts: [], desc: 'Applications submitted' },
    { name: 'post_submission', order: 13, transitions: [], artifacts: [], desc: 'Monitoring results and interviews' },
  ];

  const stmtCheck = db.prepare('SELECT COUNT(*) as cnt FROM workflow_definitions WHERE workflow_type = ?');
  stmtCheck.bind(['us_undergraduate']);
  stmtCheck.step();
  const count = stmtCheck.getAsObject().cnt;
  stmtCheck.free();

  if (count === 0) {
    const stmt = db.prepare('INSERT INTO workflow_definitions (id, workflow_type, state_name, state_order, allowed_transitions, required_artifacts, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const s of usStates) {
      stmt.run([crypto.randomUUID(), 'us_undergraduate', s.name, s.order, JSON.stringify(s.transitions), JSON.stringify(s.artifacts), s.desc]);
    }
    stmt.free();
  }

  // Seed demo users
  const seedUserCheck = db.prepare('SELECT COUNT(*) as cnt FROM users');
  seedUserCheck.step();
  const userCount = seedUserCheck.getAsObject().cnt;
  seedUserCheck.free();

  if (userCount === 0) {
    db.run(`INSERT INTO users (id, email, name, role) VALUES
      ('usr_admin_001', 'admin@admitos.dev', 'Sarah Chen', 'admin'),
      ('usr_advisor_001', 'advisor@admitos.dev', 'James Wright', 'advisor'),
      ('usr_advisor_002', 'advisor2@admitos.dev', 'Maria Garcia', 'senior_advisor'),
      ('usr_student_001', 'student@admitos.dev', 'Alex Kumar', 'student'),
      ('usr_student_002', 'student2@admitos.dev', 'Emily Zhang', 'student'),
      ('usr_student_003', 'student3@admitos.dev', 'Tom Wilson', 'student')
    `);

    // Seed demo cases
    db.run(`INSERT INTO cases (id, student_id, advisor_id, workflow_type, current_state, status, target_year) VALUES
      ('case_001', 'usr_student_001', 'usr_advisor_001', 'us_undergraduate', 'essay_drafting', 'active', 2026),
      ('case_002', 'usr_student_002', 'usr_advisor_001', 'us_undergraduate', 'school_research', 'active', 2026),
      ('case_003', 'usr_student_003', 'usr_advisor_002', 'us_undergraduate', 'intake', 'active', 2027)
    `);

    // Seed student profiles
    db.run(`INSERT INTO student_profiles (id, case_id, student_name, gpa, sat_score, intended_major, extracurriculars) VALUES
      ('prof_001', 'case_001', 'Alex Kumar', '3.85', '1520', 'Computer Science', '["Robotics Club President", "Math Olympiad - State Level", "Open Source Contributor", "Volunteer Tutor"]'),
      ('prof_002', 'case_002', 'Emily Zhang', '3.92', '1490', 'Biomedical Engineering', '["Research Assistant - Oncology Lab", "Science Bowl Captain", "Hospital Volunteer", "Piano - Grade 8"]'),
      ('prof_003', 'case_003', 'Tom Wilson', '3.60', '', 'Business', '["Student Government VP", "Startup Weekend Winner", "Debate Team"]')
    `);

    // Seed some artifacts
    db.run(`INSERT INTO artifacts (id, case_id, artifact_type, version, content, status, created_by, model_version, token_count) VALUES
      ('art_001', 'case_001', 'school_list', 1, '${JSON.stringify(JSON.stringify({
        schools: [
          { name: 'MIT', type: 'reach', reason: 'Strong CS program, matches robotics background, SAT in range for competitive applicant' },
          { name: 'Georgia Tech', type: 'target', reason: 'Top CS program, good match for GPA/SAT profile, strong robotics community' },
          { name: 'University of Michigan', type: 'target', reason: 'Excellent CS department, collaborative research opportunities' },
          { name: 'Purdue University', type: 'safety', reason: 'Solid CS program, high admit rate for this profile, good value' },
          { name: 'UC San Diego', type: 'target', reason: 'Strong in AI/ML research, good campus culture for CS students' },
        ]
      }))}', 'approved', 'usr_advisor_001', 'gpt-4-turbo', 2150),
      ('art_002', 'case_001', 'personal_statement', 1, '${JSON.stringify(JSON.stringify({
        title: 'The Robot That Taught Me to Listen',
        content: 'The first robot I built was a disaster. Three servo motors, a tangle of wires, and an Arduino that kept resetting itself mid-movement...',
        word_count: 487,
        prompt_topic: 'Common App Prompt 2: Learning from obstacles'
      }))}', 'pending_review', 'usr_advisor_001', 'gpt-4-turbo', 3200)
    `);

    // Seed audit log entries
    db.run(`INSERT INTO audit_log (id, case_id, actor_id, action_type, details) VALUES
      ('log_001', 'case_001', 'usr_advisor_001', 'case_created', '{"note": "New case for Alex Kumar - Fall 2026 cycle"}'),
      ('log_002', 'case_001', 'usr_advisor_001', 'state_transition', '{"from": "intake", "to": "profile_complete"}'),
      ('log_003', 'case_001', 'usr_advisor_001', 'state_transition', '{"from": "profile_complete", "to": "school_research"}'),
      ('log_004', 'case_001', 'usr_advisor_001', 'artifact_created', '{"artifact_type": "school_list", "artifact_id": "art_001"}'),
      ('log_005', 'case_001', 'usr_advisor_001', 'approval_action', '{"artifact_id": "art_001", "action": "approved"}'),
      ('log_006', 'case_001', 'usr_advisor_001', 'state_transition', '{"from": "school_research", "to": "school_list_approved"}'),
      ('log_007', 'case_001', 'usr_advisor_001', 'state_transition', '{"from": "school_list_approved", "to": "essay_brainstorming"}'),
      ('log_008', 'case_001', 'usr_advisor_001', 'state_transition', '{"from": "essay_brainstorming", "to": "essay_drafting"}'),
      ('log_009', 'case_001', 'usr_advisor_001', 'artifact_created', '{"artifact_type": "personal_statement", "artifact_id": "art_002"}')
    `);
  }

  return db;
}

// Helper to run a query and get all results as objects
async function query(sql, params = []) {
  const database = await getDb();
  const stmt = database.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper to run a single row query
async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  return results[0] || null;
}

// Helper to run an insert/update/delete
async function execute(sql, params = []) {
  const database = await getDb();
  database.run(sql, params);
}

module.exports = { getDb, query, queryOne, execute };
