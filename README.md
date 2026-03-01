# TaskFlow – Modern MERN Todo App

A full-featured, production-ready todo application built with the MERN stack (MongoDB, Express, React, Node.js) featuring a modern TypeScript/Vite frontend with beautiful Tailwind CSS UI.

---

## ✨ Features

### Task Management
- **Create, Read, Update, Delete** tasks
- **Priority levels**: High / Medium / Low with colour-coded badges
- **Due dates** with overdue & today indicators
- **Categories** for organising tasks (Work, Personal, etc.)
- **Tags** for flexible labelling
- **Notes** field for extra task details
- **Pin** tasks to keep important ones at the top
- **Mark complete/active** toggle with instant feedback

### Views & Filters
- **Dashboard** – overview with stats, progress bar, priority breakdown and recent tasks
- **All Tasks** – full list with sort controls
- **Active** – incomplete tasks only
- **Completed** – finished tasks
- **Today** – tasks due today
- **Overdue** – past-due tasks that need attention
- **Category sidebar** – quickly filter by category
- **Search** – instant full-text search across titles and descriptions

### UI/UX
- **Dark / Light mode** toggle with persistence
- **Responsive sidebar layout**
- **Toast notifications** for all actions
- **Skeleton loading** states
- **Smooth hover transitions** on task cards
- **Inline edit modal** – edit all task fields in place
- Modern Inter font + Tailwind CSS v3

### Auth
- JWT-based authentication (signup / login / logout)
- Forgot password & reset password via email
- Auto token refresh on page reload

### Statistics
- Total / active / completed / overdue counts
- Completion rate progress bar
- Priority breakdown chart
- Category breakdown

---

## 🗂️ Project Structure

```
mern-todo-app/
├── package.json              # Root – concurrent dev script
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── controllers/
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   └── forgotPasswordController.js
│   ├── middleware/
│   │   └── requireAuth.js
│   ├── models/
│   │   ├── taskModel.js      # title, description, priority, dueDate, category, tags, notes, pinned, order
│   │   └── userModel.js
│   └── routes/
│       ├── taskRoute.js
│       ├── userRoute.js
│       └── forgotPassword.js
└── frontend/
    ├── index.html            # Vite entry point
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── types/index.ts    # Shared TypeScript types
        ├── api/              # Axios API wrappers (TypeScript)
        ├── context/          # React context: Auth, Task, Theme
        ├── components/
        │   ├── Auth/         # Login, Register, ForgotPassword, ResetPassword
        │   ├── Header/       # Top header with search & dark mode
        │   ├── Layout/       # Sidebar + Layout wrapper
        │   ├── Tasks/        # TaskCard, TaskList, TaskFilter, CreateTask, EditTask
        │   └── UI/           # PriorityBadge
        └── pages/            # DashboardPage, AllTasksPage, ActivePage, CompletedPage, TodayPage, OverduePage
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd mern-todo-app

# Install root deps (concurrently)
npm install

# Install all sub-package deps
npm run install:all
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, and Gmail credentials
```

### 3. Run in development

```bash
# From the root – starts both backend (port 8001) and frontend (port 3000) concurrently
npm run dev
```

Or run separately:

```bash
# Backend only
npm run start:backend

# Frontend only
npm run start:frontend
```

### 4. Build for production

```bash
cd frontend
npm run build
```

---

## 🔌 API Endpoints

### Auth (`/api/user`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Login & get JWT |
| POST | `/register` | Register new user |
| GET | `/getuser` | Get current user (Auth required) |

### Tasks (`/api/task`) – all require JWT
| Method | Path | Description |
|--------|------|-------------|
| GET | `/getTask` | Get all tasks |
| GET | `/stats` | Get task statistics |
| POST | `/addTask` | Create task |
| PUT | `/updateTask/:id` | Update task fields |
| PATCH | `/toggle/:id` | Toggle completed state |
| DELETE | `/removeTask/:id` | Delete task |
| PATCH | `/reorder` | Bulk reorder tasks |

### Forgot Password (`/api/forgotPassword`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/forgotPassword` | Send reset email |
| POST | `/resetPassword` | Reset with token |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Icons | React Icons (Remix Icons) |
| Routing | React Router v6 |
| HTTP | Axios |
| Notifications | React Hot Toast |
| Date utils | date-fns |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Email | Nodemailer (Gmail) |
| Dev | Nodemon, Concurrently |

---

## 📄 License

MIT
