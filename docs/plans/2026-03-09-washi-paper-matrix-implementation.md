# Washi Paper Matrix Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a calm, organic, paper-inspired theme (Washi Paper Matrix) using Cream (#FFF1B5), Soft Blue (#C1DBE8), and Deep Brown (#43302E).

**Architecture:** Update centralized CSS variables in `globals.css` and redesign core components (`Navbar`, `LandingPage`, `DashboardPage`, `IdeaCard`, `IdeaForm`) to use organic shapes, soft shadows, and tactile paper textures instead of the "Lab" tech aesthetic.

**Tech Stack:** Next.js, Tailwind CSS, Lucide Icons.

---

### Task 1: Global Variables & Base Styling

**Files:**
- Modify: `app/globals.css`

**Step 1: Update CSS Variables and Theme**

```css
:root {
  --background: #FFF1B5;
  --foreground: #43302E;
  --lab-ui: #C1DBE8;
  --lab-bg: #FFF1B5;
  --lab-text: #43302E;
  --paper-shadow: rgba(67, 48, 46, 0.08);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-lab-ui: var(--lab-ui);
  --color-lab-bg: var(--lab-bg);
  --color-lab-text: var(--lab-text);
  --color-paper-shadow: var(--paper-shadow);

  --animate-float: float 6s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
}

/* Redefine Glass Panel as Washi Sheet */
.glass-panel {
  background: rgba(255, 241, 181, 0.7);
  backdrop-filter: blur(4px);
  border: none;
  box-shadow: 0 10px 40px var(--paper-shadow);
}

/* Custom Noise for Paper Texture */
.paper-texture {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
```

**Step 2: Run build to verify no CSS errors**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: define Washi Paper Matrix global variables"
```

---

### Task 2: Navbar Redesign

**Files:**
- Modify: `components/Navbar.tsx`

**Step 1: Update Navbar styling**

```tsx
// Replace Navbar classes with:
<nav className="sticky top-0 z-50 w-full bg-lab-bg/60 backdrop-blur-lg h-20 transition-all font-sans border-b border-lab-ui/10">
  {/* Branding: Use Deep Brown text, Soft Blue "wash" on hover */}
  {/* Branding Icon: Remove border, use Soft Blue background */}
  <div className="bg-lab-ui/40 p-2 rounded-full text-lab-text group-hover:bg-lab-ui transition-all">
    <LayoutDashboard size={20} />
  </div>
  {/* Admin Link: Use pill shape, soft shadow */}
  <Link className="px-6 py-2 rounded-full bg-lab-ui/20 text-lab-text text-xs font-bold hover:bg-lab-ui/40 transition-all shadow-sm shadow-paper-shadow">
```

**Step 2: Verify visually (if possible) or check component integrity**

**Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: redesign Navbar for Washi theme"
```

---

### Task 3: Dashboard & Layout Redesign

**Files:**
- Modify: `app/dashboard/[subTopicId]/page.tsx`

**Step 1: Update Page layout and loading state**

```tsx
// Replace loading state with Zen sequence
<div className="h-2 w-32 bg-lab-ui/20 rounded-full overflow-hidden">
  <div className="h-full bg-lab-ui animate-pulse w-full" />
</div>
<p className="text-xs uppercase tracking-[0.4em] opacity-40 mt-4">Unfolding matrix...</p>

// Replace Page layout:
// Use large border-radius, soft shadows, remove CRT effects
<div className="min-h-screen bg-lab-bg text-lab-text font-sans pb-24 relative overflow-hidden">
  <div className="fixed inset-0 paper-texture z-0" />
  {/* Remove Frame Decor and CRT Overlay */}
```

**Step 2: Update Navigation Tabs**

```tsx
// Navigation: Rounded-full, Soft Blue washes
<button className={clsx(
  "px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all",
  subTopicId === st.id ? "bg-lab-ui text-lab-text shadow-md" : "hover:bg-lab-ui/20"
)}>
```

**Step 3: Commit**

```bash
git add app/dashboard/[subTopicId]/page.tsx
git commit -m "feat: redesign Dashboard for Washi theme"
```

---

### Task 4: IdeaCard & IdeaForm Redesign

**Files:**
- Modify: `components/IdeaCard.tsx`
- Modify: `components/IdeaForm.tsx`

**Step 1: Update IdeaCard to "Paper Sheet"**

```tsx
// Card: 2rem border-radius, soft ink-bleed shadow, remove grid artifacts
<div className="bg-white/80 rounded-[2rem] p-8 shadow-xl shadow-paper-shadow border-none hover:translate-y-[-4px] transition-all">
  {/* Remove Status Bar borders, use subtle color dot */}
  <h3 className="text-2xl font-bold tracking-tight mb-4">{idea.title}</h3>
  {/* Action Buttons: Use Soft Blue circular backgrounds */}
```

**Step 2: Update IdeaForm to match**

```tsx
// Inputs: Soft border-radius, subtle background color
<input className="bg-lab-ui/10 border-none rounded-2xl p-4 focus:ring-2 focus:ring-lab-ui" />
// Submit: Deep Brown with Soft Blue lift
```

**Step 3: Commit**

```bash
git add components/IdeaCard.tsx components/IdeaForm.tsx
git commit -m "feat: redesign cards and forms for Washi theme"
```
