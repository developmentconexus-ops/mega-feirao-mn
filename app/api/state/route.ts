import { NextRequest, NextResponse } from "next/server";
import { readState, sortQueue, updateSellerStatus, type SellerStatus } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const sellers = await readState();
  return NextResponse.json({ sellers, queue: sortQueue(sellers) });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; status?: SellerStatus };
    if (!body.username || !body.status || !["available", "busy"].includes(body.status)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const sellers = await updateSellerStatus(body.username, body.status);
    return NextResponse.json({ sellers, queue: sortQueue(sellers) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
