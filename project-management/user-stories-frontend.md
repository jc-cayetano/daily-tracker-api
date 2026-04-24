# Daily Tracker — Frontend User Stories

## Pages

- `/login` — Login page (no sidebar)
- `/` — Dashboard (daily productivity view)
- `/tasks` — Task management (create, list, archive)

## App Layout

Authenticated pages use a sidebar layout (shadcn sidebar) with:

- **Dashboard** (`/`) — Daily productivity view
- **Tasks** (`/tasks`) — Task management
- *(separator)*
- **Logout** — Sidebar footer

---

## EP-01: Authentication

### US-01.01: Login with credentials

**As a** user,
**I want to** log in with my username and password,
**So that** I can access the application.

**Story Points:** 3

**Acceptance Criteria:**

- Login page displays username and password fields
- Password field has a visibility toggle (show/hide)
- Submitting valid credentials redirects to the dashboard
- Submitting invalid credentials displays an error toast
- Submit button shows a loading state while the request is in progress
- Empty fields show a warning toast on submit

---

### US-01.03: Persist authentication session

**As a** user,
**I want** my session to persist across app restarts,
**So that** I don't have to log in every time I open the app.

**Story Points:** 2

**Acceptance Criteria:**

- Token is stored using Tauri's store plugin (not localStorage)
- On app launch, the stored token is checked before routing
- Valid token allows access without re-login

---

### US-01.04: Route protection

**As a** system,
**I want to** redirect unauthenticated users to the login page,
**So that** protected pages are not accessible without a session.

**Story Points:** 2

**Acceptance Criteria:**

- Unauthenticated users visiting any protected route are redirected to /login
- Authenticated users visiting /login are redirected to /
- Navigation guard runs on every route change

---

### US-01.05: Logout

**As a** user,
**I want to** log out of the application,
**So that** I can end my session securely.

**Story Points:** 1

**Acceptance Criteria:**

- Logout action is located in the sidebar footer
- Clicking logout clears the stored token
- User is redirected to the login page after logout
- Protected routes are no longer accessible after logout

---

## EP-02: Task Management

### US-02.01: Create a task

**As a** user,
**I want to** create a new task with a descriptive name,
**So that** I can track time against it.

**Story Points:** 3

**Acceptance Criteria:**

- The /tasks page has a "Create Task" button
- Clicking it reveals an inline form on the same page
- Submitting creates the task and adds it to the active list
- Success toast is shown on creation
- Empty task name shows a warning toast

---

### US-02.03: View active tasks

**As a** user,
**I want to** see a list of my active tasks,
**So that** I can choose which task to work on.

**Story Points:** 2

**Acceptance Criteria:**

- Active tasks are displayed in a list on the /tasks page
- Each task shows its name
- Each task has actions: Start Timer, Archive
- List updates after creating a new task
- Empty state shows a message when no tasks exist

---

### US-02.04: Archive a task

**As a** user,
**I want to** archive a task I no longer need,
**So that** it doesn't clutter my active task list.

**Story Points:** 2

**Acceptance Criteria:**

- Each active task has an archive action
- Archiving immediately removes the task from the active list
- An undo toast appears for a few seconds after archiving
- Clicking undo restores the task to the active list

---

## EP-03: Time Tracking

### US-03.01: Start a timer on a task

**As a** user,
**I want to** start a timer on a task,
**So that** I can begin tracking time spent on it.

**Story Points:** 3

**Acceptance Criteria:**

- Each active task has a "Start Timer" action on the /tasks page
- Starting a timer sends a request to the backend
- The UI reflects the running timer state
- If another timer is already active, the user is prompted to stop or pause it first

---

### US-03.03: Pause and resume the timer

**As a** user,
**I want to** pause and resume my active timer,
**So that** I can take breaks without losing my tracked time.

**Story Points:** 3

**Acceptance Criteria:**

- A running timer shows a pause button
- A paused timer shows a resume button
- Pausing and resuming updates the UI immediately
- Duration calculation excludes paused time

---

### US-03.04: Stop the timer

**As a** user,
**I want to** stop the timer when I'm done working,
**So that** my work session is finalized and recorded.

**Story Points:** 2

**Acceptance Criteria:**

- A running or paused timer shows a stop/done button
- Stopping the timer finalizes the session
- The completed session duration is displayed
- The session description dialog appears immediately after stopping (US-04.01)
- The timer UI resets to an idle state after the dialog is submitted or skipped

---

### US-03.05: Timer overlay window

**As a** user,
**I want** a floating overlay window showing my active timer,
**So that** I can see my timer while working in other applications.

**Story Points:** 5

**Acceptance Criteria:**

- A small always-on-top frameless window appears when a timer is started
- The overlay shows the task name and elapsed time
- Pause and done buttons are available on the overlay
- The overlay syncs with the main window state via Tauri events
- The overlay closes when the timer is stopped
- Actions on the overlay are reflected in the main window and vice versa

---

### US-03.06: Restore active timer on app launch

**As a** user,
**I want** my active timer to be restored when I reopen the app,
**So that** I don't lose my tracking session if the app closes.

**Story Points:** 3

**Acceptance Criteria:**

- On app launch, GET /time-logs/active is called
- If an active session exists, the timer UI resumes from the correct elapsed time
- The overlay window is reopened if a timer is active

---

## EP-04: Session Reflection

### US-04.01: Add a description after stopping a timer

**As a** user,
**I want to** add a description of what I accomplished after stopping a timer,
**So that** I can reflect on my work session.

**Story Points:** 3

**Acceptance Criteria:**

- A dialog appears automatically after stopping a timer
- The dialog shows the task name and session duration
- The user can type a description and submit it
- The user can skip the description
- Success toast is shown on submission

---

## EP-05: Daily Productivity View

### US-05.01: View daily summary

**As a** user,
**I want to** see a summary of all tasks I worked on today,
**So that** I can review my daily productivity.

**Story Points:** 3

**Acceptance Criteria:**

- The dashboard (/) defaults to today's date
- Each task worked on is listed with its aggregated time in hours
- Total hours for the day are displayed at the top
- Tasks with no sessions for the day are not shown
- Empty state for first-time users: "No tasks tracked today. Create a task to get started." with a link to /tasks

---

### US-05.03: Expand task to view sessions

**As a** user,
**I want to** expand a task in the daily view to see individual sessions,
**So that** I can review the details of each work period.

**Story Points:** 3

**Acceptance Criteria:**

- Each task in the daily view is expandable/collapsible
- Expanding shows individual sessions with start time, end time, duration, and description
- Sessions are ordered chronologically
- Tasks are collapsed by default

---

### US-05.04: Navigate between days

**As a** user,
**I want to** navigate to previous and next days,
**So that** I can review my productivity history.

**Story Points:** 2

**Acceptance Criteria:**

- Previous and next day navigation buttons are available
- Navigating fetches the summary for the selected date
- The current date is clearly displayed
- The next button is disabled when viewing today

---

## Deferred to Post-MVP

### US-02.05: View and restore archived tasks

**As a** user,
**I want to** view my archived tasks and restore them,
**So that** I can reuse tasks I previously archived.

**Story Points:** 3

---

### US-04.03: Edit a session description

**As a** user,
**I want to** edit the description of a completed session,
**So that** I can correct or add details after the fact.

**Story Points:** 2

---

## Frontend MVP Summary

| Epic                      | Story Count | Total Points |
| ------------------------- | ----------- | ------------ |
| EP-01: Authentication     | 4           | 8            |
| EP-02: Task Management    | 3           | 7            |
| EP-03: Time Tracking      | 5           | 16           |
| EP-04: Session Reflection | 1           | 3            |
| EP-05: Daily Productivity | 3           | 8            |
| **MVP Total**             | **16**      | **42**       |
| *Deferred*                | *2*         | *5*          |
