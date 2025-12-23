# Classroom Share — Teacher-Moderated Live Submissions (MVP)

A simple web app for classrooms where a **teacher hosts a room** and **students submit notes or code** from their phones/laptops. The teacher can **preview** each submission and decide what gets shown on the **projector**.

This is designed to feel like an “online compiler” UI for code submissions 

---

## What the app does

### Teacher
- Creates a room and gets:
  - a **Room Code** (students join with this)
  - a **Teacher dashboard link** (includes a private key in the URL)
  - a **Projector / Screen link**
- Sees a list of **pending** submissions
- Clicks a submission to **preview**
- Can:
  - **Approve** → shows on the projector
  - **Hide** → removes/blocks it from showing

### Student
- Joins a room using the **room code**
- Can submit:
  - **Markdown notes** (supports headings, bold, lists, links, code blocks, etc.)
  - **Code text** (with a language selector and a fake “Run” button)
- Can choose:
  - **Anonymous** (leave name blank)
  - **Named** (enter a name)
- Students only see:
  - **their own submissions**
  - and whether each is **pending / approved / hidden**

### Projector / Screen (teacher display)
- Shows the **latest approved** submission
- Updates live (no refresh needed)

---

## Tech Stack

### Frontend
- **Next.js (App Router)**  
  Provides routing, server/client components, API routes, dev server, build pipeline.
- **React**  
  UI components + state management.
- **CSS (global styles)**  
  A lightweight “glass” UI with cards, a soft gradient background, and a code-editor look.

### Markdown rendering
- **react-markdown** + **remark-gfm**  
  Lets students write Markdown and see it rendered cleanly (supports GitHub-flavored Markdown like tables, task lists, fenced code blocks, etc.)

### Backend / Data
- **Supabase**
  - **Postgres database** for rooms + submissions
  - **Row Level Security (RLS)** policies so:
    - Students can read **approved** submissions and their **own**
    - Students can insert **only their own pending** submissions
  - **Realtime** subscriptions so teacher/projector updates instantly when DB changes

### Auth
- **Supabase Anonymous Auth**
  - Students are automatically signed in anonymously (no login)
  - Each student gets a unique `user.id` used to associate submissions

### Teacher moderation security model
- Teacher moderation actions use **server-side API routes** in Next.js
- Those routes use a Supabase **Service Role Key** (server-only) to update submission status
- Teacher dashboard access is protected by a **teacher key** stored in the DB
  - If someone doesn’t have the teacher key, they can’t approve/hide

---

## Data Model (high level)

### rooms
- Stores a room’s public identifier:
  - `code` (what students type/visit)

### room_secrets
- Stores the teacher-only secret:
  - `teacher_key` (used to access the dashboard + authorize moderation)

### submissions
- Stores every student submission:
  - `room_id`
  - `student_id` (anonymous auth user id)
  - `display_name` (optional)
  - `kind` = `"note"` or `"code"`
  - `language` (for code)
  - `content`
  - `status` = `"pending" | "approved" | "hidden"`
  - `created_at`

---

## Key Pages / Routes

### Public
- `/`  
  Landing page (links to teacher create and a demo join)
- `/room/[code]`  
  Student submission page
- `/room/[code]/screen`  
  Projector display page (latest approved)

### Teacher
- `/teacher/new`  
  Creates a room (calls API)
- `/teacher/[code]?key=TEACHER_KEY`  
  Moderation dashboard (pending queue + preview + approve/hide)

### API Routes (server)
- `POST /api/rooms/create`  
  Creates room + teacher key (writes to Supabase)
- `GET /api/teacher/pending?code=...&key=...`  
  Returns pending submissions (authorized with teacher key)
- `POST /api/teacher/approve`  
  Sets a submission to approved
- `POST /api/teacher/hide`  
  Sets a submission to hidden

---

## Environment Variables 

- `NEXT_PUBLIC_SUPABASE_URL`  
  Supabase project URL (used in browser + server)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  Public client key used for:
  - anonymous auth sign-in
  - reading approved content
  - inserting student submissions (restricted by RLS)
- `SUPABASE_SERVICE_ROLE_KEY` (**server-only**)  
  Full-privilege key used only in Next API routes for teacher actions (approve/hide)
- `NEXT_PUBLIC_BASE_URL`  
  Used to generate shareable links (student + teacher + projector)

---

## Real-time behavior (what updates live)
- Student “My submissions” list updates when their submissions change status
- Teacher “Pending” list updates when new submissions arrive
- Projector view updates when teacher approves/hides submissions

This is done via Supabase Realtime listening to Postgres changes on the `submissions` table.

---

## MVP limitations (by design)
- Code editor is **UI only** (no actual compilation/execution)
- Teacher “security” is a **secret link** approach (teacher key in URL)
- No accounts, no classroom roster, no per-student management beyond anonymous IDs
- No file uploads (text only)

---

##  Next upgrades 
- Teacher can pin a submission (not just “latest approved”)
- Approved history on projector (scrollable)
- Rate limiting per student to prevent spam
- Optional student login (email / Google) for persistent identity
- Moderation tools: delete submission, ban student id, profanity filter
- Multiple projector modes: “latest”, “grid”, “carousel”, “queue”

---
