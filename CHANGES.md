# Progress Log – TaskFlow Rewrite

**Date:** March 1, 2026  
**Goal:** Rewrite the existing MERN todo app with more features, modern TypeScript/TSX frontend, better UI, and npm-based dev workflow.

---

## Summary of Changes

### Backend

| File                                    | Change                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `backend/models/taskModel.js`           | Added `priority`, `dueDate`, `category`, `tags`, `notes`, `pinned`, `order` fields                                    |
| `backend/controllers/taskController.js` | Rewrote all functions; added `updateTask`, `toggleComplete`, `getStats`, `reorderTasks`; removed email-on-add         |
| `backend/routes/taskRoute.js`           | Added routes for `PUT /updateTask/:id`, `PATCH /toggle/:id`, `DELETE /removeTask/:id`, `GET /stats`, `PATCH /reorder` |
| `backend/server.js`                     | Fixed deprecated `useNewUrlParser`, modernised `mongoose.connect()`, added `/api/health` endpoint, better CORS        |
| `backend/package.json`                  | Added `dev` script with `nodemon`, added `devDependencies: { nodemon }`                                               |
| `backend/.env.example`                  | Created example env file                                                                                              |

### Frontend – Full Rewrite (CRA → Vite + TypeScript)

**Configuration**

- `frontend/package.json` – Switched from `react-scripts` (CRA) to `vite` + `@vitejs/plugin-react` + TypeScript + modern deps
- `frontend/vite.config.ts` – Vite config with API proxy to `localhost:8001`
- `frontend/tsconfig.json` + `frontend/tsconfig.node.json` – TypeScript project configuration
- `frontend/tailwind.config.js` – Dark mode support, custom `primary` colour scale, Inter font
- `frontend/postcss.config.js` – PostCSS for Tailwind
- `frontend/index.html` – Vite HTML entry (moved from `public/`)
- `frontend/src/index.css` – Rewritten with Tailwind directives + custom component classes (`.btn-primary`, `.input`, `.card`)

**Types**

- `frontend/src/types/index.ts` – Shared TypeScript interfaces: `Task`, `User`, `Stats`, `Priority`, `TaskFilter`, `SortBy`

**API Layer**

- `frontend/src/api/axios.ts` – Axios instance with auto-attach JWT interceptor
- `frontend/src/api/taskApi.ts` – Typed API wrappers for all task endpoints
- `frontend/src/api/userApi.ts` – Typed API wrappers for auth + forgot/reset password

**Context / State**

- `frontend/src/context/AuthContext.tsx` – Auth context: login/register/logout + auto user-fetch on load
- `frontend/src/context/TaskContext.tsx` – Full task state: fetch, add, update, toggle, delete, filter, sort, search, categories
- `frontend/src/context/ThemeContext.tsx` – Dark/light mode with localStorage persistence + `document.documentElement.classList`

**Entry**

- `frontend/src/main.tsx` – React 18 `createRoot`
- `frontend/src/App.tsx` – `BrowserRouter` + private route guard + `Toaster` + all providers

**Layout Components**

- `frontend/src/components/Layout/Layout.tsx` – Sidebar + Header + `<Outlet />`
- `frontend/src/components/Layout/Sidebar.tsx` – Navigation, mini stats panel, category filter
- `frontend/src/components/Header/Header.tsx` – Search bar, dark mode toggle, user avatar, logout

**Auth Components (TSX)**

- `frontend/src/components/Auth/Login.tsx`
- `frontend/src/components/Auth/Register.tsx`
- `frontend/src/components/Auth/ForgotPassword.tsx`
- `frontend/src/components/Auth/ResetPassword.tsx`

**Task Components (TSX)**

- `frontend/src/components/Tasks/TaskCard.tsx` – Card with checkbox, priority badge, due date, category, tags, notes, pin, edit, delete
- `frontend/src/components/Tasks/TaskList.tsx` – Skeleton loading + empty state + list rendering
- `frontend/src/components/Tasks/CreateTask.tsx` – Inline form: title, description, priority, due date, category, tags, notes
- `frontend/src/components/Tasks/EditTask.tsx` – Full-screen modal for editing all task fields
- `frontend/src/components/Tasks/TaskFilter.tsx` – Sort controls (Newest / Priority / Due Date / Title A-Z)
- `frontend/src/components/UI/PriorityBadge.tsx` – Colour-coded priority indicator

**Pages (TSX)**

- `frontend/src/pages/DashboardPage.tsx` – Welcome, stat cards, completion progress bar, priority breakdown, recent tasks
- `frontend/src/pages/AllTasksPage.tsx`
- `frontend/src/pages/ActivePage.tsx`
- `frontend/src/pages/CompletedPage.tsx`
- `frontend/src/pages/TodayPage.tsx`
- `frontend/src/pages/OverduePage.tsx`

### Root

- `package.json` – Root-level scripts: `npm run dev` (runs both with `concurrently`), `npm run install:all`
- `readme.md` – Fully rewritten with feature list, project structure, API docs, tech stack, setup guide

---

## New Features Added (vs original)

| Feature                                  | Status |
| ---------------------------------------- | ------ |
| Priority levels (high/medium/low)        | ✅     |
| Due dates + overdue/today indicators     | ✅     |
| Categories                               | ✅     |
| Tags                                     | ✅     |
| Notes field                              | ✅     |
| Pin tasks                                | ✅     |
| Edit tasks in modal                      | ✅     |
| Dashboard with stats                     | ✅     |
| Completion progress bar                  | ✅     |
| Priority breakdown                       | ✅     |
| Today view                               | ✅     |
| Overdue view                             | ✅     |
| Dark mode                                | ✅     |
| Search                                   | ✅     |
| Sort controls                            | ✅     |
| Category sidebar filter                  | ✅     |
| Toast notifications                      | ✅     |
| Skeleton loading states                  | ✅     |
| TypeScript/TSX frontend                  | ✅     |
| Vite instead of CRA                      | ✅     |
| Proxy API in dev (no CORS config needed) | ✅     |
| Auth auto-restore on reload              | ✅     |
| Concurrent dev with one command          | ✅     |

---

## How to run

```bash
# 1. Install
npm install
npm run install:all

# 2. Set up .env
cd backend && cp .env.example .env  # fill in values

# 3. Dev (both frontend + backend)
cd .. && npm run dev
# → Backend:  http://localhost:8001
# → Frontend: http://localhost:3000
```
