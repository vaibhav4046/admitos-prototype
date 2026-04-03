import { NextResponse } from 'next/server';

const workflowEngine = require('../../../../../lib/workflow-engine');

// POST /api/cases/:id/transition — trigger a state transition
export async function POST(request, { params }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id') || 'usr_advisor_001';
  const body = await request.json();
  const { targetState } = body;

  if (!targetState) {
    return NextResponse.json({ error: 'targetState is required' }, { status: 400 });
  }

  try {
    // First check if the transition is valid
    const check = await workflowEngine.canTransition(id, targetState);
    if (!check.valid) {
      return NextResponse.json({ error: check.reason }, { status: 422 });
    }

    // Execute the transition
    const result = await workflowEngine.transition(id, targetState, userId);
    return NextResponse.json({ success: true, transition: result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
}
