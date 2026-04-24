# Daily Tracker — Backend User Stories

## General Requirements

- All endpoints (except login) require a valid JWT authentication token
- All timestamps are server-generated for accuracy
- Responses use JSON format

---

## EP-01: Authentication

### US-01.02: Login API endpoint

**As a** system,
**I want to** authenticate users against stored credentials,
**So that** only valid users receive an access token.

**Story Points:** 3

**Acceptance Criteria:**

- POST /auth/login accepts `{ username, password }`
- Valid credentials return `{ token }` with a 200 status
- Invalid credentials return an error message with a 401 status
- Token is a signed JWT with an expiration

---

## EP-02: Task Management

### US-02.02: Task CRUD API endpoints

**As a** system,
**I want to** provide endpoints for creating and managing tasks,
**So that** the frontend can perform task operations.

**Story Points:** 5

**Acceptance Criteria:**

- POST /tasks accepts `{ name }` and returns the created task
- GET /tasks returns a list of tasks, filterable by `?status=active|archived`
- PATCH /tasks/:id/archive sets the task status to archived
- Duplicate task names return a 409 conflict error
- All endpoints require a valid authentication token

---

## EP-03: Time Tracking

### US-03.02: Time log API endpoints

**As a** system,
**I want to** provide endpoints for managing time log sessions,
**So that** the frontend can control timer operations.

**Story Points:** 5

**Acceptance Criteria:**

- POST /time-logs accepts `{ taskId }` and returns a new session with server-generated startedAt
- PATCH /time-logs/:id/pause records pausedAt and sets status to paused
- PATCH /time-logs/:id/resume records resumedAt and sets status to running
- PATCH /time-logs/:id/stop records stoppedAt, calculates duration, and sets status to completed
- GET /time-logs/active returns the current running or paused session (or null)
- Only one active session per user is enforced at the database level
- All timestamps are server-generated for accuracy

---

## EP-04: Session Reflection

### US-04.02: Update session description API

**As a** system,
**I want to** provide an endpoint for updating a time log's description,
**So that** users can add session notes.

**Story Points:** 2

**Acceptance Criteria:**

- PATCH /time-logs/:id accepts `{ description }` and updates the record
- Only completed sessions can have descriptions added
- The endpoint requires a valid authentication token

---

## EP-05: Daily Productivity View

### US-05.02: Daily summary API endpoint

**As a** system,
**I want to** provide an endpoint that returns a daily productivity summary,
**So that** the frontend can display aggregated daily data.

**Story Points:** 5

**Acceptance Criteria:**

- GET /daily-summary?date=YYYY-MM-DD returns the summary for the given date
- Response includes total hours, tasks with aggregated hours, and individual sessions
- Sessions include startedAt, stoppedAt, duration, and description
- Duration is returned in seconds; hours are calculated as duration / 3600
- The endpoint requires a valid authentication token

---

## Backend MVP Summary

| Epic                      | Story Count | Total Points |
| ------------------------- | ----------- | ------------ |
| EP-01: Authentication     | 1           | 3            |
| EP-02: Task Management    | 1           | 5            |
| EP-03: Time Tracking      | 1           | 5            |
| EP-04: Session Reflection | 1           | 2            |
| EP-05: Daily Productivity | 1           | 5            |
| **MVP Total**             | **5**       | **20**       |
