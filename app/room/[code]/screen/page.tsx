"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import MarkdownView from "../../../components/MarkdownView";


type Room={id:string;code:string};
type Submission={id:string;kind:"note"|"code";language:string|null;content:string;display_name:string|null;created_at:string;status:"approved";};

export default function Screen({params}:{params:{code:string}}){
  const code=params.code;
  const [room,setRoom]=useState<Room|null>(null);
  const [approved,setApproved]=useState<Submission[]>([]);
  const [loading,setLoading]=useState(true);

  const load=async()=>{
    setLoading(true);
    const {data:r,error:re}=await supabase.from("rooms").select("id,code").eq("code",code).maybeSingle();
    if(re) { alert(re.message); setLoading(false); return; }
    if(!r) { alert("Room not found."); setLoading(false); return; }
    setRoom(r as Room);

    const {data:a,error:ae}=await supabase.from("submissions")
      .select("id,kind,language,content,display_name,created_at,status")
      .eq("room_id",(r as any).id).eq("status","approved")
      .order("created_at",{ascending:false}).limit(20);
    if(!ae) setApproved((a||[]) as Submission[]);
    setLoading(false);
  };

  useEffect(()=>{ load(); },[code]);

  useEffect(()=>{
    if(!room) return;
    const ch=supabase.channel(`screen:${room.id}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"submissions",filter:`room_id=eq.${room.id} and status=eq.approved`},()=>load())
      .subscribe();
    return ()=>{ supabase.removeChannel(ch); };
  },[room?.id]);

  const current=approved[0];

  return (
    <main className="screen">
      <div className="bg" aria-hidden="true" />
      <div className="screenHeader">
        <h1>Room {code}</h1>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <div className="pill">Projector mode</div>
        </div>
      </div>
      <div className="screenCard">
        {loading && <div className="muted">Loading…</div>}
        {!loading && approved.length === 0 && <div className="muted">Nothing approved yet. Waiting for teacher…</div>}
        {approved.length > 0 && (
          <div className="list">
            {approved.slice(0, 5).map((submission) => (
              <div key={submission.id} className="item">
                <div className="itemTop">
                  <div>
                    <b style={{fontSize:14}}>{submission.kind==="code"?"Code":"Note"}</b>
                    <span className="muted" style={{marginLeft:8}}>{submission.display_name?`• ${submission.display_name}`:"• anonymous"}</span>
                  </div>
                  <div className="pill">{new Date(submission.created_at).toLocaleTimeString()}</div>
                </div>
                {submission.kind==="note" ? (
                  <MarkdownView content={submission.content} />
                ) : (
                  <pre className="output" style={{background:"rgba(16,18,22,0.92)",color:"rgba(255,255,255,0.88)"}}>{submission.content}</pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="tiny">Showing last 5 approved submissions (updates live).</div>
    </main>
  );
}
