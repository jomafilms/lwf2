import { NextRequest, NextResponse } from "next/server";

const LWF_API_BASE =
  process.env.NEXT_PUBLIC_LWF_API_BASE || "https://lwf-api.vercel.app/api/v2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${LWF_API_BASE}/plants/${id}`);
    if (!res.ok) {
      return NextResponse.json(
        { error: `LWF API returned ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from LWF API" },
      { status: 502 }
    );
  }
}
