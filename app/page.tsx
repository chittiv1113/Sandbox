import Link from "next/link";

export default function Home(){
  return (
    <main className="wrap">
      <div className="bg" aria-hidden="true" />
      <div style={{textAlign:"center",marginBottom:20}}>
        <h1 style={{margin:0,fontSize:32,fontWeight:800}}>Sandbox</h1>
      </div>
      <div className="card" style={{margin: "0 auto", maxWidth: "500px"}}>
        <div className="inner">
          <h2>Start</h2>
          <p className="muted">Teachers create a room. Students submit notes/code.</p>
          <div style={{display:"flex",gap:20,flexWrap:"wrap",justifyContent:"center",flexDirection:"column-reverse",alignItems:"center"}}>
            <Link className="btn primary" href="/teacher/new">Teacher: Create room</Link>
            <Link className="btn primary" href="/student/join">Student: Join</Link>
          </div>
          <p className="muted" style={{marginTop:12,marginBottom:0}}>Create your own sandbox!</p>
        </div>
      </div>
    </main>
  );
}
