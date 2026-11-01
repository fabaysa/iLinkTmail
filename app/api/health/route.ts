import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ ok: true, service: "ilink-tempmail", time: new Date().toISOString() }); }
