"use client";
import { useState } from "react";
export default function TeacherNewRoom(){
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<null|{code:string;teacherKey:string;studentUrl:string;teacherUrl:string;screenUrl:string;}>(null);
  const [keyRevealed,setKeyRevealed]=useState(false);
  const createRoom=async()=>{
    setLoading(true); setResult(null);
    try{
      const res=await fetch("/api/rooms/create",{method:"POST"});
      const data=await res.json();
      if(!res.ok) throw new Error(data?.error||"Failed to create room");
      setResult(data);
      setKeyRevealed(false);
    }catch(e:any){ alert(e.message||"Failed"); }
    finally{ setLoading(false); }
  };
  return (
    <main className="wrap">
      <div className="bg" aria-hidden="true" />
      <div className="topbar"><div className="brand">Teacher <span className="pill">Create room</span></div></div>
      <div className="card" style={{margin:"0 auto", maxWidth:"500px"}}><div className="inner">
        <h2>Create a room</h2>
        <p className="muted">Generates a room code (students) and a private teacher key (moderation).</p>
        <button className="btn primary" onClick={createRoom} disabled={loading} style={{width:"100%"}}>{loading?"Creating...":"Create room"}</button>
        {result && (
          <div style={{marginTop:14}}>
            <div className="item">
              <div className="itemTop"><strong>Room code: {result.code}</strong><span className="badge">save these links</span></div>
              <div className="tiny" style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <b>Student:</b>
                  <a className="btn" href={result.studentUrl} target="_blank" rel="noopener noreferrer">Open</a>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <b>Projector:</b>
                  <a className="btn" href={result.screenUrl} target="_blank" rel="noopener noreferrer">Open</a>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <b>Teacher Dashboard:</b>
                  <a className="btn" href={result.teacherUrl} target="_blank" rel="noopener noreferrer">Open</a>
                </div>
                <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}><b>Teacher key:</b> <span className="pill">{keyRevealed ? result.teacherKey : "••••••••"}</span><button className="btn" onClick={()=>setKeyRevealed(!keyRevealed)} style={{padding:"4px 8px",fontSize:"12px"}}>{keyRevealed?"Hide":"Reveal"}</button></div>
              </div>
            </div>
            <p className="tiny">Anyone with the <b>teacher dashboard link</b> can approve/hide submissions.</p>
          </div>
        )}
      </div></div>
    </main>
  );
}
