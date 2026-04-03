import { NextResponse } from 'next/server';

const { query } = require('../../../../../lib/db');

// GET /api/cases/:id/artifacts — list artifacts for a case
export async function GET(request, { params }) {
  const { id } = params;

  const artifacts = await query(
    'SELECT * FROM artifacts WHERE case_id = ? ORDER BY created_at DESC',
    [id]
  );

  return NextResponse.json({
    artifacts: artifacts.map((a) => ({
      ...a,
      content: JSON.parse(a.content || '{}'),
    })),
  });
}
