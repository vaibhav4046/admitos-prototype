import { NextResponse } from 'next/server';

const { query, queryOne } = require('../../../../lib/db');
const workflowEngine = require('../../../../lib/workflow-engine');

// GET /api/cases/:id — full case detail
export async function GET(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id') || 'usr_advisor_001';

  const caseData = await queryOne(`
    SELECT c.*,
      sp.student_name, sp.gpa, sp.sat_score, sp.act_score,
      sp.intended_major, sp.extracurriculars, sp.preferences,
      u_advisor.name as advisor_name,
      u_student.name as student_name_from_user,
      u_student.email as student_email
    FROM cases c
    LEFT JOIN student_profiles sp ON sp.case_id = c.id
    LEFT JOIN users u_advisor ON u_advisor.id = c.advisor_id
    LEFT JOIN users u_student ON u_student.id = c.student_id
    WHERE c.id = ?
  `, [id]);

  if (!caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  // Get workflow progress
  const progress = await workflowEngine.getCaseProgress(id);

  // Get artifacts
  const artifacts = await query(
    'SELECT * FROM artifacts WHERE case_id = ? ORDER BY created_at DESC',
    [id]
  );

  // Get audit log (recent 20 entries)
  const timeline = await query(`
    SELECT al.*, u.name as actor_name
    FROM audit_log al
    LEFT JOIN users u ON u.id = al.actor_id
    WHERE al.case_id = ?
    ORDER BY al.created_at DESC
    LIMIT 20
  `, [id]);

  return NextResponse.json({
    case: caseData,
    progress,
    artifacts: artifacts.map((a) => ({ ...a, content: JSON.parse(a.content || '{}') })),
    timeline,
  });
}
