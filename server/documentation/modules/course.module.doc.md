# Course Module Documentation

## Overview

The Course module manages the creation, retrieval, and updating of courses, as well as adding lessons to courses. Courses may be filtered by category, and each course keeps track of its creation and update timestamps.

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
- `luxon` package (for timestamps)
- Connection to MongoDB via `connectDB`

## Data Models

### Course Document

| Field         | Type     | Description                           |
| ------------- | -------- | ------------------------------------- |
| `_id`         | ObjectId | Unique identifier for the course      |
| `title`       | String   | Course title                          |
| `description` | String   | Course description                    |
| `category`    | String   | Course category                       |
| `lessons`     | Array    | List of lessons in the course         |
| `createdBy`   | ObjectId | ID of the user who created the course |
| `createdAt`   | Date     | Timestamp when course was created     |
| `updatedAt`   | Date     | Timestamp of last update              |

## Services

1. **`Course.add(newCourse)`**

   - **Purpose:** Add a new course
   - **Parameters:** `newCourse` – object with course details
   - **Returns:** Object containing `_id` of the new course
   - **Errors:** Throws error if required fields are missing or DB operation fails

2. **`Course.getAll(category)`**

   - **Purpose:** Retrieve all courses, optionally filtered by category
   - **Parameters:** `category` (optional)
   - **Returns:** Array of course objects
   - **Errors:** Throws error if DB operation fails

3. **`Course.get(id)`**

   - **Purpose:** Retrieve a single course by its ID
   - **Parameters:** `id` – course ID (required)
   - **Returns:** Course object or `null` if not found
   - **Errors:** Throws error if ID is missing or invalid

4. **`Course.update(id, newCourse)`**

   - **Purpose:** Update course details
   - **Parameters:** `id` – course ID, `newCourse` – fields to update
   - **Returns:** Updated course object or `null` if course not found
   - **Errors:** Throws error if DB operation fails

5. **`Course.findByIdAndAddLesson(id, newLesson)`**
   - **Purpose:** Add a lesson to a course
   - **Parameters:** `id` – course ID, `newLesson` – lesson object
   - **Returns:** Updated course object after adding the lesson
   - **Errors:** Throws error if DB operation fails

## API Endpoints

| Method | Endpoint       | Middleware | Description                                 |
| ------ | -------------- | ---------- | ------------------------------------------- |
| POST   | `/courses`     | None       | Add a new course                            |
| GET    | `/courses`     | None       | Fetch all courses (optional category query) |
| GET    | `/courses/:id` | None       | Fetch a single course by ID                 |
| PATCH  | `/courses/:id` | None       | Update a course                             |
| POST   | `/courses/:id` | None       | Add a lesson to a course                    |

## Database Operations

- **Collection Name:** `courses`
- **CRUD Operations:**
  - `add(newCourse)` → Create a new course
  - `getAll(category)` → Read all courses (optional category filter)
  - `get(id)` → Read single course by ID
  - `update(id, newCourse)` → Update course
  - `findByIdAndAddLesson(id, newLesson)` → Update course lessons array

## Error Handling

- Missing required parameters (ID, newCourse, or newLesson)
- Course not found
- Database operation failures (insert, update, query)
- Invalid ObjectId format
