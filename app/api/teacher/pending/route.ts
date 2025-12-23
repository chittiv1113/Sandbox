import { NextResponse } from "next/server";
import { verifyTeacher } from "../_auth";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";
  const key = url.searchParams.get("key") || "";
  const auth = await verifyTeacher(code, key);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select("id, display_name, kind, language, content, status, created_at")
    .eq("room_id", auth.roomId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
