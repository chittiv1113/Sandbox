"use client";
import { useMemo } from "react";
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export default function CodeEditorFake({value,onChange,language,onLanguageChange,onRun}:{value:string;onChange:(v:string)=>void;language:string;onLanguageChange:(v:string)=>void;onRun:()=>void;}){
  const lines=useMemo(()=>{const c=clamp(value.split("\n").length,1,9999);return Array.from({length:c},(_,i)=>String(i+1)).join("\n");},[value]);
  const ext = language==="cpp"?"cpp":language==="javascript"?"js":language==="typescript"?"ts":language;
  return (
    <div>
      <div className="field">
        <label>Language</label>
        <select value={language} onChange={(e)=>onLanguageChange(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>
      <div className="editorShell" aria-label="Fake online compiler editor">
        <div className="editorBody">
          <pre className="gutter">{lines}</pre>
          <textarea className="codeArea" value={value} onChange={(e)=>onChange(e.target.value)} spellCheck={false} placeholder={"// Paste or write code here...\n"} />
        </div>
      </div>
    </div>
  );
}
