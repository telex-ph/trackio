# Attendance Module Documentation

## Overview

The Attendance module manages employee time tracking, including time-in, time-out, breaks, and status updates. It provides endpoints to add attendance, update records, fetch attendance logs, and monitor employees currently on break.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Data Models](#data-models)
3. [Services](#services)
4. [API Endpoints](#api-endpoints)
5. [Database Operations](#database-operations)
6. [Error Handling](#error-handling)

## Prerequisites

- Node.js and npm
- Express.js
- MongoDB
- `mongodb` package
- `luxon` package for timezone handling
- JWT middleware for authentication (`verifyJWT`)
- Access to `Schedules` module for time-in validation

## Data Models

### Attendance Document (`attendances` collection)

| Field        | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `_id`        | ObjectId | Unique attendance record ID                          |
| `userId`     | ObjectId | Reference to the user                                |
| `employeeId` | String   | Employee ID                                          |
| `shiftDate`  | Date     | Date of the shift (UTC)                              |
| `shiftStart` | Date     | Shift start time                                     |
| `shiftEnd`   | Date     | Shift end time                                       |
| `timeIn`     | Date     | Clock-in timestamp                                   |
| `timeOut`    | Date     | Clock-out timestamp                                  |
| `status`     | String   | Attendance status (Working, On Break, On Lunch, OOF) |
| `breaks`     | Array    | List of breaks with `start`, `end`, `duration`       |
| `totalBreak` | Number   | Total break duration in milliseconds                 |
| `createdAt`  | Date     | Record creation timestamp                            |
| `updatedAt`  | Date     | Record last update timestamp                         |

## Services

1. **`Attendance.getAll(options)`**

   - **Purpose:** Retrieve attendance records with optional filtering by date range, status, or role
   - **Parameters:**
     - `startDate` / `endDate` - Filter by creation date
     - `filter` - "timeIn", "timeOut", "late", "onBreak", "onLunch", "undertime", "all"
     - `role` - Optional role for role-based filtering
     - `userId` - Optional for team leader filtering
   - **Returns:** List of attendance records with user, group, and account details
   - **Errors:** Throws if DB query fails

2. **`Attendance.getById(id, sort)`**

   - **Purpose:** Get all attendance records for a specific user for today
   - **Parameters:** `id` (user ID), `sort` ("asc" or "desc")
   - **Returns:** List of today’s attendance records, ongoing or latest shift
   - **Errors:** Throws if no ID provided

3. **`Attendance.getByDocId(docId)`**

   - **Purpose:** Get a single attendance record by document ID
   - **Parameters:** `docId`
   - **Returns:** Attendance record or `null` if not found
   - **Errors:** Throws if DB query fails

4. **`Attendance.updateById(id, fields, status)`**

   - **Purpose:** Update specific fields and optionally the status of an attendance record
   - **Parameters:** `id`, `fields` (key/value), `status` (optional)
   - **Returns:** Update operation result (`matchedCount`, `modifiedCount`)
   - **Errors:** Throws if ID or fields are missing

5. **`Attendance.updateFieldById(id, field, newValue)`**

   - **Purpose:** Update a single field in an attendance record
   - **Parameters:** `id`, `field`, `newValue`
   - **Returns:** Update operation result
   - **Errors:** Throws if ID or field missing

6. **`Attendance.updateLastBreakStartById(id)`**

   - **Purpose:** Updates the start time of the latest break in a record
   - **Parameters:** `id`
   - **Returns:** Update operation result
   - **Errors:** Throws if ID missing or no breaks exist

7. **`Attendance.timeIn(id, employeeId, shiftStart, shiftEnd, now)`**

   - **Purpose:** Record a user’s time-in for a shift
   - **Parameters:** `id` (user ID), `employeeId`, `shiftStart`, `shiftEnd`, `now` (current datetime)
   - **Returns:** Inserted attendance record
   - **Errors:** Throws if duplicate or invalid record

8. **`Attendance.timeOut(docId, status, updatedAt, timeOut)`**

   - **Purpose:** Record a user’s time-out for a shift
   - **Parameters:** `docId`, `status`, `updatedAt`, `timeOut`
   - **Returns:** `true` if successful
   - **Errors:** Throws if DB operation fails

9. **`Attendance.breakIn(docId, newBreaks, totalBreak, status, updatedAt)`**

   - **Purpose:** Start a break for a user
   - **Parameters:** `docId`, `newBreaks`, `totalBreak`, `status`, `updatedAt`
   - **Returns:** `true` if successful
   - **Errors:** Throws if DB operation fails

10. **`Attendance.breakOut(docId, newBreaks, totalBreak, status, updatedAt)`**

    - **Purpose:** End a user’s break
    - **Parameters:** `docId`, `newBreaks`, `totalBreak`, `status`, `updatedAt`
    - **Returns:** `true` if successful
    - **Errors:** Throws if DB operation fails

11. **`Attendance.getAllOnBreak()`**
    - **Purpose:** Get all users currently on break
    - **Parameters:** None
    - **Returns:** List of attendance records with user info
    - **Errors:** Throws if DB query fails

## API Endpoints

| Method | Endpoint                              | Middleware  | Description                                   |
| ------ | ------------------------------------- | ----------- | --------------------------------------------- |
| POST   | `/attendance/add-attendance/:id`      | `verifyJWT` | Record time-in for a user                     |
| GET    | `/attendance/get-attendances`         | `verifyJWT` | Get filtered list of attendance records       |
| GET    | `/attendance/get-all-onbreak`         | None        | Get all users currently on break              |
| GET    | `/attendance/get-attendance/:id`      | `verifyJWT` | Get all attendance records for a user today   |
| PATCH  | `/attendance/update-attendance`       | `verifyJWT` | Update fields and/or status of a record       |
| PATCH  | `/attendance/update-attendance-field` | `verifyJWT` | Update a single field of an attendance record |

## Database Operations

- **Collection:** `attendances`
- **CRUD Operations:**
  - `Attendance.getAll()` → Aggregated query with filtering, role-based access
  - `Attendance.getById()` → Query by user ID with today’s shift boundaries
  - `Attendance.timeIn()` → Insert new attendance
  - `Attendance.timeOut()` → Update record with clock-out
  - `Attendance.breakIn()/breakOut()` → Update breaks array and total break
  - `Attendance.updateById()` → Update fields and status
  - `Attendance.updateFieldById()` → Update single field
  - `Attendance.getAllOnBreak()` → Aggregated query for users on break

## Error Handling

- Missing required parameters (ID, fields, docId, break info)
- Duplicate time-in attempts
- No matching schedule for time-in
- Invalid date formats
- Database operation failures (insert, update, query)
- Break operations with missing or incomplete break arrays
