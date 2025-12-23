import { supabaseAdmin } from "../../../lib/supabaseServer";
export async function verifyTeacher(code: string, key: string): Promise<{ roomId: string } | null> {
  const { data: room } = await supabaseAdmin.from("rooms").select("id").eq("code", code).maybeSingle();
  if (!room) return null;
  const { data: secret } = await supabaseAdmin.from("room_secrets").select("teacher_key, room_id").eq("room_id", room.id).maybeSingle();
  if (!secret) return null;
  if (secret.teacher_key !== key) return null;
  return { roomId: room.id };
}
