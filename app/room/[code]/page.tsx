"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import CodeEditorFake from "../../components/CodeEditorFake";
import MarkdownView from "../../components/MarkdownView";


type Room={id:string;code:string};
type Submission={id:string;kind:"note"|"code";language:string|null;content:string;status:"pending"|"approved"|"hidden";display_name:string|null;created_at:string;};

export default function StudentRoom({params}:{params:{code:string}}){
  const code=params.code;
  const [room,setRoom]=useState<Room|null>(null);
  const [sessionReady,setSessionReady]=useState(false);

  const [name,setName]=useState("");
  const [tab,setTab]=useState<"note"|"code">("note");
  const [note,setNote]=useState("");
  const [lang,setLang]=useState("javascript");
  const [codeText,setCodeText]=useState("");
  const [fakeOut,setFakeOut]=useState("Ready.");

  const [mine,setMine]=useState<Submission[]>([]);
  const [loadingMine,setLoadingMine]=useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const ensureAnonAuth=async()=>{
    const {data}=await supabase.auth.getSession();
    if(!data.session) await supabase.auth.signInAnonymously();
    setSessionReady(true);
  };

  const loadRoom=async()=>{
    const {data,error}=await supabase.from("rooms").select("id,code").eq("code",code).maybeSingle();
    if(error) return alert(error.message);
    if(!data) return alert("Room not found. Ask your teacher for the correct room code.");
    setRoom(data as Room);
  };

  const loadMine=async(roomId:string)=>{
    setLoadingMine(true);
    const {data:sess}=await supabase.auth.getSession();
    const uid=sess.session?.user?.id;
    if(!uid){ setLoadingMine(false); return; }

    const {data,error}=await supabase
      .from("submissions")
      .select("id,kind,language,content,status,display_name,created_at")
      .eq("room_id",roomId)
      .eq("student_id",uid)
      .order("created_at",{ascending:false});
    if(error) alert(error.message);
    else setMine((data||[]) as Submission[]);
    setLoadingMine(false);
  };

  useEffect(()=>{ ensureAnonAuth(); },[]);
  useEffect(()=>{ if(!sessionReady) return; loadRoom(); },[sessionReady]);

  useEffect(()=>{
    if(!room) return;
    loadMine(room.id);
    const setup=async()=>{
      const {data:sess}=await supabase.auth.getSession();
      const uid=sess.session?.user?.id;
      if(!uid) return;
      const channel=supabase.channel(`mine:${room.id}:${uid}`)
        .on("postgres_changes",{event:"*",schema:"public",table:"submissions",filter:`room_id=eq.${room.id} and student_id=eq.${uid}`},()=>loadMine(room.id))
        .subscribe();
      return ()=>{ supabase.removeChannel(channel); };
    };
    let cleanup:any;
    setup().then((c)=>cleanup=c);
    return ()=>cleanup?.();
  },[room?.id]);

  const submit=async()=>{
    if(!room) return;
    const {data:sess}=await supabase.auth.getSession();
    const uid=sess.session?.user?.id;
    if(!uid) return alert("Not ready yet. Try again in a second.");

    const display_name = name.trim()==="" ? null : name.trim();

    if(tab==="note"){
      if(note.trim().length<1) return alert("Type a note first.");
      const {error}=await supabase.from("submissions").insert({room_id:room.id,student_id:uid,display_name,kind:"note",language:null,content:note,status:"pending"});
      if(error) return alert(error.message);
      setNote("");
    }else{
      if(codeText.trim().length<1) return alert("Paste code first.");
      const {error}=await supabase.from("submissions").insert({room_id:room.id,student_id:uid,display_name,kind:"code",language:lang,content:codeText,status:"pending"});
      if(error) return alert(error.message);
      setCodeText("");
      setFakeOut("Submitted. Waiting for teacher approval…");
    }
    loadMine(room.id);
  };

  const runFake=()=>{
    const stamp=new Date().toLocaleTimeString();
    setFakeOut(`[${stamp}] Running (fake)...\nNo compilation is performed in this MVP.`);
  };

  const joinInfo=useMemo(()=>({screen:`${baseUrl}/room/${code}/screen`}),[baseUrl,code]);

  if(!sessionReady){
    return (
      <main className="wrap">
        <div className="bg" aria-hidden="true" />
        <div className="card"><div className="inner">
          <h2>Joining room…</h2>
          <p className="muted">Setting up your anonymous student session.</p>
        </div></div>
      </main>
    );
  }

  return (
    <main className="wrap">
      <div className="bg" aria-hidden="true" />
      <div className="topbar">
        <div className="brand">Student <span className="pill">Room {code}</span></div>
        <div className="tiny"><span className="pill">Projector: {joinInfo.screen}</span></div>
      </div>

      <div className="grid">
        <div className="card"><div className="inner">
          <h2>Submit</h2>

          <div className="field">
            <label>Name (optional)</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Leave blank to be anonymous" />
          </div>

          <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
            <button className={"btn"+(tab==="note"?" primary":"")} onClick={()=>setTab("note")}>Notes (Markdown)</button>
            <button className={"btn"+(tab==="code"?" primary":"")} onClick={()=>setTab("code")}>Code</button>
          </div>

          {tab==="note" ? (
            <>
              <div className="field">
                <label>Note (Markdown supported)</label>
                <textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder={"Example:\n# Title\n- bullet\n**bold**\n```js\nconsole.log('hi')\n```"} />
              </div>
              <button className="btn primary" onClick={submit}>Submit note</button>

              {note.trim() && (
                <div style={{marginTop:12}}>
                  <div className="tiny" style={{marginBottom:6}}>Preview</div>
                  <div className="item"><MarkdownView content={note} /></div>
                </div>
              )}
            </>
          ) : (
            <>
              <CodeEditorFake value={codeText} onChange={setCodeText} language={lang} onLanguageChange={setLang} onRun={runFake} />
              <div className="output">{fakeOut}</div>
              <button className="btn primary" onClick={submit} style={{marginTop:10}}>Submit code</button>
            </>
          )}
        </div></div>

        <div className="card"><div className="inner">
          <h2>My submissions</h2>
          {loadingMine && <div className="muted">Loading…</div>}
          {!loadingMine && mine.length===0 && <div className="muted">Nothing submitted yet.</div>}
          <div className="list">
            {mine.map((s)=>(
              <div key={s.id} className="item">
                <div className="itemTop">
                  <div><b>{s.kind==="code"?"Code":"Note"}</b> <span className="tiny">• {new Date(s.created_at).toLocaleTimeString()}</span></div>
                  <span className="badge">{s.status}</span>
                </div>
                {s.kind==="note" ? (
                  <div className="tiny"><MarkdownView content={s.content} /></div>
                ) : (
                  <pre className="output" style={{background:"rgba(16,18,22,0.92)",color:"rgba(255,255,255,0.88)"}}>{s.content}</pre>
                )}
              </div>
            ))}
          </div>
        </div></div>
      </div>
    </main>
  );
}
