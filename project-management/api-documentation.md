# Daily Tracker API Documentation

Base URL: `http://localhost:3000`

All endpoints except `POST /auth/login` require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Auth

### POST /auth/login

Authenticate user and return a JWT token.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Responses:**

| Status | Description         |
| ------ | ------------------- |
| 200    | Login successful    |
| 401    | Invalid credentials |

**200 Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "uuid",
    "username": "admin"
  }
}
```

**401 Response:**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

### GET /auth/me

Get the current authenticated user's profile. Useful for session restore on app relaunch.

**Responses:**

| Status | Description  |
| ------ | ------------ |
| 200    | User profile |

**200 Response:**

```json
{
  "id": "uuid",
  "username": "admin"
}
```

---

## Tasks

### POST /tasks

Create a new task. Duplicate names per user are not allowed.

**Request Body:**

```json
{
  "name": "string"
}
```

**Responses:**

| Status | Description      |
| ------ | ---------------- |
| 201    | Task created     |
| 409    | Duplicate name   |

**201 Response:**

```json
{
  "id": "uuid",
  "name": "Code Review",
  "status": "active",
  "createdAt": "2026-04-24T00:00:00.000Z"
}
```

**409 Response:**

```json
{
  "statusCode": 409,
  "message": "Task with this name already exists",
  "error": "Conflict"
}
```

---

### GET /tasks

List tasks, optionally filtered by status.

**Query Parameters:**

| Name   | Type   | Required | Values              |
| ------ | ------ | -------- | ------------------- |
| status | string | No       | `active`, `archived` |

**Responses:**

| Status | Description   |
| ------ | ------------- |
| 200    | List of tasks |

**200 Response:**

```json
[
  {
    "id": "uuid",
    "name": "Code Review",
    "status": "active",
    "createdAt": "2026-04-24T00:00:00.000Z"
  }
]
```

---

### PATCH /tasks/:id/archive

Archive a task by setting its status to `archived`.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Task ID     |

**Responses:**

| Status | Description    |
| ------ | -------------- |
| 200    | Task archived  |
| 404    | Task not found |

**200 Response:**

```json
{
  "id": "uuid",
  "name": "Code Review",
  "status": "archived",
  "createdAt": "2026-04-24T00:00:00.000Z"
}
```

---

### PATCH /tasks/:id/restore

Restore an archived task by setting its status back to `active`.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Task ID     |

**Responses:**

| Status | Description           |
| ------ | --------------------- |
| 200    | Task restored         |
| 400    | Task is already active |
| 404    | Task not found        |

**200 Response:**

```json
{
  "id": "uuid",
  "name": "Code Review",
  "status": "active",
  "createdAt": "2026-04-24T00:00:00.000Z"
}
```

---

## Time Logs

### POST /time-logs

Start a new time log session. Only one active session per user is allowed.

**Request Body:**

```json
{
  "taskId": "uuid"
}
```

**Responses:**

| Status | Description                    |
| ------ | ------------------------------ |
| 201    | Session started                |
| 400    | Task in a closed project       |
| 409    | Active session already exists  |

**201 Response:**

```json
{
  "id": "uuid",
  "taskId": "uuid",
  "startedAt": "2026-04-24T08:00:00.000Z",
  "status": "running"
}
```

---

### PATCH /time-logs/:id/pause

Pause the active running session.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Time log ID |

**Responses:**

| Status | Description          |
| ------ | -------------------- |
| 200    | Session paused       |
| 400    | Session is not running |

**200 Response:**

```json
{
  "id": "uuid",
  "status": "paused",
  "startedAt": "2026-04-24T08:00:00.000Z",
  "pausedAt": "2026-04-24T08:30:00.000Z",
  "resumedAt": null,
  "stoppedAt": null,
  "duration": null,
  "description": null
}
```

---

### PATCH /time-logs/:id/resume

Resume a paused session.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Time log ID |

**Responses:**

| Status | Description           |
| ------ | --------------------- |
| 200    | Session resumed       |
| 400    | Session is not paused |

**200 Response:**

```json
{
  "id": "uuid",
  "status": "running",
  "startedAt": "2026-04-24T08:00:00.000Z",
  "pausedAt": "2026-04-24T08:30:00.000Z",
  "resumedAt": "2026-04-24T08:35:00.000Z",
  "stoppedAt": null,
  "duration": null,
  "description": null
}
```

---

### PATCH /time-logs/:id/stop

Stop and finalize the session. Calculates duration in seconds.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Time log ID |

**Responses:**

| Status | Description                |
| ------ | -------------------------- |
| 200    | Session stopped            |
| 400    | Session is already completed |

**200 Response:**

```json
{
  "id": "uuid",
  "status": "completed",
  "startedAt": "2026-04-24T08:00:00.000Z",
  "pausedAt": "2026-04-24T08:30:00.000Z",
  "resumedAt": "2026-04-24T08:35:00.000Z",
  "stoppedAt": "2026-04-24T09:00:00.000Z",
  "duration": 3600,
  "description": null
}
```

---

### PATCH /time-logs/:id

Add or update a session description. Only completed sessions are allowed.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Time log ID |

**Request Body:**

```json
{
  "description": "string"
}
```

**Responses:**

| Status | Description              |
| ------ | ------------------------ |
| 200    | Description updated      |
| 400    | Session is not completed |

**200 Response:**

```json
{
  "id": "uuid",
  "status": "completed",
  "startedAt": "2026-04-24T08:00:00.000Z",
  "pausedAt": null,
  "resumedAt": null,
  "stoppedAt": "2026-04-24T09:00:00.000Z",
  "duration": 3600,
  "description": "Reviewed PR #42 and left comments"
}
```

---

### GET /time-logs/active

Get the current active (running or paused) session, or null if none exists.

**Responses:**

| Status | Description              |
| ------ | ------------------------ |
| 200    | Active session or null   |

**200 Response (active session):**

```json
{
  "id": "uuid",
  "status": "running",
  "startedAt": "2026-04-24T08:00:00.000Z",
  "pausedAt": null,
  "resumedAt": null,
  "stoppedAt": null,
  "duration": null,
  "description": null,
  "task": {
    "id": "uuid",
    "name": "Code Review",
    "status": "active",
    "createdAt": "2026-04-24T00:00:00.000Z"
  }
}
```

**200 Response (no active session):**

```json
null
```

---

## Daily Summary

### GET /daily-summary

Get daily productivity summary for a given date.

**Query Parameters:**

| Name | Type   | Required | Description          |
| ---- | ------ | -------- | -------------------- |
| date | string | Yes      | Date in `YYYY-MM-DD` |

**Responses:**

| Status | Description            |
| ------ | ---------------------- |
| 200    | Daily summary returned |

**200 Response:**

```json
{
  "date": "2026-04-24",
  "totalHours": 3.5,
  "projectCount": 2,
  "projects": [
    {
      "id": "uuid",
      "name": "Daily Tracker",
      "totalHours": 2.0,
      "tasks": [
        {
          "id": "uuid",
          "name": "Code Review",
          "totalHours": 2.0,
          "sessions": [
            {
              "id": "uuid",
              "startedAt": "2026-04-24T08:00:00.000Z",
              "stoppedAt": "2026-04-24T10:00:00.000Z",
              "duration": 7200,
              "description": "Reviewed PR #42"
            }
          ]
        }
      ]
    },
    {
      "id": null,
      "name": null,
      "totalHours": 1.5,
      "tasks": [
        {
          "id": "uuid",
          "name": "Personal Reading",
          "totalHours": 1.5,
          "sessions": [
            {
              "id": "uuid",
              "startedAt": "2026-04-24T14:00:00.000Z",
              "stoppedAt": "2026-04-24T15:30:00.000Z",
              "duration": 5400,
              "description": "Read NestJS docs"
            }
          ]
        }
      ]
    }
  ]
}
```

**200 Response (no activity):**

```json
{
  "date": "2026-04-24",
  "totalHours": 0,
  "projectCount": 2,
  "projects": []
}
```

---

## Projects

### POST /projects

Create a new project. The authenticated user becomes the PM/owner.

**Request Body:**

```json
{
  "name": "string",
  "description": "string (optional)"
}
```

**Responses:**

| Status | Description     |
| ------ | --------------- |
| 201    | Project created |

**201 Response:**

```json
{
  "id": "uuid",
  "name": "Daily Tracker",
  "description": "A productivity tracking app",
  "status": "open",
  "ownerId": "uuid",
  "createdAt": "2026-04-24T00:00:00.000Z"
}
```

---

### GET /projects

List all projects the authenticated user is part of (as PM or Member).

**Responses:**

| Status | Description      |
| ------ | ---------------- |
| 200    | List of projects |

**200 Response:**

```json
[
  {
    "id": "uuid",
    "name": "Daily Tracker",
    "status": "open",
    "role": "pm",
    "memberCount": 3,
    "createdAt": "2026-04-24T00:00:00.000Z"
  }
]
```

---

### GET /projects/:id

Get full project details including members. Requires project membership.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Project ID  |

**Responses:**

| Status | Description      |
| ------ | ---------------- |
| 200    | Project details  |
| 404    | Project not found |

**200 Response:**

```json
{
  "id": "uuid",
  "name": "Daily Tracker",
  "description": "A productivity tracking app",
  "status": "open",
  "ownerId": "uuid",
  "members": [
    {
      "id": "uuid",
      "userId": "uuid",
      "username": "admin",
      "role": "pm",
      "joinedAt": "2026-04-24T00:00:00.000Z"
    }
  ],
  "createdAt": "2026-04-24T00:00:00.000Z"
}
```

---

### PATCH /projects/:id/close

Close a project, making it read-only. PM only.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Project ID  |

**Responses:**

| Status | Description       |
| ------ | ----------------- |
| 200    | Project closed    |
| 403    | Not a PM          |
| 404    | Project not found |

**200 Response:**

```json
{
  "id": "uuid",
  "status": "closed"
}
```

---

### PATCH /projects/:id/reopen

Reopen a closed project. PM only.

**Path Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uuid | Project ID  |

**Responses:**

| Status | Description       |
| ------ | ----------------- |
| 200    | Project reopened  |
| 403    | Not a PM          |
| 404    | Project not found |

**200 Response:**

```json
{
  "id": "uuid",
  "status": "open"
}
```

---

## Users

### GET /users

Search users by username. Used by PMs to find users to add to projects.

**Query Parameters:**

| Name   | Type   | Required | Description              |
| ------ | ------ | -------- | ------------------------ |
| search | string | Yes      | Username search query    |

**Responses:**

| Status | Description           |
| ------ | --------------------- |
| 200    | List of matching users |

**200 Response:**

```json
[
  {
    "id": "uuid",
    "username": "admin"
  }
]
```

---

## Project Members

### POST /projects/:projectId/members

Add a user as a member to the project. PM only.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |

**Request Body:**

```json
{
  "userId": "uuid"
}
```

**Responses:**

| Status | Description              |
| ------ | ------------------------ |
| 201    | Member added             |
| 403    | Not a PM                 |
| 409    | User is already a member |

**201 Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "role": "member",
  "joinedAt": "2026-04-24T00:00:00.000Z"
}
```

---

### DELETE /projects/:projectId/members/:userId

Remove a member from the project. PM only. Cannot remove the PM.

**Path Parameters:**

| Name      | Type | Description    |
| --------- | ---- | -------------- |
| projectId | uuid | Project ID     |
| userId    | uuid | User ID to remove |

**Responses:**

| Status | Description                    |
| ------ | ------------------------------ |
| 204    | Member removed                 |
| 403    | Not a PM or cannot remove PM   |
| 404    | Member not found               |

---

### GET /projects/:projectId/members

List all members of a project. Requires project membership.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |

**Responses:**

| Status | Description     |
| ------ | --------------- |
| 200    | List of members |

**200 Response:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "username": "admin",
    "role": "pm",
    "joinedAt": "2026-04-24T00:00:00.000Z"
  }
]
```

---

### POST /projects/:projectId/leave-requests

Request to leave a project. PM cannot request to leave.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |

**Responses:**

| Status | Description                       |
| ------ | --------------------------------- |
| 201    | Leave request created             |
| 403    | PM cannot request to leave        |
| 409    | Pending request already exists    |

**201 Response:**

```json
{
  "id": "uuid",
  "projectId": "uuid",
  "userId": "uuid",
  "status": "pending",
  "createdAt": "2026-04-24T00:00:00.000Z"
}
```

---

### GET /projects/:projectId/leave-requests

List pending leave requests. PM only.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |

**Responses:**

| Status | Description            |
| ------ | ---------------------- |
| 200    | List of leave requests |
| 403    | Not a PM               |

**200 Response:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "username": "john",
    "status": "pending",
    "createdAt": "2026-04-24T00:00:00.000Z"
  }
]
```

---

### PATCH /projects/:projectId/leave-requests/:requestId

Approve or reject a leave request. PM only. Approving removes the member's access but preserves their data.

**Path Parameters:**

| Name      | Type | Description      |
| --------- | ---- | ---------------- |
| projectId | uuid | Project ID       |
| requestId | uuid | Leave request ID |

**Request Body:**

```json
{
  "status": "approved | rejected"
}
```

**Responses:**

| Status | Description              |
| ------ | ------------------------ |
| 200    | Leave request updated    |
| 403    | Not a PM                 |
| 404    | Leave request not found  |

**200 Response:**

```json
{
  "id": "uuid",
  "status": "approved"
}
```

---

## Project Tasks

### POST /projects/:projectId/tasks

Create a task within a project. PM can assign to any member; members can only self-assign.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |

**Request Body:**

```json
{
  "name": "string",
  "assigneeId": "uuid (optional, defaults to self)"
}
```

**Responses:**

| Status | Description                      |
| ------ | -------------------------------- |
| 201    | Task created                     |
| 400    | Project is closed                |
| 403    | Members can only self-assign     |
| 409    | Duplicate task name in project   |

**201 Response:**

```json
{
  "id": "uuid",
  "name": "Implement login page",
  "assigneeId": "uuid",
  "status": "active",
  "projectId": "uuid",
  "createdAt": "2026-04-24T00:00:00.000Z"
}
```

---

### GET /projects/:projectId/tasks

List all tasks in a project with assignee info, status, and activity indicators.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |

**Responses:**

| Status | Description   |
| ------ | ------------- |
| 200    | List of tasks |

**200 Response:**

```json
[
  {
    "id": "uuid",
    "name": "Implement login page",
    "assignee": {
      "id": "uuid",
      "username": "john"
    },
    "status": "active",
    "isInProgress": true,
    "sessionCount": 3
  }
]
```

---

### PATCH /projects/:projectId/tasks/:taskId/assign

Assign or reassign a task to a project member. PM only.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |
| taskId    | uuid | Task ID     |

**Request Body:**

```json
{
  "assigneeId": "uuid"
}
```

**Responses:**

| Status | Description        |
| ------ | ------------------ |
| 200    | Task assigned      |
| 400    | Project is closed  |
| 403    | Not a PM           |
| 404    | Task not found     |

**200 Response:**

```json
{
  "id": "uuid",
  "assigneeId": "uuid"
}
```

---

### PATCH /projects/:projectId/tasks/:taskId/archive

Archive a task within a project.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |
| taskId    | uuid | Task ID     |

**Responses:**

| Status | Description       |
| ------ | ----------------- |
| 200    | Task archived     |
| 400    | Project is closed |
| 404    | Task not found    |

**200 Response:**

```json
{
  "id": "uuid",
  "status": "archived"
}
```

---

## Project Dashboard

### GET /projects/:projectId/dashboard

Get PM project monitoring dashboard with team activity. PM only. Defaults to current week if no date range provided.

**Path Parameters:**

| Name      | Type | Description |
| --------- | ---- | ----------- |
| projectId | uuid | Project ID  |

**Query Parameters:**

| Name | Type   | Required | Description          |
| ---- | ------ | -------- | -------------------- |
| from | string | No       | Start date YYYY-MM-DD |
| to   | string | No       | End date YYYY-MM-DD   |

**Responses:**

| Status | Description    |
| ------ | -------------- |
| 200    | Dashboard data |
| 403    | Not a PM       |

**200 Response:**

```json
{
  "project": {
    "id": "uuid",
    "name": "Daily Tracker",
    "status": "work_in_progress"
  },
  "members": [
    {
      "id": "uuid",
      "username": "john",
      "totalHours": 5.5,
      "taskCount": 2,
      "isActive": true,
      "tasks": [
        {
          "id": "uuid",
          "name": "Implement login page",
          "isInProgress": true,
          "totalHours": 3.0,
          "sessions": [
            {
              "id": "uuid",
              "startedAt": "2026-04-24T08:00:00.000Z",
              "stoppedAt": "2026-04-24T11:00:00.000Z",
              "duration": 10800,
              "description": "Built login form and validation"
            }
          ]
        }
      ]
    }
  ]
}
```
