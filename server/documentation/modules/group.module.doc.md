# Group Module Documentation

## Overview

The Group module handles the management of user groups in the system. It provides functionality to create, update, and retrieve groups, as well as manage group members. Groups are linked to a team leader, agents, and accounts.

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
- `luxon` (if needed for dates)
- Connection to MongoDB via `connectDB`

## Data Models

### Group Document

| Field          | Type            | Description                          |
| -------------- | --------------- | ------------------------------------ |
| `_id`          | ObjectId        | Unique identifier for the group      |
| `name`         | String          | Name of the group                    |
| `teamLeaderId` | ObjectId        | ID of the team leader                |
| `accountIds`   | Array[ObjectId] | List of linked account IDs           |
| `agentIds`     | Array[ObjectId] | List of linked agent IDs             |
| `createdAt`    | Date            | Timestamp when the group was created |

## Services

1. `Group.getAll(id)`

   - **Purpose:** Fetch all groups led by a specific team leader with linked accounts and agents.
   - **Parameters:**  
     `id` – Team leader's ID (required)
   - **Returns:** Array of group objects
   - **Errors:**  
     Throws error if `id` is missing or DB operation fails.

2. `Group.get(id)`

   - **Purpose:** Fetch a single group led by a specific team leader.
   - **Parameters:**  
     `id` – Team leader's ID (required)
   - **Returns:** Single group object or `null` if not found
   - **Errors:**  
     Throws error if `id` is missing or DB operation fails.

3. `Group.addGroup(teamLeaderId, name)`

   - **Purpose:** Create a new group
   - **Parameters:**  
     `teamLeaderId` – ID of team leader (required)  
     `name` – Name of the group (required)
   - **Returns:** Inserted group ID
   - **Errors:**  
     Throws error if parameters are missing.

4. `Group.updateGroup(id, name)`

   - **Purpose:** Update group name
   - **Parameters:**  
     `id` – Group ID (required)  
     `name` – New group name (required)
   - **Returns:** Number of updated documents
   - **Errors:**  
     Throws error if group not found or parameters are missing.

5. `Group.addMember(groupId, userId)`

   - **Purpose:** Add a user to a group
   - **Parameters:**  
     `groupId` – Group ID (required)  
     `userId` – User ID (required)
   - **Returns:** Updated group object
   - **Errors:**  
     Throws error if group not found, user already a member, or DB operation fails.

6. `Group.removeMember(groupId, userId)`

   - **Purpose:** Remove a user from a group
   - **Parameters:**  
     `groupId` – Group ID (required)  
     `userId` – User ID (required)
   - **Returns:** Success message
   - **Errors:**  
     Throws error if member not found or already removed.

## API Endpoints

| Method | Endpoint             | Middleware | Description                        |
| ------ | -------------------- | ---------- | ---------------------------------- |
| GET    | `/get-groups/:id`    | None       | Fetch all groups for a team leader |
| GET    | `/get-group/:id`     | None       | Fetch a single group               |
| POST   | `/add-group`         | None       | Add a new group                    |
| PATCH  | `/update-group`      | None       | Update group name                  |
| PATCH  | `/add-member/:id`    | None       | Add member to a group              |
| PATCH  | `/remove-member/:id` | None       | Remove member from a group         |

## Database Operations

- **Collection Name:** `groups`
- **CRUD Operations:**
  - `getAll(id)` → Read all groups by team leader
  - `get(id)` → Read single group by team leader
  - `addGroup(teamLeaderId, name)` → Create new group
  - `updateGroup(id, name)` → Update existing group
  - `addMember(groupId, userId)` → Update array `agentIds`
  - `removeMember(groupId, userId)` → Pull user from `agentIds`

## Error Handling

- Missing required parameters (ID, name, or user ID)
- Group not found or member already exists
- Database operation failures (insert, update, aggregation)
- Adding a member already in the group or removing a member not in the group
