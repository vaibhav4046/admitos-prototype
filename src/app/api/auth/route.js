// Simple auth for prototype — in production use NextAuth with proper OAuth
// For demo: just switch between roles via a cookie-like header

import { NextResponse } from 'next/server';

const { query, queryOne } = require('../../../lib/db');

export async function GET(request) {
  const userId = request.headers.get('x-user-id') || 'usr_advisor_001';
  const user = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// List all users (for role switching in demo)
export async function POST(request) {
  const users = await query('SELECT id, email, name, role FROM users ORDER BY role, name');
  return NextResponse.json({ users });
}
