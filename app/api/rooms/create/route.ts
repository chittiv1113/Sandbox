import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
import { nanoid } from "nanoid";

const makeCode = () => nanoid(6).toUpperCase().replace(/[-_]/g, "X");

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  for (let i = 0; i < 5; i++) {
    const code = makeCode();
    const teacherKey = nanoid(24);

    const { data: room, error: re } = await supabaseAdmin
      .from("rooms")
      .insert({ code })
      .select("id, code")
      .single();

    if (re) continue;

    const { error: se } = await supabaseAdmin
      .from("room_secrets")
      .insert({ room_id: room.id, teacher_key: teacherKey });

    if (se) {
      await supabaseAdmin.from("rooms").delete().eq("id", room.id);
      return NextResponse.json({ error: "Failed to create room secret" }, { status: 500 });
    }

    return NextResponse.json({
      code: room.code,
      teacherKey,
      studentUrl: `${baseUrl}/room/${room.code}`,
      screenUrl: `${baseUrl}/room/${room.code}/screen`,
      teacherUrl: `${baseUrl}/teacher/${room.code}?key=${teacherKey}`,
    });
  }
  return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
}
