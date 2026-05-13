import { NextResponse } from 'next/server';

const ALLOWED_EMAILS = [
  'grosso.andrea@gmail.com',
  'baldi.marzia@gmail.com'
];

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ allowed: false }, { status: 400 });
    }

    const isAllowed = ALLOWED_EMAILS.includes(email.toLowerCase());

    return NextResponse.json({ allowed: isAllowed });
  } catch (error) {
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}
