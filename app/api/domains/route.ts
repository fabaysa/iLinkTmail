import { NextResponse } from "next/server";
import { addCustomDomain, DomainInputError, listAvailableDomains } from "@/lib/domains";
import { consumeDomainAddLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const domains = await listAvailableDomains();
    return NextResponse.json({ domains });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memuat daftar domain." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await consumeDomainAddLimit(request))) {
      return NextResponse.json(
        { error: "Batas penambahan domain tercapai. Coba lagi nanti." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = await addCustomDomain(body.domain);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof DomainInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menambahkan domain." },
      { status: 500 },
    );
  }
}
