import { NextResponse } from "next/server";
import { verifyTeacher } from "../_auth";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = body.code || "";
  const key = body.key || "";
  const submissionId = body.submissionId || "";
  const auth = await verifyTeacher(code, key);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!submissionId) return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("submissions")
    .update({ status: "hidden" })
    .eq("id", submissionId)
    .eq("room_id", auth.roomId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
