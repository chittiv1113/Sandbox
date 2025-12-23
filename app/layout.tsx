import "./globals.css";

export const metadata = { title: "Sandbox", description: "Teacher-moderated live sharing of notes/code." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
