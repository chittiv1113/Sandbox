"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export default function MarkdownView({content}:{content:string}) {
  return <div style={{color:"rgba(0,0,0,0.80)"}}><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div>;
}
