"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function StudentJoinPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const code = roomCode.trim().toUpperCase();

      if (!code) {
        setError("Please enter a room code");
        setLoading(false);
        return;
      }

      // Validate room code exists in database
      const { data, error: dbError } = await supabase
        .from("rooms")
        .select("id")
        .eq("code", code)
        .maybeSingle();

      if (dbError || !data) {
        setError("Invalid room code. Please check and try again.");
        setLoading(false);
        return;
      }

      // Redirect to the room's notes/code page
      router.push(`/room/${code}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="wrap">
      <div className="bg" aria-hidden="true" />
      <div className="topbar">
        <div className="brand">Sandbox <span className="pill">Teacher moderated</span></div>
      </div>
      <div className="card" style={{ margin: "0 auto", maxWidth: "500px" }}>
        <div className="inner">
          <h2>Join a Room</h2>
          <p className="muted">Enter the room code provided by your teacher.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="roomCode">Room Code</label>
              <input
                id="roomCode"
                type="text"
                placeholder="e.g., ABC123"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setError("");
                }}
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <p style={{ color: "var(--accent)", marginBottom: "10px", fontSize: "14px" }}>
                {error}
              </p>
            )}

            <button className="btn primary" type="submit" disabled={loading} style={{width: "100%"}}>
              {loading ? "Joining..." : "Join Room"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
