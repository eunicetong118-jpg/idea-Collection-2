# Idea Collection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a collaborative idea collection platform with AI-driven similarity screening and admin-managed topics.

**Architecture:** Next.js integrated monolith with a separate AI service layer (LangChain) and MongoDB Atlas (Vector Search).

**Tech Stack:** Next.js (App Router), Node.js, MongoDB, NextAuth.js, LangChain, Tailwind CSS.

---

### Task 1: Environment Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`
- Delete: `src/Main.java`, `Idea collection 2.iml`

**Step 1: Initialize Next.js project**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm`
Expected: Next.js boilerplate created in root.

**Step 2: Install dependencies**
Run: `npm install mongodb next-auth @auth/mongodb-adapter langchain @langchain/openai @langchain/community lucide-react clsx tailwind-merge`
Expected: Dependencies installed.

**Step 3: Cleanup Java files**
Run: `rm src/Main.java "Idea collection 2.iml"`
Expected: Project cleaned of Java boilerplate.

**Step 4: Commit**
```bash
git add .
git commit -m "chore: scaffold Next.js project and install dependencies"
```

---

### Task 2: Database & Auth Setup

**Files:**
- Create: `lib/mongodb.ts`, `app/api/auth/[...nextauth]/route.ts`, `.env.local`

**Step 1: Create MongoDB connection utility**
Create `lib/mongodb.ts` to handle client singleton.

**Step 2: Configure NextAuth**
Create `app/api/auth/[...nextauth]/route.ts` with MongoDB adapter and Credentials provider. Define admin check logic against `ADMIN_EMAILS` env var.

**Step 3: Run dev server**
Run: `npm run dev`
Expected: Server starts on localhost:3000.

**Step 4: Commit**
```bash
git add lib/ app/ .env.local
git commit -m "feat: setup MongoDB connection and NextAuth"
```

---

### Task 3: Admin Service & Panel

**Files:**
- Create: `app/admin/page.tsx`, `app/api/admin/theme/route.ts`, `app/api/admin/subtopics/route.ts`

**Step 1: Create Admin Page UI**
Build the Admin Panel with inputs for `{main theme}` and `{sub-topics}`.

**Step 2: Implement Theme API**
Write API to update global theme in MongoDB.

**Step 3: Implement Sub-topic API**
Write CRUD for sub-topics.

**Step 4: Commit**
```bash
git add app/admin app/api/admin
git commit -m "feat: implement admin panel and management APIs"
```

---

### Task 4: Idea Service & Similarity Agent

**Files:**
- Create: `lib/ai/similarity.ts`, `app/api/ideas/route.ts`, `components/IdeaForm.tsx`

**Step 1: Implement LangChain Similarity Logic**
Create `lib/ai/similarity.ts` using LangChain to generate embeddings and query MongoDB Vector Search.

**Step 2: Create Idea Submission API**
Implement `POST /api/ideas` that calls similarity check before saving.

**Step 3: Build Idea Form with AI Warning**
Create UI that shows "Similarity Warning" if score > 0.70.

**Step 4: Commit**
```bash
git add lib/ai app/api/ideas components/
git commit -m "feat: add AI similarity screening and idea submission"
```

---

### Task 5: Dashboard & Card Logic

**Files:**
- Create: `app/dashboard/[subTopicId]/page.tsx`, `components/IdeaCard.tsx`

**Step 1: Create Dashboard View**
Fetch and display ideas for a specific sub-topic.

**Step 2: Implement Card Logic**
Add likes, comments, and the status-based grey-out logic (`Stage="Implement"` AND `Stage_status="Done"`).

**Step 3: Implement Sorting**
Sort by `lastActivityAt`, `createdAt`, and popularity.

**Step 4: Commit**
```bash
git add app/dashboard components/
git commit -m "feat: implement main dashboard and interactive cards"
```

---

### Task 6: AI Summarization Service

**Files:**
- Create: `lib/ai/summarize.ts`, `app/api/ideas/[id]/summarize/route.ts`

**Step 1: Implement LangChain Summarizer**
Create `lib/ai/summarize.ts` to generate 100-word summaries.

**Step 2: Add post-save trigger**
Ensure every new idea triggers a summary generation.

**Step 3: Add Hover-Preview in Admin Panel**
Update Admin UI to show summary on hover.

**Step 4: Commit**
```bash
git add lib/ai app/api/
git commit -m "feat: add automated AI summarization for admin panel"
```
