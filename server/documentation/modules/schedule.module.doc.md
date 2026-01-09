# Schedule Module Documentation

## Overview

The Schedule Module provides functionality for managing employee schedules, including adding, deleting, and fetching schedules. It uses `Node.js`, `Express`, `MongoDB`, and `Luxon` for date handling. The module ensures schedules are correctly formatted with proper timezone handling and provides persistent storage in MongoDB.

## Table of Contents:

1. [Prerequisites](#prerequisites)
2. [Data Models](#data-models)
3. [Services](#services)
4. [API Endpoints](#api-endpoints)
5. [Database Operations](#database-operations)
6. [Date Handling and Timezone](#date-handling-and-timezone)
7. [Error Handling](#error-handling)

## Data Models

### Schedule Document Structure

Each schedule document stored in MongoDB has the following fields:

| Field      | Type     | Description                               |
| ---------- | -------- | ----------------------------------------- |
| userId     | ObjectId | ID of the user                            |
| date       | Date     | Base date of the schedule (start of day)  |
| shiftStart | Date     | Shift start datetime (optional)           |
| shiftEnd   | Date     | Shift end datetime (optional)             |
| type       | String   | Schedule type (e.g., WORK_DAY, REPORTING) |
| notes      | String   | Notes for the schedule                    |
| createdAt  | Date     | Record creation timestamp (UTC)           |
| updatedAt  | Date     | Last update timestamp (UTC)               |
| updatedBy  | ObjectId | User who updated the schedule             |

### Schedule Types

The module uses constants defined in [schedule.js](../../constants/schedule.js).

## Services

1. `addSchedulesService(schedules, userId, schedType, updatedBy)`

   - Purpose: Format and add multiple schedules for a user.
   - Parameters:
     - `schedules` – Array of schedule objects
     - `userId` – MongoDB ObjectId of the user
     - `schedType` – Type of schedule
     - `updatedBy` - MongoDB ObjectId of the updater
   - Returns: Result object containing counts of inserted, matched, and modified schedules
   - Throws: `USER_NOT_FOUND` if user does not exist

2. `deleteSchedulesService(userId, shiftSchedules)`

   - Purpose: Delete multiple schedules for a user.
   - Parameters:
     - `userId` – MongoDB ObjectId of the user
     - `shiftSchedules` – Array of ISO date strings to delete
   - Returns: `{ deletedCount: number }`

3. `getSchedulesService(id, currMonth, currYear)`

   - Purpose: Fetch all schedules for a user within the current, previous, and next month.
   - Parameters:
     - `id` – MongoDB ObjectId of the user
     - `currMonth` – Current month (number)
     - `currYear` – Current year (number)
   - Returns: Array of schedule documents

4. `getScheduleService(id, date)`

   - Purpose: Fetch a specific schedule for a user on a given date
   - Parameters:
     - `id` – MongoDB ObjectId of the user
     - `date` – ISO string date
   - Returns: Schedule document or `null` if not found

## API Endpoints

| Method | Route                     | Middleware  | Description                                          |
| ------ | ------------------------- | ----------- | ---------------------------------------------------- |
| POST   | `/upsert-schedules`       | `verifyJWT` | Add or update multiple schedules                     |
| DELETE | `/delete-schedules`       | `verifyJWT` | Delete multiple schedules                            |
| GET    | `/get-schedules/:id`      | `verifyJWT` | Fetch all schedules for a user (query by month/year) |
| GET    | `/get-schedule/:id/:date` | `verifyJWT` | Fetch a single schedule by date                      |

## Database Operations

`Schedules` Class

Handles all MongoDB operations for the schedules collection.

- `addAll(schedules):` Bulk upsert schedules using updateOne with upsert: true
- `deleteAll(schedules, userId):` Bulk delete schedules
- `getAll(id, startDate, endDate):` Fetch schedules with optional date range; includes a lookup to users for updatedBy
- `get(id, min, max):` Fetch a single schedule for a user between min and max datetime

## Date Handling and Timezone

- All input schedules are assumed in Asia/Manila timezone
- Stored in MongoDB as UTC
- Shift start and end times are merged with the schedule date; if shiftEnd is earlier than shiftStart, it is assumed to be on the next day

## Error Handling

- Throws `USER_NOT_FOUND` when user does not exist
- Throws errors if schedules array is empty or invalid
- API responses return HTTP 500 with error messages on unexpected issues

### Notes

- Always ensure that the updatedBy user exists
- Date inputs must be ISO-formatted strings
- Proper JWT verification is required for all API endpoints
