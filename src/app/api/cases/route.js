import { NextResponse } from 'next/server';

const { query, queryOne, execute } = require('../../../lib/db');

// GET /api/cases — list cases filtered by role
export async function GET(request) {
  const userId = request.headers.get('x-user-id') || 'usr_advisor_001';
  const user = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let cases;
  if (user.role === 'admin' || user.role === 'senior_advisor') {
    cases = await query(`
      SELECT c.*,
        sp.student_name,
        u_advisor.name as advisor_name,
        u_student.name as student_name_from_user
      FROM cases c
      LEFT JOIN student_profiles sp ON sp.case_id = c.id
      LEFT JOIN users u_advisor ON u_advisor.id = c.advisor_id
      LEFT JOIN users u_student ON u_student.id = c.student_id
      ORDER BY c.updated_at DESC
    `);
  } else if (user.role === 'advisor') {
    cases = await query(`
      SELECT c.*,
        sp.student_name,
        u_student.name as student_name_from_user
      FROM cases c
      LEFT JOIN student_profiles sp ON sp.case_id = c.id
      LEFT JOIN users u_student ON u_student.id = c.student_id
      WHERE c.advisor_id = ?
      ORDER BY c.updated_at DESC
    `, [userId]);
  } else {
    // Student — only sees their own case
    cases = await query(`
      SELECT c.*,
        sp.student_name,
        u_advisor.name as advisor_name
      FROM cases c
      LEFT JOIN student_profiles sp ON sp.case_id = c.id
      LEFT JOIN users u_advisor ON u_advisor.id = c.advisor_id
      WHERE c.student_id = ?
      ORDER BY c.updated_at DESC
    `, [userId]);
  }

  return NextResponse.json({ cases });
}

// POST /api/cases — create a new case
export async function POST(request) {
  const userId = request.headers.get('x-user-id') || 'usr_advisor_001';
  const user = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);

  if (!user || user.role === 'student') {
    return NextResponse.json({ error: 'Only advisors and admins can create cases' }, { status: 403 });
  }

  const body = await request.json();
  const { studentId, workflowType = 'us_undergraduate', targetYear = 2026 } = body;

  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
  }

  const caseId = `case_${Date.now()}`;
  await execute(
    'INSERT INTO cases (id, student_id, advisor_id, workflow_type, current_state, status, target_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [caseId, studentId, userId, workflowType, 'intake', 'active', targetYear]
  );

  // Create empty profile
  await execute(
    'INSERT INTO student_profiles (id, case_id) VALUES (?, ?)',
    [crypto.randomUUID(), caseId]
  );

  // Audit log
  await execute(
    'INSERT INTO audit_log (id, case_id, actor_id, action_type, details) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), caseId, userId, 'case_created', JSON.stringify({ student_id: studentId, workflow_type: workflowType })]
  );

  return NextResponse.json({ caseId }, { status: 201 });
}
