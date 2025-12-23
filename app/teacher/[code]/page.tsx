"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import MarkdownView from "../../components/MarkdownView";


type Submission = { id:string; display_name:string|null; kind:"note"|"code"; language:string|null; content:string; status:"pending"|"approved"|"hidden"; created_at:string; };

export default function TeacherDashboard({params}:{params:{code:string}}){
  const sp=useSearchParams();
  const key=sp.get("key")||"";
  const code=params.code;

  const [loading,setLoading]=useState(false);
  const [items,setItems]=useState<Submission[]>([]);
  const [selected,setSelected]=useState<Submission|null>(null);

  const canUse=useMemo(()=>Boolean(code && key),[code,key]);

  const load=async()=>{
    if(!canUse) return;
    setLoading(true);
    try{
      const res=await fetch(`/api/teacher/pending?code=${encodeURIComponent(code)}&key=${encodeURIComponent(key)}`);
      const data=await res.json();
      if(!res.ok) throw new Error(data?.error||"Failed to load");
      setItems(data.items||[]);
      if(selected){
        const still=(data.items||[]).find((x:Submission)=>x.id===selected.id);
        setSelected(still||null);
      }
    }catch(e:any){ alert(e.message||"Failed"); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); const t=setInterval(load,2500); return ()=>clearInterval(t); /* eslint-disable-next-line */ },[code,key]);

  const act=async(id:string,action:"approve"|"hide")=>{
    if(!canUse) return;
    const res=await fetch(`/api/teacher/${action}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code,key,submissionId:id})});
    const data=await res.json();
    if(!res.ok){ alert(data?.error||"Action failed"); return; }
    await load();
  };

  if(!canUse){
    return (
      <main className="wrap">
        <div className="bg" aria-hidden="true" />
        <div className="card"><div className="inner">
          <h2>Teacher dashboard</h2>
          <p className="muted">Missing teacher key. Use the link like:</p>
          <pre className="output">/teacher/{code}?key=YOUR_TEACHER_KEY</pre>
        </div></div>
      </main>
    );
  }

  return (
    <main className="wrap">
      <div className="bg" aria-hidden="true" />
      <div className="topbar">
        <div className="brand">Teacher <span className="pill">Room {code}</span></div>
        <button className="btn" onClick={load} disabled={loading}>{loading?"Refreshing...":"Refresh"}</button>
      </div>
      <div className="grid">
        <div className="card"><div className="inner">
          <h2>Pending submissions</h2>
          <div className="list">
            {items.length===0 && <div className="muted">No pending submissions.</div>}
            {items.map((s)=>(
              <div key={s.id} className="item" onClick={()=>setSelected(s)} style={{cursor:"pointer"}}>
                <div className="itemTop">
                  <div><b>{s.kind==="code"?"Code":"Note"}</b> <span className="tiny">{s.display_name?`• ${s.display_name}`:"• anonymous"}</span></div>
                  <span className="badge">{new Date(s.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="tiny" style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{s.content}</div>
              </div>
            ))}
          </div>
        </div></div>

        <div className="card"><div className="inner">
          <h2>Preview</h2>
          {!selected && <div className="muted">Click a submission to preview and approve.</div>}
          {selected && (
            <>
              <div className="item" style={{marginBottom:10}}>
                <div className="itemTop">
                  <div><b>{selected.kind==="code"?"Code":"Note"}</b> <span className="tiny">{selected.display_name?`• ${selected.display_name}`:"• anonymous"}</span></div>
                  <span className="badge">pending</span>
                </div>
                {selected.kind==="note" ? (
                  <MarkdownView content={selected.content} />
                ) : (
                  <pre className="output" style={{background:"rgba(16,18,22,0.92)",color:"rgba(255,255,255,0.88)"}}>{selected.content}</pre>
                )}
              </div>
              <div className="actions">
                <button className="btn primary" onClick={()=>act(selected.id,"approve")}>Approve → Show on projector</button>
                <button className="btn" onClick={()=>act(selected.id,"hide")}>Hide</button>
              </div>
              <p className="tiny" style={{marginTop:10}}>Approving makes it visible on <code>/room/{code}/screen</code>.</p>
            </>
          )}
        </div></div>
      </div>
    </main>
  );
}
