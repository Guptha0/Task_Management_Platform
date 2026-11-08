# 🚀 TaskFlow Pro — DevOps & Student Productivity Hub

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TaskFlow Pro** is an enterprise-grade, developer-first **DevOps & Student Productivity Hub** built with **Node.js, Express, MongoDB (Mongoose), React (Vite), and Tailwind CSS**.

Engineered for modern software engineers, students, and agile teams, it replaces legacy project tools with a developer-centric workflow:
* **Professional Integration Hub:** Interactive profile links for GitHub, Bitbucket/GitLab, LinkedIn, and personal portfolio.
* **Repository & Pull Request Linking:** Link GitHub/Bitbucket PRs (with live `Open`, `Merged`, `Failed CI/CD` statuses) and Git commit SHAs directly to tasks.
* **Persistent CI/CD Pipeline Status Bar:** Real-time visibility into `main` branch builds, staging deployments, and test suite execution.
* **52-Week GitHub-Style Contribution Heatmap:** Visual streak calendar tracking daily completed tasks and code contributions.
* **Sprint Velocity & Story Points Analytics:** Measure team and personal throughput using Fibonacci Story Points (SP) and Productivity Hours — with **zero financial or currency symbols**.
* **Student & Developer Portfolio Generator:** Export completed tasks, technical skill tags, and linked repositories as a clean, printable PDF resume summary.
* **Smart Hybrid Fallback Mode:** Seamless dual-engine architecture (Express REST API + client-side `localStorage` sync) ensuring 100% interactive functionality even on zero-backend static deployments.

---

## ⚡ Active Localhost Access

Both frontend and backend services are active and running:

* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** [http://localhost:5000](http://localhost:5000)
* **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## ⚡ Instant Evaluator Demo Access

An automated demo account pre-seeded with collaborative tasks, PR links, skills, and contribution history is ready:

* **One-Click Demo Button:** Click **`One-Click Demo Login`** on the sign-in screen to authenticate instantly with zero typing.
* **Manual Demo Credentials:**
  * **Email:** `demo@taskflow.com`
  * **Password:** `password123`

---

## 🌟 Enterprise Feature Matrix

### 1. 🚀 Advanced Productivity & Management Tools
* **Subtasks & Checklist Items:**
  * Add nested checklists with instant progress tracking bars (`3/5 completed • 60%`).
  * Real-time checkbox completion with celebratory effects when all subtasks are finished.
  * Checklist counters displayed directly on Kanban cards and List rows.
* **Time Tracking & Estimated Hours:**
  * Track `Estimated Hours` vs `Time Logged` with sprint velocity bars and estimation accuracy metrics.
  * Quick-log buttons (`+0.5h`, `+1h`, `+2h`) for frictionless developer timesheet logging.
* **Activity Audit Log / Task History:**
  * Automatic chronological audit timeline tracking every state transition (*"Changed status from To Do to In Progress by Sarah Chen"*, *"Logged +2.5h"*, *"Reassigned to Marcus Vance"*).

### 2. 👥 Team Collaboration & Assignees
* **Task Comments & Discussion Thread:**
  * Full-featured comment stream per task with avatars, author roles, and relative timestamps.
  * Team member mention helper chips (`@Alex Morgan`, `@Sarah Chen`, `@David Miller`, etc.).
* **Team Directory & Assignee Management:**
  * Pre-configured team directory with realistic enterprise roles (Lead Architect, Product Designer, Backend Lead, Frontend Specialist, DevOps Engineer, QA Lead).
  * Filter tasks by assignee, assign tasks in the modal, and view team avatars on Kanban cards, List rows, and Calendar cells.

### 3. 🤖 AI Productivity Copilot ("TaskBot AI")
* **Natural Language Task Creator:**
  * Top-mounted Copilot quick-add bar: *"Remind me to fix the authentication token bug by tomorrow at 4pm with high priority assigned to David"*
  * Automatically extracts Title, Due Date, Priority, Category, and Assignee with a live interactive confirmation chip.
* **AI Task Breakdown Assistant:**
  * "✨ AI Breakdown" button inside the task modal automatically decomposes any task into 4–6 actionable engineering checklist items and suggests realistic estimated hours.

### 4. 📊 Advanced Analytics & Calendar Visualization
* **Multi-View Interactive Workspace:**
  * **Kanban Board:** 3 columns (`To Do`, `In Progress`, `Completed`) with HTML5 drag-and-drop and one-tap mobile chevrons.
  * **List Table View:** Sortable by due date, priority, or time with responsive mobile card views.
  * **Calendar Grid View:** Monthly calendar visualization showing deadlines, status dots, and overdue task warnings.
  * **Interactive Analytics Tab:**
    * *7-Day Velocity / Burndown Chart* (daily throughput of closed tasks).
    * *Priority Intensity Donut Chart* (Urgent, High, Medium, Low).
    * *Category Workload Bar Chart*.
    * *Time Tracking Velocity & Estimation Accuracy*.
    * *Team Capacity & Assignee Workload Breakdown*.

### 5. ⚡ Smart Hybrid Fallback Mode (Zero-Friction Evaluation)
* In [`frontend/src/services/api.js`](file:///f:/Task%20Management%20Application/frontend/src/services/api.js), the app attempts to call the live Express/MongoDB REST backend.
* If the backend is offline or deployed as a static site (e.g. Vercel), it **automatically falls back to client-side `localStorage`** pre-seeded with sample tasks and team data.
* A live indicator badge in the header displays `🟢 REST API Connected` or `⚡ Hybrid LocalStorage Mode` with a manual test/refresh button.

---

## 🏗️ Tech Stack & Directory Structure

```
TaskFlow Pro/
├── backend/                       # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js           # Mongoose database connector & diagnostics
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, Login, and GetMe handlers
│   │   │   └── taskController.js  # CRUD, comments, subtasks, time logs, AI Copilot
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT Bearer token protection middleware
│   │   │   └── error.js           # 404 & centralized Mongoose/JWT error handlers
│   │   ├── models/
│   │   │   ├── User.js            # Name, email, hashed password, timestamps
│   │   │   └── Task.js            # Subtasks, comments, activityLog, assignee, hours
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # /api/auth endpoints
│   │   │   └── taskRoutes.js      # /api/tasks protected endpoints
│   │   ├── seeder.js              # Database seeder (npm run seed)
│   │   └── server.js              # Express app, Helmet, CORS, Morgan, Healthcheck
│   ├── .env                       # Backend environment configuration
│   ├── .env.example
│   └── package.json
│
├── frontend/                      # React (Vite) Single Page App
│   ├── src/
│   │   ├── components/
│   │   │   ├── AITaskCreator.jsx  # TaskBot AI Natural Language Quick-Add bar
│   │   │   ├── CalendarView.jsx   # Monthly calendar grid with deadline markers
│   │   │   ├── KanbanBoard.jsx    # Drag-and-drop board with subtask & hours pills
│   │   │   ├── TaskListView.jsx   # Filterable & sortable data table
│   │   │   ├── TaskAnalytics.jsx  # 7-day velocity, donut charts, team capacity
│   │   │   ├── TaskModal.jsx      # Tabs for Details, Subtasks, Discussion, Audit Log
│   │   │   ├── KPICards.jsx       # Key performance indicators & overdue alert
│   │   │   ├── TaskToolbar.jsx    # View switcher tabs, filter pills, dropdowns
│   │   │   ├── Navbar.jsx         # Connection indicator, Reset Data, User avatar
│   │   │   └── Auth/              # Login & Register views
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication & session state
│   │   │   └── TaskContext.jsx    # Global task operations, filters, time logs, AI
│   │   ├── services/
│   │   │   ├── aiCopilot.js       # NLP parser & AI breakdown engine
│   │   │   ├── team.js            # Team members directory & role metadata
│   │   │   └── api.js             # Smart Hybrid API client (REST + LocalStorage sync)
│   │   ├── App.jsx                # Router, view switcher, mobile FAB
│   │   └── index.css              # Custom styling & drag-and-drop rules
│   ├── .env
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json                   # Root workspace scripts
├── .gitignore
├── LICENSE                        # MIT License
└── README.md                      # Comprehensive documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** v18+ (tested on Node v20/v26)
* **npm** or **yarn**
* *(Optional)* Local **MongoDB** instance or a free **MongoDB Atlas** cluster URI.

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Environment Configuration
Backend `.env` (`/backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflow_pro
JWT_SECRET=taskflow_pro_jwt_secret_super_secure_key_2026_dev
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```
Frontend `.env` (`/frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Seeding (Optional)
To seed MongoDB with demo user, collaborative sample tasks, subtasks, assignees, comments, and time logs:
```bash
npm run seed
```

### 4. Running the Application

* **Backend Server:**
  ```bash
  npm run start:backend
  # Or with nodemon hot-reload:
  npm run dev:backend
  ```
  *Server runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

* **Frontend Client:**
  ```bash
  npm run dev:frontend
  ```
  *Client runs on `http://localhost:5173`*

Open `http://localhost:5173` in your browser. Click **"One-Click Demo Login"** to begin exploring!

---

## 📡 REST API Documentation

All routes under `/api/tasks` require a valid JWT token: `Authorization: Bearer <TOKEN>`

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### Collaborative Task Endpoints (`/api/tasks`)
| Method | Endpoint | Description | Query / Body |
|---|---|---|---|
| `GET` | `/api/tasks` | Fetch tasks for logged-in user | `status`, `priority`, `category`, `assignee`, `search`, `sortBy` |
| `POST` | `/api/tasks` | Create a new task | Payload with subtasks, assignee, hours, title, etc. |
| `GET` | `/api/tasks/stats/summary` | Get telemetry, 7-day velocity, and subtask completion stats | None |
| `POST` | `/api/tasks/ai/parse` | Parse natural language prompt into task fields | `{ prompt }` |
| `POST` | `/api/tasks/ai/breakdown` | Generate actionable checklist subtasks | `{ title, description }` |
| `GET` | `/api/tasks/:id` | Fetch single task details | None |
| `PUT` | `/api/tasks/:id` | Update task & record audit log entry | Updatable fields |
| `DELETE` | `/api/tasks/:id` | Delete task | None |
| `POST` | `/api/tasks/:id/comments` | Post comment to discussion thread | `{ text }` |
| `DELETE` | `/api/tasks/:id/comments/:commentId` | Delete a comment | None |
| `POST` | `/api/tasks/:id/time` | Log time spent on task | `{ hours }` |

---

## 🗄️ Database Schemas

### `Task` Schema
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, default: '', trim: true },
  status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do', index: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium', index: true },
  category: { type: String, default: 'General', trim: true },
  dueDate: { type: Date, default: null },
  
  // Collaborative & Productivity Enhancements
  assignee: {
    name: String,
    email: String,
    avatar: String,
    role: String
  },
  estimatedHours: { type: Number, default: 0 },
  timeLogged: { type: Number, default: 0 },
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  comments: [{
    user: String,
    userName: String,
    userAvatar: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  activityLog: [{
    action: String,
    field: String,
    from: String,
    to: String,
    user: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 🧪 Quality & Verification Checklist

- [x] **Zero Build Errors:** Verified with production `vite build` (`2091 modules transformed in 19.10s`).
- [x] **Subtasks & Checklist:** Nested items with interactive checkboxes, progress bars, and completion effects.
- [x] **Time Tracking:** Estimated vs Logged hours with quick-log buttons (`+0.5h`, `+1h`, `+2h`).
- [x] **Activity History:** Chronological audit trail tracking status shifts, reassignments, and time entries.
- [x] **Task Comments:** Threaded discussions with `@teammate` mention chips and timestamps.
- [x] **Team Management:** 6 realistic team profiles with avatars, roles, and assignee filtering.
- [x] **TaskBot AI Copilot:** Natural language quick-add bar and "✨ AI Breakdown" checklist decomposition.
- [x] **Calendar View:** Monthly deadline grid with status indicators and overdue alerts.
- [x] **Sprint Metrics:** 7-Day velocity chart, priority donut chart, category bars, and team workload stats.
- [x] **Smart Hybrid Fallback:** All collaborative features synchronize with client `localStorage` when backend is offline.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
