# Daily Tracker — Post-MVP Frontend User Stories

## New Pages

- `/projects` — Project list (owned and member)
- `/projects/:id` — Project detail (tasks, members, dashboard)
- `/projects/:id/dashboard` — PM monitoring dashboard

## Updated Navigation

- **Dashboard** (`/`) — Personal cross-project daily summary
- **Projects** (`/projects`) — Project list
- **Logout**

---

## EP-06: Project Management

### US-06.01: Create a project

**As a** user,
**I want to** create a new project with a name and description,
**So that** I can organize tasks and team members under it.

**Story Points:** 3

**Acceptance Criteria:**

- The /projects page has a "Create Project" button
- A form collects project name (required) and description (optional)
- Submitting creates the project with status "Open" and the creator as PM
- Success toast is shown on creation
- The new project appears in the project list

---

### US-06.02: View project list

**As a** user,
**I want to** see all projects I'm part of,
**So that** I can navigate to the one I want to work on.

**Story Points:** 3

**Acceptance Criteria:**

- The /projects page lists all projects where the user is PM or Member
- Each project shows: name, status badge (Open/WIP/Closed), member count, and the user's role
- Projects are clickable and navigate to /projects/:id
- Empty state is shown when the user has no projects

---

### US-06.03: View project detail

**As a** user,
**I want to** see the details of a project including its tasks and members,
**So that** I can work within the project context.

**Story Points:** 5

**Acceptance Criteria:**

- The /projects/:id page shows project name, description, status, and member list
- Tasks within the project are listed with assignee and status
- PM sees additional controls (close/reopen, add members, assign tasks)
- Closed projects display all data in read-only mode with a "Closed" banner
- Navigation back to project list is available

---

### US-06.04: Close and reopen a project

**As a** PM,
**I want to** close a project when work is done and reopen it if needed,
**So that** I can control the project lifecycle.

**Story Points:** 3

**Acceptance Criteria:**

- PM sees a "Close Project" action on open/WIP projects
- A confirmation dialog appears before closing
- Closing sets the project to read-only — task creation and timers are disabled
- PM sees a "Reopen Project" action on closed projects
- Reopening restores full functionality

---

### US-06.05: Project status auto-update to WIP

**As a** system,
**I want** the project status to automatically change to "Work in Progress" when a timer is started,
**So that** the status reflects actual activity.

**Story Points:** 2

**Acceptance Criteria:**

- When a member starts a timer on a task in an "Open" project, the status changes to "Work in Progress"
- The status change is reflected in the project list and detail views
- Projects already in WIP or Closed are not affected

---

## EP-07: Team Management

### US-07.01: Add members to a project

**As a** PM,
**I want to** add users as team members to my project,
**So that** they can work on tasks within the project.

**Story Points:** 5

**Acceptance Criteria:**

- PM sees an "Add Member" action on the project detail page
- A search/select interface allows finding users by username
- Adding a user assigns them the "Member" role in the project
- The member list updates immediately
- Success toast is shown

---

### US-07.02: Remove members from a project

**As a** PM,
**I want to** remove a team member from my project,
**So that** they no longer have access to the project.

**Story Points:** 2

**Acceptance Criteria:**

- PM sees a remove action next to each member (except themselves)
- A confirmation dialog appears before removing
- Removing revokes access but preserves the member's time logs and tasks
- The member list updates immediately

---

### US-07.03: Request to leave a project

**As a** team member,
**I want to** request to leave a project,
**So that** I can be removed from projects I no longer work on.

**Story Points:** 3

**Acceptance Criteria:**

- Members see a "Request to Leave" action on the project detail page
- Submitting creates a pending leave request
- The member sees a "Leave Requested" status while pending
- The action is disabled while a pending request exists

---

### US-07.04: Manage leave requests

**As a** PM,
**I want to** approve or reject leave requests from team members,
**So that** I can control team composition.

**Story Points:** 3

**Acceptance Criteria:**

- PM sees a notification/badge for pending leave requests on the project
- A leave requests section shows pending requests with member name and date
- PM can approve (removes member access, preserves data) or reject (keeps member)
- Success toast is shown for each action

---

### US-07.05: View project member list

**As a** user,
**I want to** see all members of a project and their roles,
**So that** I know who is on the team.

**Story Points:** 2

**Acceptance Criteria:**

- The project detail page shows a member list with username and role (PM/Member)
- The PM is clearly identified
- Member count is visible

---

## EP-08: Project Tasks

### US-08.01: Create a task within a project

**As a** user,
**I want to** create a task within a project,
**So that** I can track work for that project.

**Story Points:** 3

**Acceptance Criteria:**

- The project detail page has a "Create Task" action
- A form collects task name (required) and assignee (optional, defaults to self)
- PM can assign to any project member; members can only assign to themselves
- Task creation is disabled in closed projects
- Success toast is shown on creation

---

### US-08.02: View and manage project tasks

**As a** user,
**I want to** see all tasks in a project with their assignees and status,
**So that** I can track project progress.

**Story Points:** 3

**Acceptance Criteria:**

- Tasks are listed on the project detail page with name, assignee, and status
- Tasks with an active timer show an "In Progress" indicator
- Each task shows its session count
- PM can see all tasks; members see all tasks but can only start timers on their own
- Archive action is available (with undo toast)
- Tasks are read-only in closed projects

---

### US-08.03: Assign or reassign a task

**As a** PM,
**I want to** assign or reassign a task to a team member,
**So that** I can distribute work within the project.

**Story Points:** 3

**Acceptance Criteria:**

- PM sees an assign/reassign action on each task
- A dropdown or select shows available project members
- Reassigning updates the task immediately
- Assignment is disabled in closed projects

---

### US-08.04: Start timer on a project task

**As a** team member,
**I want to** start a timer on my assigned task,
**So that** I can track time spent on project work.

**Story Points:** 3

**Acceptance Criteria:**

- Members can start a timer on tasks assigned to them
- The existing timer flow (start/pause/resume/stop + overlay) works within project context
- Single active timer rule applies across all projects
- Starting a timer on an "Open" project changes its status to "Work in Progress"
- Timer cannot be started in closed projects
- The session reflection dialog appears after stopping

---

## EP-09: PM Monitoring Dashboard

### US-09.01: View project monitoring dashboard

**As a** PM,
**I want to** see an overview of all team members' activity in my project,
**So that** I can monitor progress and hours.

**Story Points:** 5

**Acceptance Criteria:**

- The /projects/:id/dashboard page shows all team members
- Each member row shows: name, total hours, task count, and active status indicator
- Total project hours are displayed at the top
- Only PMs can access this page

---

### US-09.02: Expand member to view tasks and sessions

**As a** PM,
**I want to** expand a team member to see their tasks and completed sessions,
**So that** I can review their work in detail.

**Story Points:** 3

**Acceptance Criteria:**

- Each member row is expandable/collapsible
- Expanding shows the member's tasks with hours and session details
- Sessions show start time, end time, duration, and description
- Tasks with active timers show an "In Progress" badge

---

### US-09.03: Filter dashboard by date range

**As a** PM,
**I want to** filter the monitoring dashboard by date range,
**So that** I can review activity for a specific period.

**Story Points:** 3

**Acceptance Criteria:**

- Date range picker allows selecting from/to dates
- Defaults to the current week
- Changing the date range refreshes the dashboard data
- Total hours update to reflect the selected range

---

### US-09.04: Navigate to PM dashboard from project detail

**As a** PM,
**I want to** easily access the monitoring dashboard from the project detail page,
**So that** I can quickly check team activity.

**Story Points:** 2

**Acceptance Criteria:**

- A "Dashboard" tab or link is visible on the project detail page for PMs only
- Clicking navigates to /projects/:id/dashboard
- Members do not see this link

---

## EP-10: Cross-Project Daily Summary

### US-10.01: View cross-project daily summary

**As a** user,
**I want to** see my daily work summary grouped by project,
**So that** I can review my productivity across all projects.

**Story Points:** 5

**Acceptance Criteria:**

- The dashboard (/) shows total hours across all projects for the selected day
- The number of projects the user belongs to is displayed
- Tasks are grouped under their project name
- Each task is expandable to show sessions (same as MVP)
- Day navigation works as before
- Empty state shows "No tasks tracked for this day"

---

### US-10.02: Update daily summary API integration

**As a** frontend,
**I want to** consume the updated daily summary API that includes project grouping,
**So that** the dashboard reflects the new data structure.

**Story Points:** 2

**Acceptance Criteria:**

- The dashboard fetches from the updated daily summary endpoint
- Response is parsed with project grouping
- Backward compatible — works even if user has no projects

---

## EP-11: Deferred MVP Stories

### US-02.05: View and restore archived tasks

**As a** user,
**I want to** view archived tasks within a project and restore them,
**So that** I can reuse tasks I previously archived.

**Story Points:** 3

**Acceptance Criteria:**

- User can toggle between active and archived tasks within a project
- Archived tasks are displayed in a list with a restore action
- Restoring moves the task back to the active list
- Restore is disabled in closed projects

---

### US-04.03: Edit a session description

**As a** user,
**I want to** edit the description of a completed session,
**So that** I can correct or add details after the fact.

**Story Points:** 2

**Acceptance Criteria:**

- Completed sessions with descriptions show an edit action
- Clicking edit opens the description in an editable field
- Saving updates the description via the API
- Success toast is shown on save

---

## Frontend Post-MVP Summary

| Epic                               | Story Count | Total Points |
| ---------------------------------- | ----------- | ------------ |
| EP-06: Project Management          | 5           | 16           |
| EP-07: Team Management             | 5           | 15           |
| EP-08: Project Tasks               | 4           | 12           |
| EP-09: PM Monitoring Dashboard     | 4           | 13           |
| EP-10: Cross-Project Daily Summary | 2           | 7            |
| EP-11: Deferred MVP Stories        | 2           | 5            |
| **Total**                          | **22**      | **68**       |
