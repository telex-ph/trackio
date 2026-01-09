# User Module Documentation

## Overview

The User Module manages user-related functionality within the system. It is responsible for creating, updating, retrieving, and soft-deleting user records, as well as enforcing role-based visibility, authentication constraints, and schedule-aware queries. All user data is persisted in MongoDB under the `users` collection.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Data Models](#data-models)
3. [Services](#services)
4. [API Endpoints](#api-endpoints)
5. [Database Operations](#database-operations)
6. [Error Handling](#error-handling)

## Prerequisites

The following tools and technologies are required to use and maintain this module:

- Node.js
- Express.js
- MongoDB
- Luxon (for schedule-aware and timezone-sensitive logic)
- JWT-based authentication middleware

## Data Models

### User Document Structure

Each user document stored in MongoDB contains the following fields:

| Field        | Type          | Description                                 |
| ------------ | ------------- | ------------------------------------------- |
| \_id         | ObjectId      | Unique identifier                           |
| employeeId   | String        | Company-assigned employee ID                |
| firstName    | String        | User first name                             |
| lastName     | String        | User last name                              |
| email        | String        | User email address                          |
| phoneNumber  | String        | Contact number                              |
| role         | String        | User role (agent, team-leader, admin, etc.) |
| groupId      | ObjectId      | Assigned group ID                           |
| teamLeaderId | ObjectId      | Assigned team leader                        |
| shiftDays    | Array<number> | Days of week the user is scheduled          |
| password     | String        | Hashed password                             |
| isDeleted    | Boolean       | Soft-delete flag                            |
| createdAt    | Date          | Record creation timestamp                   |

## Services

1. **`User.getAll(search, role)`**

   - **Purpose:** Retrieve all users with optional search and role filter
   - **Parameters:** `search` (optional), `role` (optional)
   - **Returns:** Array of users
   - **Errors:** Throws error if DB operation fails

2. **`User.getById(id)`**

   - **Purpose:** Fetch a single user by ID
   - **Parameters:** `id` (required)
   - **Returns:** User object
   - **Errors:** Throws error if DB operation fails

3. **`User.addUser(userData)`**

   - **Purpose:** Add a new user
   - **Parameters:** `userData` – object containing user info
   - **Returns:** Created user object
   - **Errors:** Throws error if required fields are missing or DB operation fails

4. **`User.update(id, field, newValue)`**

   - **Purpose:** Update a specific field for a user
   - **Parameters:** `id`, `field`, `newValue`
   - **Returns:** Updated user object
   - **Errors:** Throws error if parameters are missing or DB operation fails

5. **`User.getUsersByRoleScope(id, role)`**

   - **Purpose:** Fetch users within a role scope
   - **Parameters:** `id` – ID of requester, `role` – role filter
   - **Returns:** Array of users
   - **Errors:** Throws error if DB operation fails

6. **`User.getUserAccountsById(id)`**

   - **Purpose:** Fetch users associated with specific accounts
   - **Parameters:** `id` – user ID
   - **Returns:** Array of users
   - **Errors:** Throws error if DB operation fails

7. **`User.deleteUser(id)`**
   - **Purpose:** Soft-delete a user by setting `isDeleted` to true
   - **Parameters:** `id` – user ID
   - **Returns:** Updated user object
   - **Errors:** Throws error if DB operation fails

### Core Responsibilities

- Create and update user records
- Perform soft deletion instead of hard deletes
- Apply role-based scoping for queries
- Exclude sensitive fields such as passwords
- Support schedule-aware user filtering

Service-level validation ensures ObjectId integrity, required fields, and role constraints before database operations are executed.

## API Endpoints

Base Path: `/user`

| Method | Route                    | Description                                             |
| ------ | ------------------------ | ------------------------------------------------------- |
| GET    | `/get-users`             | Fetch all users with optional search and role filtering |
| GET    | `/users`                 | Lightweight user search endpoint                        |
| POST   | `/add-user`              | Create a new user                                       |
| GET    | `/get-user/:id`          | Fetch a user by ObjectId or employeeId                  |
| PATCH  | `/update-user/:id`       | Update a single user field                              |
| PATCH  | `/update-details/:id`    | Update multiple user fields                             |
| PATCH  | `/delete-user/:id`       | Soft-delete a user                                      |
| GET    | `/get-by-role/:id/:role` | Fetch users scoped by role hierarchy                    |
| GET    | `/get-by-account/:id`    | Fetch users by account association                      |

All endpoints automatically exclude soft-deleted users and omit password fields in responses.

## Database Operations

The User model encapsulates all MongoDB interactions for the `users` collection.

### Supported Operations

- Insert new user documents with default values
- Update individual or multiple fields dynamically
- Soft-delete users by setting `isDeleted: true`
- Perform aggregation lookups for groups, accounts, schedules, and team leaders
- Apply search filters and role-based access constraints

No operation permanently removes user records from the database.

## Error Handling

Common error scenarios handled by this module include:

- Missing or invalid ObjectId parameters
- Attempting to access soft-deleted users
- Invalid role or scope resolution
- Failed database operations

Unexpected errors return HTTP `500` responses with descriptive error messages for easier debugging.

### Notes

- Passwords are never returned in API responses
- All user queries implicitly exclude `isDeleted: true`
- Role-based visibility is enforced at the service layer
- This module is designed to be extensible for future authentication and scheduling features
