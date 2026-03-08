# Design Doc: Shared Navbar and Logout Button Integration
**Date:** 2026-03-09

## Context
The user wants a logout button accessible from every page, preferably in the top right corner. Currently, each page has its own navigation logic (Landing Page, Admin Panel, Dashboard), which leads to code duplication and inconsistent user experience.

## Objectives
- Provide a consistent **Logout** button on all pages.
- Create a reusable `Navbar` component to centralize navigation.
- Ensure the Navbar reflects the user's authentication state (NextAuth.js).
- Clean up existing page-specific navigation headers.

## Design

### 1. `components/Navbar.tsx`
A new Client Component that handles the global navigation.
- **Data Dependencies:**
  - `useSession()` from `next-auth/react` to get `user` and `status`.
  - `signOut()` for the logout action.
  - `fetch("/api/admin/theme")` to get the dynamic project title.
- **UI Elements:**
  - **Project Branding (Left):** Title + Icon (linking to `/`).
  - **Main Navigation (Center):** Dashboard link (if applicable).
  - **User Actions (Right):**
    - Admin Panel link (if `user.isAdmin`).
    - User name/avatar display.
    - **Logout** button (Lucide `LogOut` icon).
- **Layout:** Sticky top, `h-16`, background blur, border-bottom.

### 2. Integration into `app/layout.tsx`
- Wrap the main content with the `<Navbar />` inside the `<Providers>` context.
- Ensure the Navbar is always present for both authenticated and unauthenticated states.

### 3. Cleanup of Existing Pages
- **`app/page.tsx` (Landing):** Remove the `<nav>` block.
- **`app/dashboard/[subTopicId]/page.tsx`:** Remove the `<header>` block, keeping only the sub-topic navigation if needed (or move it to the Navbar).
- **`app/admin/page.tsx`:** Update the header to align with the new global Navbar.

## Trade-offs
- **Pros:** Consistent UI, easier navigation, less duplicated code.
- **Cons:** Slightly more complexity in the initial layout; may require minor adjustments to existing page padding/margins to account for the sticky header.

## Success Criteria
- [ ] Users can log out from any page.
- [ ] The Navbar correctly shows "Admin Panel" only for admins.
- [ ] The Navbar shows the project's current theme title.
- [ ] No duplicate navigation headers are visible on any page.
