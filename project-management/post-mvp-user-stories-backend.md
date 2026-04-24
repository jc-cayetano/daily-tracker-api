# Daily Tracker — Post-MVP Backend User Stories

## General Requirements

- All endpoints require a valid JWT authentication token
- All timestamps are server-generated for accuracy
- Responses use JSON format
- Role-based access control: PM-only endpoints enforce project ownership
- Data preservation: removing a member does not delete their time logs or tasks

---

## EP-06: Project Management

### US-06.06: Project CRUD API endpoints

**As a** system,
**I want to** provide endpoints for creating and managing projects,
**So that** the frontend can perform project operations.

**Story Points:** 8

**Acceptance Criteria:**

- POST /projects accepts `{ name, description? }` and creates a project with status "Open" and the authenticated user as PM/owner
- GET /projects returns all projects where the user is PM or Member, including role and member count
- GET /projects/:id returns full project details including members and tasks (scoped by user access)
- PATCH /projects/:id/close sets status to "Closed" (PM only), returns 403 for non-PMs
- PATCH /projects/:id/reopen sets status to "Open" (PM only)
- Project status automatically changes to "Work in Progress" when a time log is started on a project task (only if current status is "Open")
- All task creation and timer operations return 400 on closed projects

---

## EP-07: Team Management

### US-07.06: Team management API endpoints

**As a** system,
**I want to** provide endpoints for managing project members and leave requests,
**So that** the frontend can handle team operations.

**Story Points:** 8

**Acceptance Criteria:**

- POST /projects/:id/members accepts `{ userId }` and adds the user as a Member (PM only)
- DELETE /projects/:id/members/:userId removes a member (PM only), preserves their data
- GET /projects/:id/members returns all project members with username and role
- POST /projects/:id/leave-requests creates a pending leave request for the authenticated member
- GET /projects/:id/leave-requests returns pending requests (PM only)
- PATCH /projects/:id/leave-requests/:requestId accepts `{ status: "approved" | "rejected" }` (PM only)
- Approved leave request removes member access but preserves time logs and tasks
- Duplicate leave requests (while one is pending) return 409
- A user search endpoint (GET /users?search=query) is available for the PM to find users to add

---

## EP-08: Project Tasks

### US-08.05: Project task API endpoints

**As a** system,
**I want to** provide endpoints for managing tasks within a project,
**So that** the frontend can handle project-scoped task operations.

**Story Points:** 8

**Acceptance Criteria:**

- POST /projects/:id/tasks accepts `{ name, assigneeId? }` and creates a task within the project
- If assigneeId is not provided, the task is assigned to the authenticated user
- PM can assign to any project member; members can only assign to themselves (return 403 otherwise)
- GET /projects/:id/tasks returns all tasks with assignee info, status, isInProgress flag, and session count
- PATCH /projects/:id/tasks/:taskId/assign accepts `{ assigneeId }` (PM only)
- PATCH /projects/:id/tasks/:taskId/archive archives the task
- All task endpoints return 400 if the project is closed
- The existing time log endpoints (POST /time-logs, PATCH pause/resume/stop) work with project tasks
- Starting a time log on a task in an "Open" project changes the project status to "Work in Progress"

---

## EP-09: PM Monitoring Dashboard

### US-09.05: PM monitoring dashboard API endpoint

**As a** system,
**I want to** provide an endpoint that returns per-project team activity data,
**So that** the PM can monitor team progress.

**Story Points:** 5

**Acceptance Criteria:**

- GET /projects/:id/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD returns project monitoring data (PM only)
- Response includes: project info, total project hours, and per-member breakdown
- Each member includes: username, total hours, task count, isActive flag
- Each member's tasks include: name, isInProgress, total hours, and sessions with timestamps and descriptions
- Date range defaults to the current week if not provided
- Returns 403 for non-PMs

---

## EP-10: Cross-Project Daily Summary

### US-10.03: Updated daily summary API endpoint

**As a** system,
**I want to** update the daily summary endpoint to include project grouping,
**So that** the frontend can display cross-project daily data.

**Story Points:** 3

**Acceptance Criteria:**

- GET /daily-summary?date=YYYY-MM-DD returns the summary grouped by project
- Response includes: date, totalHours, projectCount, and projects array
- Each project includes: id, name, totalHours, and tasks with sessions
- Personal tasks (no project) are included under a null project group
- Backward compatible — users with no projects still get a valid response
- Only includes projects and tasks the authenticated user has access to

---

## EP-11: Deferred MVP Stories

### US-11.01: Restore archived task API endpoint

**As a** system,
**I want to** provide an endpoint for restoring archived tasks,
**So that** users can reactivate tasks they previously archived.

**Story Points:** 2

**Acceptance Criteria:**

- PATCH /tasks/:id/restore sets the task status back to "active"
- Returns 404 if the task does not exist or does not belong to the user
- Returns 400 if the task is already active
- Works for both personal tasks and project tasks
- For project tasks, returns 400 if the project is closed
- The endpoint requires a valid authentication token

---

## Backend Post-MVP Summary

| Epic                               | Story Count | Total Points |
| ---------------------------------- | ----------- | ------------ |
| EP-06: Project Management          | 1           | 8            |
| EP-07: Team Management             | 1           | 8            |
| EP-08: Project Tasks               | 1           | 8            |
| EP-09: PM Monitoring Dashboard     | 1           | 5            |
| EP-10: Cross-Project Daily Summary | 1           | 3            |
| EP-11: Deferred MVP Stories        | 1           | 2            |
| **Total**                          | **6**       | **34**       |
