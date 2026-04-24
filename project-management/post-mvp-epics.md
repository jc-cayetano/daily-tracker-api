# Daily Tracker — Post-MVP Epics

## Overview

The Post-MVP phase transforms the application from a personal time tracker into a team-based project tracking tool. Users can now operate in project contexts with role-based capabilities.

## Key Decisions

| Decision                        | Choice                                                    | Rationale                                                  |
| ------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| Roles                           | Contextual per project (PM or Member), not per account    | A user can be PM in one project and Member in another      |
| Registration                    | Not included — users created by admin or seeded           | Admin + User Management is a future phase                  |
| Multiple projects               | Both PMs and Members can be in multiple projects          | Reflects real team structures                              |
| Project status flow             | Open → Work in Progress → Closed (PM can reopen)         | Closed = read-only, reopen to resume work                  |
| Tasks                           | Project tasks coexist with personal tasks                 | MVP personal tasks remain functional, no migration needed  |
| Task assignment                 | PMs can assign to members, members can self-assign        | Flexible task ownership                                    |
| Timer                           | Same flow, single active timer across all projects        | Consistent with MVP, prevents time overlap                 |
| PM monitoring                   | Per-project view, "In Progress" indicator (no live timer) | Respects privacy while showing activity                    |
| Leave project                   | Requires PM approval, time logs and tasks preserved       | Maintains historical data integrity                        |
| Personal daily summary          | Still exists, shows cross-project work                    | Users still need a personal productivity overview          |

---

## EP-06: Project Management

**Goal:** Allow users to create and manage projects that group tasks and team members.

**Scope:**

- Create projects with a name and description
- View list of projects (owned and member)
- Project status flow: Open → Work in Progress → Closed
- PM can close and reopen projects
- Closed projects are read-only (no task creation or timers)
- Projects persist forever (no delete or archive)

**Acceptance Criteria:**

- PM can create a project with a name and optional description
- Projects list shows all projects the user is part of (as PM or Member)
- Each project displays its status, member count, and the user's role
- PM can close an open/WIP project, locking all task and timer operations
- PM can reopen a closed project
- Project status automatically changes to "Work in Progress" when a member starts a timer on a task
- Closed projects show all data in read-only mode

**API Contract:**

| Method | Endpoint               | Request Body                | Response Body                                                  | Description                  |
| ------ | ---------------------- | --------------------------- | -------------------------------------------------------------- | ---------------------------- |
| POST   | /projects              | `{ name, description? }`   | `{ id, name, description, status, ownerId, createdAt }`       | Create a project             |
| GET    | /projects              | —                           | `[{ id, name, status, role, memberCount, createdAt }]`        | List user's projects         |
| GET    | /projects/:id          | —                           | `{ id, name, description, status, ownerId, members, tasks }`  | Get project details          |
| PATCH  | /projects/:id/close    | —                           | `{ id, status }`                                               | Close a project (PM only)    |
| PATCH  | /projects/:id/reopen   | —                           | `{ id, status }`                                               | Reopen a project (PM only)   |

**Stories:** Frontend (5) · Backend (1) · Total Points: 24

---

## EP-07: Team Management

**Goal:** Allow PMs to manage team members within a project and allow members to request to leave.

**Scope:**

- PM can add members to a project
- PM can remove members from a project
- Members can request to leave a project
- PM can approve or reject leave requests
- Member's time logs and tasks are preserved after leaving

**Acceptance Criteria:**

- PM can search and add users to a project as team members
- PM can remove a member from a project
- Members see a "Request to Leave" option on projects they belong to
- PM receives leave requests and can approve or reject them
- Approved leave removes the member's access but preserves their data
- Rejected leave keeps the member in the project

**API Contract:**

| Method | Endpoint                                    | Request Body   | Response Body                                        | Description                  |
| ------ | ------------------------------------------- | -------------- | ---------------------------------------------------- | ---------------------------- |
| GET    | /users?search=query                         | —              | `[{ id, username }]`                                 | Search users by username     |
| POST   | /projects/:id/members                       | `{ userId }`   | `{ id, userId, role, joinedAt }`                     | Add a member (PM only)       |
| DELETE | /projects/:id/members/:userId               | —              | —                                                    | Remove a member (PM only)    |
| GET    | /projects/:id/members                       | —              | `[{ id, userId, username, role, joinedAt }]`         | List project members         |
| POST   | /projects/:id/leave-requests                | —              | `{ id, projectId, userId, status, createdAt }`       | Request to leave             |
| GET    | /projects/:id/leave-requests                | —              | `[{ id, userId, username, status, createdAt }]`      | List leave requests (PM)     |
| PATCH  | /projects/:id/leave-requests/:requestId     | `{ status }`   | `{ id, status }`                                     | Approve or reject (PM only)  |

**Stories:** Frontend (5) · Backend (1) · Total Points: 23

---

## EP-08: Project Tasks

**Goal:** Allow PMs and members to create, assign, and manage tasks within a project context.

**Scope:**

- Create tasks within a project
- PM can assign tasks to specific members
- Members can self-assign by creating their own tasks
- Tasks inherit the existing timer flow (start/pause/resume/stop)
- Tasks show "In Progress" indicator when a member has an active timer
- Tasks are read-only in closed projects
- Archive tasks within a project

**Acceptance Criteria:**

- Tasks are created within a project context with a name and optional assignee
- PM can assign or reassign tasks to any project member
- Members can create tasks assigned to themselves
- Each task shows its assignee and current status (idle, in progress, completed sessions)
- "In Progress" indicator appears when a member has an active timer on the task
- Tasks cannot be created or started in closed projects
- Existing archive with undo toast behavior is preserved

**API Contract:**

| Method | Endpoint                          | Request Body                  | Response Body                                                          | Description                       |
| ------ | --------------------------------- | ----------------------------- | ---------------------------------------------------------------------- | --------------------------------- |
| POST   | /projects/:id/tasks               | `{ name, assigneeId? }`      | `{ id, name, assigneeId, status, projectId, createdAt }`              | Create a task in a project        |
| GET    | /projects/:id/tasks               | —                             | `[{ id, name, assignee, status, isInProgress, sessionCount }]`        | List project tasks                |
| PATCH  | /projects/:id/tasks/:taskId/assign | `{ assigneeId }`             | `{ id, assigneeId }`                                                   | Assign or reassign a task (PM)    |
| PATCH  | /projects/:id/tasks/:taskId/archive | —                           | `{ id, status }`                                                       | Archive a task                    |

**Stories:** Frontend (4) · Backend (1) · Total Points: 19

---

## EP-09: PM Monitoring Dashboard

**Goal:** Provide PMs with a per-project view of team members' activity, hours, and task progress.

**Scope:**

- Per-project dashboard showing all team members
- Each member shows total hours, task count, and active sessions
- View member's completed sessions with descriptions
- Filter by date range
- "In Progress" indicator on tasks with active timers

**Acceptance Criteria:**

- PM can view a project dashboard showing all members and their activity
- Each member row shows: name, total hours, number of tasks, and active status
- PM can expand a member to see their tasks and completed sessions with descriptions
- PM can filter the view by date or date range
- Tasks with active timers show an "In Progress" badge
- Data is read-only — PM cannot modify member time logs

**API Contract:**

| Method | Endpoint                                  | Request Body | Response Body                                                                                                                                    | Description                    |
| ------ | ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| GET    | /projects/:id/dashboard?from=DATE&to=DATE | —            | `{ project, members: [{ id, username, totalHours, taskCount, isActive, tasks: [{ id, name, isInProgress, totalHours, sessions: [...] }] }] }`   | Get PM project dashboard       |

**Stories:** Frontend (4) · Backend (1) · Total Points: 18

---

## EP-10: Cross-Project Daily Summary

**Goal:** Update the personal daily summary to show work across all projects.

**Scope:**

- Dashboard shows daily summary grouped by project
- Each project section shows tasks and sessions
- Total hours across all projects
- Member's project count displayed on dashboard

**Acceptance Criteria:**

- Dashboard shows the user's total hours across all projects for the selected day
- Tasks are grouped under their project name
- Each task is expandable to show sessions (same as MVP)
- The number of projects the user belongs to is visible
- Day navigation still works as before

**API Contract:**

| Method | Endpoint                       | Request Body | Response Body                                                                                                                                                          | Description                              |
| ------ | ------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| GET    | /daily-summary?date=YYYY-MM-DD | —            | `{ date, totalHours, projectCount, projects: [{ id, name, totalHours, tasks: [{ id, name, totalHours, sessions: [{ id, startedAt, stoppedAt, duration, description }] }] }] }` | Get cross-project daily summary |

**Stories:** Frontend (2) · Backend (1) · Total Points: 10

---

## EP-11: Deferred MVP Stories

**Goal:** Complete the deferred stories from the MVP phase.

**Scope:**

- View and restore archived tasks (personal and project context)
- Edit session description after submission

**API Contract:**

| Method | Endpoint              | Request Body | Response Body    | Description                  |
| ------ | --------------------- | ------------ | ---------------- | ---------------------------- |
| PATCH  | /tasks/:id/restore    | —            | `{ id, status }` | Restore an archived task     |

**Stories:** Frontend (2) · Backend (1) · Total Points: 7

---

## Epic Dependency Map

```text
EP-06: Project Management
  ├── EP-07: Team Management
  │     └── EP-09: PM Monitoring Dashboard
  ├── EP-08: Project Tasks
  │     └── EP-10: Cross-Project Daily Summary
  └── EP-11: Deferred MVP Stories
```

EP-06 is the foundation — all other post-MVP epics require projects.
EP-07 and EP-08 can be developed in parallel once EP-06 is complete.
EP-09 depends on EP-07 (needs team members) and EP-08 (needs project tasks).
EP-10 depends on EP-08 (needs project-scoped tasks).
EP-11 can be done at any point.

---

## Post-MVP Summary

| Epic                              | Frontend Stories | Backend Stories | Total Points |
| --------------------------------- | ---------------- | --------------- | ------------ |
| EP-06: Project Management         | 5                | 1               | 24           |
| EP-07: Team Management            | 5                | 1               | 23           |
| EP-08: Project Tasks              | 4                | 1               | 19           |
| EP-09: PM Monitoring Dashboard    | 4                | 1               | 18           |
| EP-10: Cross-Project Daily Summary | 2               | 1               | 10           |
| EP-11: Deferred MVP Stories       | 2                | 1               | 7            |
| **Post-MVP Total**                | **22**           | **6**           | **101**      |
