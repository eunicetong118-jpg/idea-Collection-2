# Design Document: Idea Collection Application
**Date:** 2026-03-06
**Status:** Approved

## 1. Overview
The Idea Collection application is a collaborative platform where users can submit, discuss, and react to ideas categorized under a main theme and multiple sub-topics. It features an AI-driven similarity screening process and automated summarization for administrators.

## 2. Architecture (Approach 3: Microservices-Lite)
The application follows a modular architecture using a Next.js core with specialized AI service logic.

- **Frontend:** Next.js (App Router), React, Tailwind CSS.
- **Backend:** Next.js API Routes (Node.js) handling Auth and Idea services.
- **AI Service:** LangChain integrated into the backend for semantic similarity and summarization.
- **Database:** MongoDB Atlas with Vector Search.
- **Authentication:** NextAuth.js (Auth.js) with a hardcoded admin email list.

## 3. Core Services
### 3.1 Account Service
- Handles registration and login.
- Identifies admins via a hardcoded email list in environment variables.
- Admin Panel access restricted to authorized users.

### 3.2 Idea & Content Service
- Manages themes, sub-topics, cards (ideas), and comments.
- **Validation:** Frontend-first validation prevents unnecessary API calls.
- **Sorting Logic:** Cards sorted by a combination of `lastActivityAt` (comments/likes), `createdAt`, and popularity.
- **Status Handling:** Only cards where **both** `Stage="Implement"` AND `Stage_status="Done"` coexist are greyed out and moved to the bottom of the dashboard.

### 3.3 AI Agent Service (LangChain)
- **Similarity Screening:**
  - Triggers on idea submission.
  - Uses semantic embeddings to check against existing ideas in MongoDB.
  - Threshold: > 70% similarity triggers a warning pop-up with "Proceed/Cancel" options.
- **Summarization:**
  - Automated 100-word summary generated after successful idea creation.
  - Summary is stored in the database for admin hover-preview.

## 4. Frontend Structure
### 4.1 Landing Page
- Registration/Login forms.
- Admin button (top-right) leading to the Admin Panel.

### 4.2 Main Dashboard
- Header showing `{main theme}` and dynamic `{sub-topic}` navigation buttons.
- Content area showing cards for the selected sub-topic.
- Floating "Add" button for new idea submissions.

### 4.3 Admin Panel
- Inputs for updating the `{main theme}`.
- Management of `{sub-topics}` (Create/Edit/Delete).
- Table of existing sub-topics with card counts.
- Idea list with AI summary hover-previews.

## 5. Data Model (MongoDB)
- **Users:** Profile and credentials.
- **Themes/Sub-topics:** Main theme text and sub-topic definitions.
- **Ideas:**
  - Metadata: Title, Description, Author, Sub-topic.
  - Status: Stage, Stage_status.
  - AI: Embeddings (Vector), 100-word summary.
  - Reactions: Liked-by array, comment count.
- **Comments:** Linked to Idea ID for collaborative discussion.

## 6. Success Criteria
- Functional AI similarity check preventing duplicate entries without user consent.
- Admin-driven dynamic content (themes/sub-topics) reflected on the main dashboard.
- Interactive card system with likes, comments, and automated status-based sorting.
- Robust error handling surfacing backend/frontend issues to the user.
