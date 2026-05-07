# Specification: Server Health Monitoring (Cold Start Handling)

## Overview
Due to the use of Render's free tier for the backend, services enter a sleep state (hibernation) after a period of inactivity. This specification defines how the frontend handles this "Cold Start" to improve user experience.

## Components

### 1. Backend Endpoint (`/health`)
- **Location**: `ItemController.java`
- **Logic**: Performs a simple database count (`itemRepository.count()`) to verify both the service and database connection are operational.
- **Security**: Publicly accessible (permitted in `SecurityConfig.java`).

### 2. Frontend Health Hook (`useServerHealth`)
- **Location**: `src/hooks/useServerHealth.ts`
- **Functionality**:
    - Performs an initial check on mount.
    - If the server is down (status !== "UP" or timeout), it initiates a retry loop every 5 seconds.
    - Once the server responds, it stops the loop and updates the application state.

### 3. UI Implementation
- **Location**: `src/app/page.tsx` (Login Page)
- **Features**:
    - **Banner**: Displays an amber notification indicating the server is waking up.
    - **Button Blocking**: Disables the "Login" button and changes its text to "Waiting for server..." to prevent failed authentication attempts during boot.

## Infrastructure
- **CORS Configuration**: The backend must allow the frontend's origin (Vercel URL) via the `CORS_ALLOWED_ORIGINS` environment variable.
- **Environment Variables**: The frontend uses `NEXT_PUBLIC_API_URL` to point to the Render backend.

## Benefits
- Prevents confusing "Connection Failed" errors.
- Provides immediate feedback to the user about the system's state.
- Ensures the first login attempt is successful once the button is enabled.
