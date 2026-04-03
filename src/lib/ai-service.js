// Abstraction layer for LLM provider calls
// Swap OpenAI / Claude / local model by changing the provider config, not the calling code

const { queryOne, execute } = require('./db');

// TODO: wire up actual OpenAI client here — for now returns simulated output
// keeping the interface identical so the switch is painless
async function callLLM(prompt, options = {}) {
  const { model = 'gpt-4-turbo', temperature = 0.7, maxTokens = 2000 } = options;

  // Simulate network latency (1-3s)
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Return the prompt for audit trail purposes
  return {
    model,
    promptUsed: prompt,
    tokenCount: Math.floor(prompt.length / 4) + Math.floor(Math.random() * 500),
  };
}

// Generate a school list based on student profile
async function generateSchoolList(caseId) {
  const profile = await queryOne('SELECT * FROM student_profiles WHERE case_id = ?', [caseId]);
  if (!profile) throw new Error('No student profile found for this case');

  const caseData = await queryOne('SELECT * FROM cases WHERE id = ?', [caseId]);

  const prompt = `Given this student profile:
- Name: ${profile.student_name}
- GPA: ${profile.gpa}
- SAT: ${profile.sat_score}
- Intended Major: ${profile.intended_major}
- Activities: ${profile.extracurriculars}

Generate a balanced college list with reach, target, and safety schools for US undergraduate admissions.
Return as JSON with fields: schools (array of {name, type, reason, acceptance_rate}).`;

  const llmResult = await callLLM(prompt);

  // reach/target/safety ratio depends on how strong the profile is
  const gpa = parseFloat(profile.gpa) || 3.5;
  const sat = parseInt(profile.sat_score) || 1400;
  const major = profile.intended_major || 'Undeclared';

  const schoolPools = {
    reach: [
      { name: 'MIT', rate: '4%', strength: 'STEM research, innovation culture' },
      { name: 'Stanford University', rate: '4%', strength: 'Interdisciplinary programs, Silicon Valley proximity' },
      { name: 'Harvard University', rate: '3%', strength: 'Liberal arts foundation, vast alumni network' },
      { name: 'Columbia University', rate: '4%', strength: 'Core curriculum, NYC location' },
      { name: 'Caltech', rate: '3%', strength: 'Small cohort, intense STEM focus' },
    ],
    target: [
      { name: 'Georgia Institute of Technology', rate: '17%', strength: 'Top engineering, co-op programs' },
      { name: 'University of Michigan', rate: '20%', strength: 'Research opportunities, strong alumni' },
      { name: 'UC Berkeley', rate: '14%', strength: 'Public university excellence, Bay Area' },
      { name: 'University of Illinois Urbana-Champaign', rate: '45%', strength: 'Top CS program, affordable' },
      { name: 'UC San Diego', rate: '24%', strength: 'AI/ML research, growing campus' },
    ],
    safety: [
      { name: 'Purdue University', rate: '53%', strength: 'Engineering tradition, strong placement' },
      { name: 'Arizona State University', rate: '88%', strength: 'Innovation focus, Barrett Honors College' },
      { name: 'University of Pittsburgh', rate: '57%', strength: 'Research university, reasonable cost' },
      { name: 'Virginia Tech', rate: '57%', strength: 'Engineering culture, beautiful campus' },
      { name: 'Iowa State University', rate: '91%', strength: 'STEM programs, low cost of living' },
    ],
  };

  // Pick schools based on profile strength
  const numReach = gpa > 3.8 && sat > 1500 ? 3 : 2;
  const numTarget = 3;
  const numSafety = 2;

  const selectedSchools = [
    ...schoolPools.reach.slice(0, numReach).map((s) => ({
      name: s.name,
      type: 'reach',
      acceptance_rate: s.rate,
      reason: `${s.strength}. Strong fit for ${major} given GPA of ${gpa} and SAT of ${sat}. Competitive but worth pursuing.`,
    })),
    ...schoolPools.target.slice(0, numTarget).map((s) => ({
      name: s.name,
      type: 'target',
      acceptance_rate: s.rate,
      reason: `${s.strength}. Good match for academic profile. Realistic admission chances for ${major}.`,
    })),
    ...schoolPools.safety.slice(0, numSafety).map((s) => ({
      name: s.name,
      type: 'safety',
      acceptance_rate: s.rate,
      reason: `${s.strength}. Strong admit probability. Solid ${major} program with good outcomes.`,
    })),
  ];

  const content = { schools: selectedSchools, generatedFor: profile.student_name, major };

  // Store artifact
  const artifactId = crypto.randomUUID();
  await execute(
    'INSERT INTO artifacts (id, case_id, artifact_type, version, content, prompt_used, model_version, token_count, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [artifactId, caseId, 'school_list', 1, JSON.stringify(content), llmResult.promptUsed, llmResult.model, llmResult.tokenCount, 'pending_review', null]
  );

  await execute(
    'INSERT INTO audit_log (id, case_id, actor_id, action_type, details) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), caseId, null, 'artifact_created', JSON.stringify({ artifact_type: 'school_list', artifact_id: artifactId })]
  );

  return { artifactId, content };
}

// Generate a personal statement draft
async function generatePersonalStatement(caseId, promptTopic = 'Common App Prompt 2: Learning from obstacles') {
  const profile = await queryOne('SELECT * FROM student_profiles WHERE case_id = ?', [caseId]);
  if (!profile) throw new Error('No student profile found for this case');

  const prompt = `Write a personal statement draft for:
- Name: ${profile.student_name}
- Major Interest: ${profile.intended_major}
- Activities: ${profile.extracurriculars}
- Essay Prompt: ${promptTopic}

Write a compelling 500-word personal statement that weaves together their activities and academic interests.`;

  const llmResult = await callLLM(prompt);

  const activities = JSON.parse(profile.extracurriculars || '[]');
  // pull out just a short label for the essay, not the full activity name
  const mainInterest = (activities[0] || 'my extracurriculars').split(' - ')[0].toLowerCase();
  const major = profile.intended_major || 'technology';

  // NOTE: in production the LLM generates this from the prompt above.
  // this is a hardcoded demo so the prototype runs without an API key.
  const essayContent = `The first time I tried to build something that actually mattered, I failed spectacularly.

It was sophomore year. I had been involved in ${mainInterest} long enough to think I knew what I was doing, and my growing interest in ${major.toLowerCase()} only made me more confident. I spent months preparing — reading late, running through scenarios, building rough prototypes. Theory felt solid. Practice would prove otherwise.

When the moment came nothing went right. The system I put together fell apart in ways I had not even considered. And looking back, it was not a technical failure. I had been so fixated on the end result that I skipped the unglamorous work: testing edge cases, asking for a second opinion, sitting with the parts I did not understand instead of routing around them.

That stuck with me for weeks. Not because it was embarrassing (it was) but because it showed me a gap between who I thought I was and who I actually was. I liked the idea of solving hard problems more than I liked the patience required to actually solve them.

So I changed how I worked. I went back to basics. I started asking questions I would have been too proud to ask before — in ${mainInterest}, in my classes, everywhere. I watched the people who were better than me and noticed they were not flashier. They were just more methodical. More patient. Curious in a quieter way.

Over the next year I rebuilt what I had broken, this time testing each piece before putting them together. I kept notes on what went wrong so I would not repeat it. I ran my work past three different people before calling it done. The result was not perfect, but it was solid — and it felt like mine in a way the first version never did.

${major !== 'technology' ? `That experience is a big part of why I want to study ${major}. The field rewards bold thinking but the work that actually lasts gets built on careful foundations. I am drawn to the space between theory and application — understanding why something works, not just observing that it does.` : ''}

The lesson I keep coming back to is simple: you have to be willing to be bad at something long enough to get good at it. Nobody puts that on an inspirational poster. But it is the truest thing I know, and it is the foundation I want to build on going forward.`;

  const content = {
    title: 'Learning to Build (by breaking things first)',
    content: essayContent,
    word_count: essayContent.split(/\s+/).length,
    prompt_topic: promptTopic,
    student_name: profile.student_name,
  };

  const artifactId = crypto.randomUUID();
  await execute(
    'INSERT INTO artifacts (id, case_id, artifact_type, version, content, prompt_used, model_version, token_count, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [artifactId, caseId, 'personal_statement', 1, JSON.stringify(content), llmResult.promptUsed, llmResult.model, llmResult.tokenCount, 'pending_review', null]
  );

  await execute(
    'INSERT INTO audit_log (id, case_id, actor_id, action_type, details) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), caseId, null, 'artifact_created', JSON.stringify({ artifact_type: 'personal_statement', artifact_id: artifactId })]
  );

  return { artifactId, content };
}

// Generate activity list summary
async function generateActivitySummary(caseId) {
  const profile = await queryOne('SELECT * FROM student_profiles WHERE case_id = ?', [caseId]);
  if (!profile) throw new Error('No student profile found for this case');

  const activities = JSON.parse(profile.extracurriculars || '[]');
  const llmResult = await callLLM(`Summarize these activities concisely for a college application: ${activities.join(', ')}`);

  // quick descriptions keyed off keywords in the activity name
  const descTemplates = [
    (a) => `Led planning and execution for ${a.split(' - ')[0].toLowerCase()} events and initiatives.`,
    (a) => `Competed at regional/state level; coordinated team practice schedules and strategy sessions.`,
    (a) => `Contributed regularly to projects and mentored newer members joining the group.`,
    (a) => `Organised community outreach tied to ${a.split(' ').slice(0, 2).join(' ').toLowerCase()}.`,
  ];

  const content = {
    activities: activities.map((act, i) => ({
      name: act,
      position: i === 0 ? 'President / Lead' : i === 1 ? 'Captain' : 'Member',
      hours_per_week: 4 + Math.floor(Math.random() * 8),
      weeks_per_year: 20 + Math.floor(Math.random() * 28),
      description: descTemplates[i % descTemplates.length](act),
    })),
    student_name: profile.student_name,
  };

  const artifactId = crypto.randomUUID();
  await execute(
    'INSERT INTO artifacts (id, case_id, artifact_type, version, content, prompt_used, model_version, token_count, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [artifactId, caseId, 'activity_summary', 1, JSON.stringify(content), llmResult.promptUsed, llmResult.model, llmResult.tokenCount, 'pending_review', null]
  );

  await execute(
    'INSERT INTO audit_log (id, case_id, actor_id, action_type, details) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), caseId, null, 'artifact_created', JSON.stringify({ artifact_type: 'activity_summary', artifact_id: artifactId })]
  );

  return { artifactId, content };
}

module.exports = { generateSchoolList, generatePersonalStatement, generateActivitySummary };
