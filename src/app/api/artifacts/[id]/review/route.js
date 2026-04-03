import { NextResponse } from 'next/server';

const { queryOne, execute } = require('../../../../../lib/db');

// POST /api/artifacts/:id/review — approve, request revision, or reject an artifact
export async function POST(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id') || 'usr_advisor_001';
  const body = await request.json();
  const { action, comments = '' } = body;

  if (!['approved', 'revision_requested', 'rejected'].includes(action)) {
    return NextResponse.json(
      { error: 'action must be one of: approved, revision_requested, rejected' },
      { status: 400 }
    );
  }

  const artifact = await queryOne('SELECT * FROM artifacts WHERE id = ?', [id]);
  if (!artifact) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
  }

  // Update artifact status
  const newStatus = action === 'approved' ? 'approved' : action === 'revision_requested' ? 'revision_requested' : 'rejected';
  await execute(
    'UPDATE artifacts SET status = ? WHERE id = ?',
    [newStatus, id]
  );

  // Create approval record
  await execute(
    'INSERT INTO approvals (id, artifact_id, reviewer_id, action, comments) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), id, userId, action, comments]
  );

  // Audit log
  await execute(
    'INSERT INTO audit_log (id, case_id, actor_id, action_type, details) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), artifact.case_id, userId, 'approval_action', JSON.stringify({ artifact_id: id, action, comments })]
  );

  return NextResponse.json({ success: true, newStatus });
}
