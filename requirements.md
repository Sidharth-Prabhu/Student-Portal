# Requirements for AIDS Attendance System Port (React + Vite)

This document outlines the features and functional requirements for replicating the existing Flutter-based Android Attendance System as a React web application using Vite.

## 1. Tech Stack & Infrastructure
- **Frontend:** React with Vite (TypeScript preferred).
- **Backend:** Firebase
  - **Firebase Auth:** Email/Password authentication.
  - **Cloud Firestore:** NoSQL database for attendance records.
  - **Firebase Cloud Messaging (FCM):** For push notifications (attendance updates).
- **Hosting:** Firebase Hosting or similar.

## 2. Authentication
- **Login Screen:** Email and password input with a "Welcome Back" UI.
- **Session Management:** Persist login state.
- **Auth Wrapper:** Protect routes; only authenticated users can access the dashboard.
- **Post-Login:** Update a `last_login` timestamp in local storage.

## 3. Data Model (Students)
The student list is currently static/hardcoded. Each student object must contain:
- `regNum` (String, unique): Registration number (e.g., '2117240070251').
- `name` (String): Full name.
- `email` (String): Institutional email.
- `phone` (String): Contact number for calls/WhatsApp.

*Note: Refer to `lib/models/student.dart` for the full list of 60+ students.*

## 4. Features & Functionality

### 4.1. Dashboard (Home Screen)
- **Welcome Section:** Display the logged-in user's name (matched from the student list by email).
- **Quick Actions (Grid):**
  - **Mark Attendance**
  - **View Attendance**
  - **Today's Summary**
  - **Database Manager**
- **Update Check:** Fetch the latest release tag from GitHub API (`Sidharth-Prabhu/AIDS-Attendance-System`) and notify the user if a newer version is available.
- **Logout:** Sign out from Firebase and clear local session data.

### 4.2. Mark Attendance
- **Date Selection:** Default to the current date; allow picking past dates.
- **Loading State:** Fetch existing attendance from Firestore (Collection: `semester_4`).
- **Attendance States:**
  - **Present:** Default state.
  - **Absent:** Toggle switch or tap to mark.
  - **OD (Internal/External):** Secondary action (e.g., long-press, swipe, or dedicated button) to mark "On Duty".
- **UI Feedback:** Color-coded avatars (Green for Present, Red for Absent, Purple for OD).
- **Submit:**
  - Save to Firestore document (ID = `YYYY-MM-DD`).
  - Fields: `absents` (array of regNums), `internal_od` (array), `external_od` (array).
- **WhatsApp Sharing:** After submission, generate a pre-formatted message and open WhatsApp:
  ```text
  II AIDS-E
  [Date]
  Absentees: [Last 3 digits of regNums, comma separated or 'nil']
  Present Count: [Total - Absents - ODs]
  Internal OD: [Last 3 digits or 'nil']
  External OD: [Last 3 digits or 'nil']
  No. of Absentees: [Count]
  _Check your attendance percentage from https://bit.ly/3Tb4ZSJ_
  ```

### 4.3. View Attendance (Analytics)
- **Date Filtering:** Select a "From" and "To" date range to filter records.
- **Tabs:**
  - **Absent Sheet:** A table/grid showing 'P' (Present) or 'A' (Absent) for every student across all filtered dates.
  - **OD Sheet:** A table showing 'IOD' (Internal OD), 'EOD' (External OD), or '-' for each student/date.
  - **Summary:** A list of students showing their:
    - Total Days (in range).
    - Days Present.
    - Days Absent.
    - Attendance Percentage.
    - *Visual Cue:* Highlight in red if percentage < 75%.
- **Export (CSV):** Buttons to download CSV files for the Absent Sheet, OD Sheet, and Summary.
- **Student Drill-down:** Click a student in the Summary to see their specific "Absent Dates" and "OD Dates".

### 4.4. Database Manager
- **Collection Toggle:** Switch between `semester_4` and `absent_attendance` (legacy/Semester 3) collections.
- **Date List:** Show all recorded dates in descending order.
- **Record Management:**
  - **Add Date:** Create a new empty record for a specific date.
  - **Edit Record:** Manually add/remove registration numbers from the `absents`, `internal_od`, or `external_od` arrays within a date document.
  - **Delete Record:** Remove an entire date document.

### 4.5. Student Details Screen
- **Profile Info:** Display name, registration number, and current status (if navigated from a summary).
- **Contact Actions:**
  - **Call:** `tel:[phone]` link.
  - **WhatsApp:** `https://wa.me/[phone]` link.
- **Historical Overview:**
  - Total counts for Absents, Internal ODs, and External ODs.
  - Expandable sections listing every date the student was marked Absent or OD.

### 4.6. Notifications (FCM)
- Integrate Firebase Cloud Messaging.
- Subscribe the user to the `attendance_updates` topic.
- Show in-app notifications or browser push notifications when attendance is updated.

## 5. Firestore Schema
- **Collections:** `semester_4` and `absent_attendance`
- **Document ID:** `YYYY-MM-DD` (e.g., `2024-03-13`)
- **Document Fields:**
  - `absents`: `Array<String>` (Registration numbers)
  - `internal_od`: `Array<String>`
  - `external_od`: `Array<String>`

## 6. Constraints & Logic
- **RegNum Formatting:** For display in summaries/WhatsApp, often only the last 3 digits of the `regNum` are used.
- **Date Consistency:** Ensure the application consistently uses the same collection (prefer `semester_4` as the primary) or clearly handles both as intended in the Database Manager.
- **Responsive Design:** Ensure the web app is usable on both mobile browsers and desktops.
