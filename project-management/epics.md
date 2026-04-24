# Daily Tracker — Epics

## Development Approach

Frontend and backend user stories are maintained in separate files:

- `user-stories-frontend.md` — UI, components, pages, Tauri integration
- `user-stories-backend.md` — API endpoints, database, business logic

Both are developed in parallel within each epic. API contracts are defined upfront per epic so the frontend can build against mocked responses while the backend is in progress.

---

## App Structure

### Pages

- `/login` — Login page (no sidebar)
- `/` — Dashboard (daily productivity view)
- `/tasks` — Task management (create, list, archive)

### Layout

Authenticated pages use a sidebar layout (shadcn sidebar) with:

- **Dashboard** (`/`) — Daily productivity view
- **Tasks** (`/tasks`) — Task management
- *(separator)*
- **Logout** — Sidebar footer

---

## EP-01: Authentication

**Goal:** Allow users to securely access the application.

**Scope:**

- Login with username and password
- Token-based session management (JWT)
- Persistent session across app restarts (Tauri store)
- Route protection for unauthenticated users
- Logout via sidebar

**Acceptance Criteria:**

- User can log in with valid credentials
- Invalid credentials show an error toast
- Authenticated session persists across app restarts
- Unauthenticated users are redirected to the login page
- User can log out from the sidebar, clearing the session

**API Contract:**

| Method | Endpoint    | Request Body             | Response Body | Description       |
| ------ | ----------- | ------------------------ | ------------- | ----------------- |
| POST   | /auth/login | `{ username, password }` | `{ token }`   | Authenticate user |

**Stories:** Frontend (4) · Backend (1) · Total Points: 11

---

## EP-02: Task Management

**Goal:** Allow users to create and manage reusable tasks.

**MVP Scope:**

- Create new tasks with a name on the /tasks page
- View list of active tasks
- Archive tasks with undo toast (no confirmation prompt)
- Prevent duplicate task names

**Post-MVP Scope:**

- View archived tasks
- Restore archived tasks

**Acceptance Criteria:**

- User can create a task via an inline form on the /tasks page
- Active tasks are displayed in a list with Start Timer and Archive actions
- Archiving immediately removes the task with an undo toast
- Duplicate task names are not allowed
- Empty state is shown when no tasks exist

**API Contract:**

| Method | Endpoint           | Request Body | Response Body                        | Description                                         |
| ------ | ------------------ | ------------ | ------------------------------------ | --------------------------------------------------- |
| GET    | /tasks             | —            | `{ tasks: [{ id, name, status }] }`  | List tasks (query param `?status=active\|archived`) |
| POST   | /tasks             | `{ name }`   | `{ id, name, status }`               | Create a new task                                   |
| PATCH  | /tasks/:id/archive | —            | `{ id, name, status }`               | Archive a task                                      |
| PATCH  | /tasks/:id/restore | —            | `{ id, name, status }`               | Restore an archived task (post-MVP)                 |

**Stories:** Frontend (3) · Backend (1) · Total Points: 12

---

## EP-03: Time Tracking

**Goal:** Allow users to track time spent on tasks using a start/pause/resume/stop workflow with a single active timer.

**Scope:**

- Start a timer on a task
- Pause and resume the active timer
- Stop the timer to complete a session
- Enforce single active timer at a time
- Timer overlay window (always-on-top) with pause and done controls
- Restore active timer on app launch
- Backend-driven timestamps for accuracy

**Acceptance Criteria:**

- User can start a timer on any active task
- Starting a timer while another is active prompts the user to stop or pause it first
- User can pause and resume the active timer
- User can stop the timer to finalize the session
- A floating overlay window displays the running timer with pause and done buttons
- Overlay and main window stay in sync via Tauri events
- Active timer is restored on app launch
- All timestamps are recorded server-side
- Only one active session per user at any time

**API Contract:**

| Method | Endpoint              | Request Body | Response Body                                            | Description                       |
| ------ | --------------------- | ------------ | -------------------------------------------------------- | --------------------------------- |
| POST   | /time-logs            | `{ taskId }` | `{ id, taskId, startedAt, status }`                      | Start a new time log session      |
| PATCH  | /time-logs/:id/pause  | —            | `{ id, pausedAt, status }`                               | Pause the active session          |
| PATCH  | /time-logs/:id/resume | —            | `{ id, resumedAt, status }`                              | Resume a paused session           |
| PATCH  | /time-logs/:id/stop   | —            | `{ id, stoppedAt, duration, status }`                    | Stop and finalize the session     |
| GET    | /time-logs/active     | —            | `{ timeLog: { id, taskId, startedAt, status } \| null }` | Get current active/paused session |

**Stories:** Frontend (5) · Backend (1) · Total Points: 21

---

## EP-04: Session Reflection

**Goal:** Allow users to add context and notes after completing a work session.

**MVP Scope:**

- Description dialog appears automatically after stopping a timer
- Description is attached to the time log entry
- Optional but encouraged (user can skip)

**Post-MVP Scope:**

- Edit description after submission

**Acceptance Criteria:**

- After stopping a timer, a dialog automatically prompts for a description
- Dialog shows the task name and session duration
- User can submit or skip the description
- Description is saved as part of the time log

**API Contract:**

| Method | Endpoint       | Request Body      | Response Body         | Description                       |
| ------ | -------------- | ----------------- | --------------------- | --------------------------------- |
| PATCH  | /time-logs/:id | `{ description }` | `{ id, description }` | Add or update session description |

**Stories:** Frontend (1) · Backend (1) · Total Points: 5

---

## EP-05: Daily Productivity View

**Goal:** Provide users with a summary of their daily work activity.

**Scope:**

- Dashboard (/) shows daily productivity summary
- List all tasks worked on for a selected day
- Show total time per task (aggregated across multiple sessions)
- Show total hours for the day
- Expand/collapse tasks to view individual session details
- Navigate between days
- Empty state for first-time users with link to /tasks

**Acceptance Criteria:**

- Dashboard defaults to today's date
- Each task shows aggregated time in hours (e.g., 1.5 hrs)
- User can expand a task to see individual sessions with timestamps and descriptions
- Total hours for the day are displayed
- User can navigate to previous/next days
- Next day button is disabled when viewing today
- Empty state shows "No tasks tracked today" with a link to /tasks

**API Contract:**

| Method | Endpoint                       | Request Body | Response Body                                                                                                              | Description                    |
| ------ | ------------------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| GET    | /daily-summary?date=YYYY-MM-DD | —            | `{ date, totalHours, tasks: [{ id, name, totalHours, sessions: [{ id, startedAt, stoppedAt, duration, description }] }] }` | Get daily productivity summary |

**Stories:** Frontend (3) · Backend (1) · Total Points: 13

---

## Epic Dependency Map

```text
EP-01: Authentication
  └── EP-02: Task Management
        └── EP-03: Time Tracking
              ├── EP-04: Session Reflection
              └── EP-05: Daily Productivity View
```

EP-01 is the foundation — all other epics require an authenticated user.
EP-02 must exist before EP-03 since timers are started on tasks.
EP-03 produces time logs consumed by EP-04 and EP-05.
EP-04 and EP-05 can be developed in parallel once EP-03 is complete.

---

## Agreed Design Decisions

| Decision                  | Choice                                     | Rationale                                                        |
| ------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| Daily view format         | Simple list                                | Charts deferred to future enhancement                            |
| Task lifecycle            | Active / Archived (no hard delete)         | Preserves time log data integrity                                |
| Sessions per task per day | Multiple allowed                           | Reflects real work patterns                                      |
| Concurrent timers         | Single active timer enforced               | Ensures accurate capture, simplifies UX                          |
| Archive UX                | Direct action with undo toast              | Faster UX, no confirmation prompt                                |
| Session description       | Dialog appears automatically after stop    | Encourages reflection while work is fresh                        |
| Timer overlay             | MVP (Tauri multi-window)                   | Core differentiator, validates Tauri capability                  |
| Timer restore             | MVP (restore on app launch)                | Server-driven timestamps make this reliable                      |
| Development approach      | Separate frontend/backend story files      | Enables parallel work with clear ownership                       |
| API status                | Not yet developed                          | Frontend builds against mocked responses using defined contracts |

---

## MVP Summary

| Epic                      | Frontend Stories | Backend Stories | Total Points |
| ------------------------- | ---------------- | --------------- | ------------ |
| EP-01: Authentication     | 4                | 1               | 11           |
| EP-02: Task Management    | 3                | 1               | 12           |
| EP-03: Time Tracking      | 5                | 1               | 21           |
| EP-04: Session Reflection | 1                | 1               | 5            |
| EP-05: Daily Productivity | 3                | 1               | 13           |
| **MVP Total**             | **16**           | **5**           | **62**       |
| *Deferred*                | *2*              | *0*             | *5*          |
