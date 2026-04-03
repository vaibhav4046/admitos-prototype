import { NextResponse } from 'next/server';

const { generateSchoolList, generatePersonalStatement, generateActivitySummary } = require('../../../../lib/ai-service');

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  const { caseId, artifactType, options = {} } = body;

  if (!caseId || !artifactType) {
    return NextResponse.json(
      { error: 'caseId and artifactType are required' },
      { status: 400 }
    );
  }

  try {
    let result;

    switch (artifactType) {
      case 'school_list':
        result = await generateSchoolList(caseId);
        break;
      case 'personal_statement':
        result = await generatePersonalStatement(caseId, options.promptTopic);
        break;
      case 'activity_summary':
        result = await generateActivitySummary(caseId);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown artifact type: ${artifactType}. Supported: school_list, personal_statement, activity_summary` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
