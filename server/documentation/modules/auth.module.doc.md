# Auth Module Documentation

## Overview

The Auth module handles user authentication, authorization, session management, and password recovery. It provides endpoints for logging in, changing passwords, generating and refreshing tokens, verifying OTP codes, and retrieving authenticated user information.

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
- `bcrypt` package
- `jose` package (for JWT signing/encryption)
- Connection to MongoDB via `connectDB`
- Environment variables for `PRIVATE_KEY`, `PUBLIC_KEY`, `FRONTEND_URL`

## Data Models

### User Authentication (users collection)

| Field          | Type     | Description                  |
| -------------- | -------- | ---------------------------- |
| `_id`          | ObjectId | Unique user identifier       |
| `email`        | String   | User email                   |
| `password`     | String   | Hashed password              |
| `role`         | String   | User role                    |
| `teamLeaderId` | ObjectId | Team leader reference        |
| `isDeleted`    | Boolean  | Indicates if user is deleted |

### OTP Document (`otps` collection)

| Field       | Type     | Description                     |
| ----------- | -------- | ------------------------------- |
| `_id`       | ObjectId | Unique OTP record ID            |
| `userId`    | ObjectId | User associated with the OTP    |
| `hashedOtp` | String   | OTP stored as a hashed string   |
| `expiresAt` | Date     | Expiration timestamp of the OTP |

## Services

1. **`Auth.compare(id, password)`**

   - **Purpose:** Compare a plaintext password with the stored hashed password for a user
   - **Parameters:** `id` (user ID), `password` (plaintext)
   - **Returns:** `true` if matched, otherwise `false`
   - **Errors:** Throws if user not found or missing parameters

2. **`Auth.change(id, newPassword)`**

   - **Purpose:** Update a user’s password
   - **Parameters:** `id` (user ID), `newPassword` (hashed password)
   - **Returns:** Update result
   - **Errors:** Throws if user not found or missing parameters

3. **`User.login(email, password)`**

   - **Purpose:** Authenticate a user using email and password
   - **Parameters:** `email`, `password`
   - **Returns:** User object and token payload
   - **Errors:** Throws if credentials are invalid

4. **`forgotPassword(email)`**

   - **Purpose:** Initiates a password reset by sending a secure reset link
   - **Parameters:** `email`
   - **Returns:** Reset request result with redirect info
   - **Errors:** Throws if user not found or email sending fails

5. **`verifyForgotPassword(payload, newPassword)`**

   - **Purpose:** Verifies the reset token and updates the password
   - **Parameters:** `payload` (encrypted reset payload), `newPassword`
   - **Returns:** `isValid: true` if successful
   - **Errors:** Throws if payload is invalid, expired, or password not updated

6. **`verifyOtpCode(code, payload)`**

   - **Purpose:** Verifies OTP for 2-factor authentication
   - **Parameters:** `code`, `payload`
   - **Returns:** Session token cookie if valid
   - **Errors:** Throws if OTP incorrect or expired

7. **`changePassword(id, password, newPassword)`**

   - **Purpose:** Allows authenticated user to change password
   - **Parameters:** `id`, `password` (current), `newPassword`
   - **Returns:** Success message if updated
   - **Errors:** Throws if current password invalid or DB operation fails

8. **`createToken(user)`**

   - **Purpose:** Generates access and refresh tokens for a user
   - **Parameters:** `user` object
   - **Returns:** Sets `accessToken` and `refreshToken` as httpOnly cookies
   - **Errors:** Throws if token signing fails

9. **`createNewToken()`**

   - **Purpose:** Refresh access token using a valid refresh token
   - **Parameters:** HTTP cookies containing `refreshToken`
   - **Returns:** Sets new `accessToken` cookie
   - **Errors:** Throws if refresh token missing or expired

10. **`deleteToken()`**

    - **Purpose:** Logs out user by clearing authentication cookies
    - **Parameters:** None
    - **Returns:** Logout confirmation
    - **Errors:** None

11. **`getAuthUser(req.user)`**

    - **Purpose:** Retrieves the currently authenticated user details
    - **Parameters:** `req.user` (decoded token)
    - **Returns:** Full user object
    - **Errors:** Throws if user not authenticated or not found

12. **`getStatus(req.user)`**

    - **Purpose:** Checks token validity and user authentication status
    - **Parameters:** `req.user`
    - **Returns:** `isValid: true/false`
    - **Errors:** Throws if token invalid or expired

13. **`Otp.create(userId, hashedOtp)`**

    - **Purpose:** Stores an OTP for user verification
    - **Parameters:** `userId`, `hashedOtp`
    - **Returns:** OTP record ID
    - **Errors:** Throws if DB operation fails

14. **`Otp.get(userId)`**
    - **Purpose:** Retrieves the latest valid OTP for a user
    - **Parameters:** `userId`
    - **Returns:** OTP record or `null` if expired
    - **Errors:** Throws if DB operation fails

## API Endpoints

| Method | Endpoint                       | Middleware  | Description                              |
| ------ | ------------------------------ | ----------- | ---------------------------------------- |
| POST   | `/auth/log-in`                 | None        | Authenticate user and generate tokens    |
| POST   | `/auth/change-password`        | None        | Change user password                     |
| POST   | `/auth/forgot-password`        | None        | Initiate password reset                  |
| POST   | `/auth/verify-forgot-password` | None        | Verify password reset payload            |
| POST   | `/auth/verify-code`            | None        | Verify OTP code for 2FA                  |
| POST   | `/auth/create-token`           | None        | Generate access and refresh tokens       |
| POST   | `/auth/create-new-token`       | None        | Refresh access token using refresh token |
| GET    | `/auth/delete-token`           | None        | Logout user by deleting cookies          |
| GET    | `/auth/get-auth-user`          | `verifyJWT` | Retrieve authenticated user details      |
| GET    | `/auth/status`                 | `verifyJWT` | Check user authentication status         |

## Database Operations

- **Collections:** `users`, `otps`
- **CRUD Operations:**
  - `Auth.compare(id, password)` → Read user password
  - `Auth.change(id, newPassword)` → Update password
  - `Otp.create(userId, hashedOtp)` → Create OTP record
  - `Otp.get(userId)` → Read latest OTP
  - User login, token creation, and verification handled by service logic

## Error Handling

- Missing required parameters (ID, password, payload, code)
- Invalid credentials (login)
- Expired or invalid tokens (access, refresh, session, OTP)
- OTP incorrect or expired
- User not found in database
- Password update fails (same as previous password or DB failure)
- Database operation failures (insert, update, query)
