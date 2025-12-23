"use client";
import { DarkModeProvider } from "./DarkModeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DarkModeProvider>{children}</DarkModeProvider>;
}
