# 🎯 Microsite Event Platform — Product Requirements Document

## 1. Overview

The Microsite Event Platform is a hybrid (offline + online) engagement microsite for Astra Group's corporate event.
It enables participants to check in, interact with booth content, submit ideation ideas, and join a lucky draw.
Built with **React + Vite + Tanstack Router** frontend and **Supabase** (PostgreSQL + Realtime) backend.

---

## 2. Roles & Access

| Role                      | Description                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Participant (Offline)** | Attends physically, checks in via QR, visits booths, joins team ideation, and participates in the lucky draw.                                   |
| **Participant (Online)**  | Attends virtually, checks in manually (when event is active), accesses online booth materials, submits individual ideation, and joins the draw. |
| **Staff**                 | Has full access to all staff tools including draw, check-in, and helpdesk.                                                                      |
| **Admin**                 | Oversees all event data, booth progress, ideations, and exports results.                                                                        |

---

## 3. Authentication & Login Flow

### 3.1 Overview

All users (admin, staff, and participants) login through the same landing page `/`. Authentication is handled via **Supabase Auth** with a conditional flow based on email detection.

### 3.2 User Registration

All users (admin, staff, participants) are **manually registered** by the admin team before the event:
- Create auth account in **Supabase Auth**
- Insert user record into `users` table with appropriate role
- **Participant passwords**: Randomly generated (8 alphanumeric characters) during seeding and provided to participants via external communication (no storage in database beyond Supabase Auth)

### 3.3 Login Flow

#### 3.3.1 Initial State (Landing Page `/`)

User sees:
- Event branding and information
- **"Login"** CTA button

#### 3.3.2 Login Popup Flow

1. User clicks **"Login"** → popup/modal appears with email input only
2. User enters email and submits
3. **Frontend checks email against constants:**

   ```ts
   // constants.ts
   const ADMIN_EMAILS = ['admin1@astra.com', 'admin2@astra.com']
   const STAFF_EMAILS = ['staff1@astra.com', 'staff2@astra.com']
   ```

4. **Conditional Flow:**

   **Case A: Email is Admin**
   - System detects email in `ADMIN_EMAILS`
   - OTP code input field appears
   - User requests OTP via Supabase Auth (`signInWithOtp`)
   - User receives OTP code via email
   - User enters OTP code
   - Submit → Supabase Auth verify OTP with email + token
   - Redirect to `/admin`

   **Case B: Email is Staff**
   - System detects email in `STAFF_EMAILS`
   - Password input field appears
   - User enters password
   - Submit → Supabase Auth login with email + password
   - Redirect to `/staff/index` (staff landing page)

   **Case C: Email is Participant**
   - System detects email NOT in admin/staff lists
   - Password input field appears
   - User enters their randomly generated password (provided during registration)
   - Submit → Supabase Auth login with email + password
   - Redirect to `/participant`

#### 3.3.3 Error Handling

- **Invalid email (not found in Supabase):** Show error "Email tidak terdaftar"
- **Wrong password (admin/staff):** Show error "Password salah" (no attempt limit)
- **Supabase connection error:** Show error "Gagal terhubung ke server"

#### 3.3.4 Session Management

- Use Supabase session for auth state
- Store user data in React Context/Zustand
- Implement protected routes based on `role`
- **Realtime Auth Sync:** Subscribe to auth state changes for automatic session sync across browser tabs

---

## 4. Participant Experience Flow

### 4.1 Pre Check-in State (Shared)

When visiting `/participant` before check-in:

* All menus (Booth, Collaboration, Zoom, Progress, Voucher) are **hidden**.
* Only one main button is visible:

  * **Offline Participant:** “Show QR” → opens popup with downloadable QR (for staff scanning).

  * **Online Participant:** “Check-in” → manually triggers event check-in (enabled only if event is active).

After successful check-in (QR or manual), all menus become visible.

### 4.2 Post Check-in State (Landing Page)

After successful check-in, participant landing page (`/participant`) displays:

#### Section 1: Welcome & User Info
- **Welcome message** with participant name
- User role badge (Online/Offline)

#### Section 2: Progress Bar
- **Progress bar** showing booth completion percentage
  - **Offline participants:** x/10 booths completed (100% = 10 booths)
  - **Online participants:** x/6 booths completed (100% = 6 booths)
- **Realtime Updates:** Progress bar automatically updates in real-time as booths are completed (Supabase Realtime)
- Display progress text: "X dari Y booth selesai"

#### Section 3: Voucher Display (Conditional)

**Unlock Condition:**
- Offline participant: Completed 10 booths (`isEligibleToDraw === true`)
- Online participant: Completed 6 booths (`isEligibleToDraw === true`)

**When Locked:**
- Show locked voucher placeholder
- Message: "Selesaikan X booth lagi untuk mendapatkan voucher"

**When Unlocked:**
- Display voucher image (static asset)
- Show eligibility badge: "Anda telah memenuhi syarat untuk mengikuti undian!"
- Congratulations message

**Note:** This is a display section on landing page, no separate page needed.

#### Navigation Menu
- **Booth** → `/participant/booth/index`
- **Collaboration** → `/participant/collaboration/index`
- **Zoom** → Opens Zoom dialog/drawer (online participants only)

### 4.3 Zoom Dialog/Drawer

**Trigger:** Click "Zoom" menu button on participant landing page (`/participant`)

**Visibility:** Only shown for **online participants** (`participant_type = 'online'`)
- Offline participants do NOT see this menu option (they attend physically)

**UI Component:** Dialog/Drawer/Sheet (not a separate page/route)

**Purpose:** Provide quick access to event Zoom meeting for online participants attending virtually

**Data Source:**
- Zoom meeting URL fetched from `events.zoom_meeting_url` field
- Query event record when dialog opens

**Content:**
- Display Zoom logo (large, centered)
- Show meeting URL in readable format (from database)
- Copy button to copy URL to clipboard
- Primary CTA button: "Join Zoom Meeting" → opens Zoom via deeplink or web URL
  - Deeplink format: `zoommtg://zoom.us/join?confno=[MEETING_ID]`
  - Fallback to web URL: `https://zoom.us/j/[MEETING_ID]`
- If Zoom URL not found in database, show message: "Zoom meeting belum tersedia"
- Close button to dismiss dialog

**UI Example:**
```
┌─────────────────────────┐
│   [Zoom Logo Image]     │
│                         │
│  Join Expert Forum 2025 │
│                         │
│  Meeting URL:           │
│  https://zoom.us/j/...  │
│  [Copy URL Button]      │
│                         │
│  [Join Zoom Meeting]    │
│                         │
│  [Close]                │
└─────────────────────────┘
```

---

## 5. Staff Pages & Flows

### 5.1 Page: `/staff/index`

**Purpose:** Staff landing page after login, displays menu of available staff tools.

**Layout:**
- Welcome message with staff name
- Menu cards/buttons:
  - **Check-in Registrasi** → Navigate to `/staff/checkin`
  - **Lucky Draw** → Navigate to `/staff/draw`
  - **Helpdesk** → Navigate to `/staff/helpdesk`

**Example UI:**
```
┌─────────────────────────────────┐
│  Welcome, [Staff Name]          │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Check-in Registrasi   │   │
│  │   [QR Icon]             │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │      Lucky Draw         │   │
│  │   [Trophy Icon]         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │       Helpdesk          │   │
│  │   [Support Icon]        │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

### 5.2 Page: `/staff/checkin`

**Purpose:** Verify and log physical attendance for offline participants via QR scanning.

#### Initial State

- Display page title: "Check-in Registrasi Peserta"
- Display total checked-in count (optional)
- **Primary CTA Button:** "Scan QR Code" or "Mulai Scan"
- Button prominent and centered

#### Interaction Flow

1. Staff clicks **"Scan QR Code"** button
2. **QR Scanner Dialog/Drawer opens:**
   - Full-screen or large modal
   - Camera viewfinder active
   - Cancel/Close button available
3. Staff scans participant QR code
4. System validates QR code:
   - QR string = participant's `$id`
   - Searches `users` collection for that ID
   - Checks if already checked in

**Case A: Valid & Not Checked In**
1. System records check-in:
   ```ts
   {
     eventCheckinTime: ISODateTime,
     eventCheckinMethod: "qr",
     checkedInBy: staffId
   }
   ```
2. QR Scanner dialog **closes immediately**
3. **Success greeting UI appears** for 1 second:
   - Display participant name
   - Success message: "Check-in berhasil untuk [Name]"
   - Success icon/animation
4. After 1 second, **auto-return to initial state**:
   - Greeting UI disappears
   - CTA button "Scan QR Code" appears again
   - Ready for next scan

**Case B: Already Checked In**
1. QR Scanner dialog **remains open**
2. Error message appears in dialog: "Participant sudah check-in"
3. Allow staff to scan another QR or close dialog manually

**Case C: Invalid QR Code**
1. QR Scanner dialog **remains open**
2. Error message appears: "QR code tidak valid"
3. Allow staff to scan another QR or close dialog manually

#### UI Flow Example

**Initial State:**
```
┌─────────────────────────────────┐
│  Check-in Registrasi Peserta    │
│                                 │
│  Total Check-in: 45             │
│                                 │
│      ┌─────────────────┐       │
│      │  Scan QR Code   │       │
│      │  [QR Icon]      │       │
│      └─────────────────┘       │
│                                 │
└─────────────────────────────────┘
```

**After Successful Scan (1 second):**
```
┌─────────────────────────────────┐
│         ✓ Success!              │
│                                 │
│  Check-in berhasil untuk        │
│  John Doe                       │
│                                 │
│  [Success Animation]            │
│                                 │
└─────────────────────────────────┘
```

**Then auto-returns to initial state.**

---

## 6. Booth Flow (Education & Engagement)

### 6.1 Booth Overview

* Each booth contains:

  * **Booth name**
  * **Description**
  * **Poster image URL**
  * **5 multiple-choice questions** (stored as JSONB array, each with 4 options A-D)
* Purpose: Introduce Astra subsidiaries, educate about company products.
* **Question Format:** Multiple-choice questions with point-based scoring system

---

### 6.1.1 Question Structure & Point System

#### Question Format

Each booth contains **5 multiple-choice questions** stored as JSONB array with the following structure:

```json
{
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0  // Index (0-3) of the correct answer
}
```

**Key Rules:**
- Exactly **4 options** per question (A, B, C, D)
- Only **one correct answer** per question
- Questions are stored in JSONB format in database

#### Point System & Attempt Logic

**Point Distribution:**

| Attempt # | Points Awarded | Description |
|-----------|---------------|-------------|
| 1st | 100 points | Answered correctly on first try |
| 2nd | 80 points | Answered correctly on second try |
| 3rd | 60 points | Answered correctly on third try |
| 4th | 40 points | Answered correctly on fourth try |
| 5th | 20 points | Answered correctly on fifth try |
| 6+ | 10 points | Answered correctly after cycling (minimum base) |

**Question Flow Logic:**

1. **Initial Display:**
   - System randomly selects ONE question as starting point from 5 available
   - Creates question sequence: [random start, next, next, next, next]
   - Example: If random start = 2, sequence = [2, 3, 4, 0, 1]

2. **Answer Submission:**
   - Participant selects one of 4 options (A, B, C, D)
   - System validates answer against `correct_answer` index

3. **If Answer is WRONG:**
   - System **immediately** moves to next question in sequence
   - Attempt counter increments
   - No feedback message shown (seamless transition)
   - Selected option resets for next question

4. **If Answer is CORRECT:**
   - Check-in recorded with:
     - `points`: Calculated based on attempt count (100, 80, 60, 40, 20, or 10)
     - `attempts`: Total number of attempts before correct answer
   - Success notification: "Check-in berhasil! Anda mendapat X poin"
   - Dialogs close and booth marked as completed

5. **After 5 Wrong Answers (Cycling):**
   - System loops back to **first question** in sequence
   - Order remains the same (no reshuffle)
   - Points locked at **10 (minimum base)** for any subsequent correct answer
   - Participant must answer correctly to complete check-in (no escape until correct)

#### UI Display Elements

**Attempt Counter:**
- Shows current attempt number
- Format: "Percobaan X dari 5" (for attempts 1-5)
- After 5 attempts: "Percobaan 6", "Percobaan 7", etc.

**Points Display:**
- Real-time calculation shown to participant
- Format: "Poin: 100" (updates as attempts increase)
- Motivates participants to answer correctly quickly

**Question Options:**
- Radio button group with 4 options
- Labels: A, B, C, D
- Submit button disabled until option selected

#### Database Storage

**booth_checkins table:**
```sql
- id (UUID)
- participant_id (UUID FK)
- booth_id (UUID FK)
- points (INTEGER) -- Points earned (10-100)
- attempts (INTEGER) -- Total attempts before correct answer
- checkin_time (TIMESTAMP)
```

**Key Changes from Previous System:**
- ❌ Removed: `answer` (TEXT) column
- ✅ Added: `points` (INTEGER) column
- ✅ Added: `attempts` (INTEGER) column

#### Business Rules

1. **No Re-attempts:** Once checked in to a booth, participant cannot retry (enforced by unique constraint on `participant_id, booth_id`)

2. **Eligibility Calculation:** Still based on booth count, not points:
   - Offline: Complete 10 booths → `is_eligible_to_draw = true`
   - Online: Complete 6 booths → `is_eligible_to_draw = true`

3. **No Leaderboard:** Points are for individual achievement tracking only, no competitive ranking system

4. **Historical Data:** Existing booth_checkins with `answer` text will be cleared (system not in production yet)

---

### 6.2 Page: `/participant/booth/index`

This page displays different UI based on participant type (offline vs online).

---

#### 6.2.1 Offline Participant UI

**Initial State (No Booths Checked In):**
- Empty state message: "Scan booth QR code untuk mulai"
- **Floating Action Button (FAB)** at bottom of page: "Scan QR" icon
- FAB always visible and sticky at bottom

**Interaction Flow:**
1. Participant clicks FAB "Scan QR"
2. Opens QR Scanner dialog/drawer
3. Scans booth QR code
4. System validates booth and checks if already visited
5. If valid and not visited:
   - QR scanner dialog closes
   - **Booth Detail Dialog opens** showing:
     - Booth name
     - Booth description
     - Booth poster image
     - **CTA button: "Check-in"**
6. Participant clicks **"Check-in"** button
7. **Nested dialog opens** (booth check-in form) showing:
   - Multiple-choice question (one of 5, randomly selected)
   - 4 radio button options (A, B, C, D)
   - Attempt counter ("Percobaan 1 dari 5")
   - Current points display ("Poin: 100")
   - Submit button
8. Participant selects an option and clicks Submit
9. **If answer is wrong:**
   - Dialog stays open
   - Next question appears immediately
   - Attempt counter increments
   - Points decrease
   - Selected option resets
10. **If answer is correct:**
    - System records booth check-in with points and attempts
    - Success toast shows points earned
    - Both dialogs close
    - Booth card appears in the list

**After Booth Check-ins:**
- Display **card list** of checked-in booths (newest first)
- Each card shows:
  - Booth name
  - Check-in timestamp
  - Status badge: "Completed"
- Click on card → Opens **Booth Detail Dialog** showing:
  - Booth name
  - Booth description
  - Poster image (if available)
  - Points earned (large display)
  - Attempts taken
  - Check-in timestamp
  - No check-in button (already completed)

**FAB remains visible** at all times for scanning more booths.

**Example UI:**
```
┌─────────────────────────────────┐
│  Booth Progress: 3/10           │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ Astra Otoparts         │   │
│  │ Checked in: 10:30 AM   │   │
│  │ [Completed Badge]      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Astra Agro Lestari     │   │
│  │ Checked in: 11:00 AM   │   │
│  │ [Completed Badge]      │   │
│  └─────────────────────────┘   │
│                                 │
│                                 │
│              [Scan QR FAB]      │
└─────────────────────────────────┘
```

---

#### 6.2.2 Online Participant UI

**Display:**
- Grid/List of **all available booths**
- Each booth card shows:
  - Booth poster image
  - Booth name
  - Short description (truncated)
  - Check-in status badge:
    - **"Completed"** (green) if already checked in
    - **"Not Visited"** (gray) if not yet checked in

**Card States:**
- **Completed booths:** Show checkmark icon, green border/badge
- **Not visited booths:** Show default state

**Interaction Flow (Not Visited Booth):**
1. Participant clicks on booth card
2. Opens **Booth Detail Dialog** showing:
   - Booth poster image (full)
   - Booth name
   - Full description
   - **CTA button: "Check-in"**
3. Participant clicks **"Check-in"** button
4. **Nested dialog opens** (booth check-in form) showing:
   - Multiple-choice question (one of 5, randomly selected)
   - 4 radio button options (A, B, C, D)
   - Attempt counter ("Percobaan 1 dari 5")
   - Current points display ("Poin: 100")
   - Submit button
5. Participant selects an option and clicks Submit
6. **If answer is wrong:**
   - Dialog stays open
   - Next question appears immediately
   - Attempt counter increments, points decrease
7. **If answer is correct:**
   - System records booth check-in with points and attempts
   - Success notification shows points earned
   - Both dialogs close
   - Booth card updates to "Completed" state
   - Progress bar updates

**Interaction Flow (Completed Booth):**
1. Participant clicks on completed booth card
2. Opens **Booth Detail Dialog** (read-only):
   - Booth poster image
   - Booth name
   - Full description
   - Points earned (large display)
   - Attempts taken
   - Check-in timestamp
   - "Completed" badge
   - No check-in button (already completed)
3. No edit or re-submit allowed

**Example UI:**
```
┌─────────────────────────────────┐
│  Booth Progress: 2/6            │
├─────────────────────────────────┤
│  ┌───────┐  ┌───────┐          │
│  │[Poster│  │[Poster│          │
│  │       │  │       │          │
│  │✓      │  │       │          │
│  └───────┘  └───────┘          │
│  Astra Oto  Astra Agro         │
│  Completed  Not Visited        │
│                                 │
│  ┌───────┐  ┌───────┐          │
│  │[Poster│  │[Poster│          │
│  │       │  │       │          │
│  │       │  │       │          │
│  └───────┘  └───────┘          │
│  Astra Fin  United Trac        │
│  Not Visit  Not Visited        │
└─────────────────────────────────┘
```

**Validation (Both Offline & Online):**
- Each booth can be answered only once and cannot be edited (enforced by database unique constraint)
- **Realtime Progress:** Progress updates automatically in real-time after each booth check-in (Supabase Realtime)
- Voucher unlocks when threshold is met (auto-calculated by database trigger)

---

## 7. Ideation (Collaboration) Flow

### 7.1 Overview

The ideation feature enables participants to propose improvement or innovation ideas.

| Mode                    | Type    | Description                                                                 |
| ----------------------- | ------- | --------------------------------------------------------------------------- |
| **Group Ideation**      | Offline | Requires exactly 2 participants from different companies.                   |
| **Individual Ideation** | Online  | Solo submission (no group). Can submit multiple times with different cases. |

**Key Features:**
- Each participant (both online and offline) can submit **multiple ideations**
- Offline participants must form groups of exactly **2 members** from **different companies**
- Offline participants can create multiple groups and submit multiple ideations with the rule: group partner must not have submitted the same company case before
- Online participants can submit multiple ideations but each must target a **different company case**

---

### 7.2 Group Ideation (Offline)

#### Flow

1. Offline participant opens **Collaboration** menu.

2. Participant can create multiple groups. CTA "Create Group" or "Create New Group".

   * Fills group name only (e.g., "Tim Inovasi Astra").
   * Becomes **creatorId** (group leader).
   * Group is created for member organization only.

3. All groups (active and past) are displayed as cards.

4. Leader can **invite participants** using a search field:

   * Only offline participants who have **checked in** appear in the list.
   * System does NOT filter by existing group membership or previous submissions (for performance).
   * Invited participant joins the group via `group_members` database junction table.
   * **Cannot invite to a group that has already submitted** (`is_submitted = true`).

5. Participants can **leave** a group with restrictions:

   * **Creator CANNOT leave their own group** (enforced at both RLS and API layer for security)
   * **Non-creator members can leave only if group has NOT submitted** (`is_submitted = false`)
   * System validates and shows appropriate error message if leave attempt is invalid

6. Once group size = **2 members exactly**, the **Submit Ideation** button becomes enabled.

7. Leader clicks **Submit Ideation**, which opens ideation form with fields:
   * Title
   * Description
   * Company case (dropdown/select)

8. Leader submits the form, system then validates:
   * **Group has exactly 2 members** (real-time check).
   * **Group has not submitted before** (`is_submitted = false`).
   * **Both members are from different companies** (compare `users.company` field).
   * **Neither member has submitted an ideation for the same company case before:**
     - System queries `group_members` table to find ALL groups where current participants were/are members
     - System checks ALL ideations from those groups for matching `company_case`
     - System checks ALL individual ideations by current participants for matching `company_case`
     - Validation ensures NO participant has EVER submitted the selected company case (either as individual or as group member)
     - If any conflict found, shows error with participant name(s) who already submitted this case
   * Creates ideation record in `ideations` table linked to `group_id`.
   * Sets `is_group = true` on the ideation.
   * **Updates group:** Sets `is_submitted = true` and `submitted_at = now()`.

9. **Group is locked** after submission. The group cannot be used for additional submissions. To submit another ideation, participants must create a new group (can be with the same members).

---

### 7.3 Individual Ideation (Online)

1. Online participant opens **Collaboration** menu.

2. Participant can submit multiple ideations. CTA "Create Submission" or "Submit New Ideation".

3. All submissions (past and present) are displayed as cards.

4. Sees direct submission form (no group flow).

5. Fills Astra company sub options, title, and ideation content description.

6. Clicks **Submit**, system validates:
   * **Company case must be different** from participant's previous submissions.
   * Creates ideation record with `is_group = false`.

7. Confirmation appears. Participant can submit additional ideations for different company cases.

---

## 8. Lucky Draw (Staff Only)

* Page: `/staff/draw`
* Managed by staff role.
* Flow:

  1. Staff loads eligible participants.

  2. Clicks **Generate Draw** → random selection (client-side).

  3. Winners displayed instantly on the same screen.

  4. Draw cached in `localStorage`.

  5. When finalized, staff submits:

     ```ts
     {
       winners: [participantId, ...],
       createdAt: ISODateTime
     }
     ```

  6. Each participant can win only once.

---

## 9. Admin Dashboard

### 9.1 Overview

**Path:** `/admin`

Admin dashboard is a **single-page interface** with the following layout structure:

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│         Statistics Cards (Top)          │
│  [Total] [Checked In] [Eligible] [Sub]  │
├─────────────────────────────────────────┤
│                                         │
│  Participant Management Section         │
│  ┌───────────────────────────────────┐  │
│  │ [Add] [Export CSV] [Submissions]  │  │
│  │ [Filters: Type | Status | etc]    │  │
│  ├───────────────────────────────────┤  │
│  │     Participant Data Table        │  │
│  │     with Pagination               │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Key UI Elements:**
- **Top Section:** Stats cards (always visible)
- **Middle Section:** Participant management with table, filters, and action buttons
- **Drawer/Sheet:** Only used for:
  - Submission Management (triggered by "Submissions" button)
  - Participant Detail View (triggered by clicking table row)

---

### 9.2 Features

#### 9.2.1 Statistics Dashboard (Top Section)

**UI Component:** Stats cards section (always visible, no drawer)

**Metrics Displayed:**

1. **Total Participants**
   - Count: `users` where `role = "participant"`
   - Badge breakdown:
     - Offline: count where `participantType = "offline"`
     - Online: count where `participantType = "online"`

2. **Checked-in Participants**
   - Count: `users` where `isCheckedIn = true`
   - Badge breakdown:
     - Offline checked in
     - Online checked in

3. **Eligible for Draw**
   - Count: `users` where `isEligibleToDraw = true`
   - Single number (no breakdown)

4. **Submissions Count**
   - Count: `ideations` where `isSubmitted = true`
   - Badge breakdown:
     - Group submissions
     - Individual submissions

**Auto-refresh:**
- **Real-time updates** via Supabase Realtime subscriptions
- Stats automatically update when data changes
- **Manual refresh button** also available for forced refresh

**Example UI:**
```
┌──────────────────────┐  ┌──────────────────────┐
│ Total Participants   │  │ Checked In           │
│      150             │  │      120             │
│ Offline: 100         │  │ Offline: 90          │
│ Online: 50           │  │ Online: 30           │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ Eligible for Draw    │  │ Submissions          │
│      85              │  │      45              │
│                      │  │ Group: 20            │
│                      │  │ Individual: 25       │
└──────────────────────┘  └──────────────────────┘
```

---

#### 9.2.2 Participant Management (Main Section)

**UI Component:** Data table with filters and action buttons (no drawer for table itself)

**Action Buttons (Top of Table):**
- **"Add Participant"** → Opens form drawer to create new participant
- **"Export CSV"** → Exports all participant data to CSV
- **"View Submissions"** → Opens drawer with submission list

**Capabilities:**
- **Read:** View all participants with pagination (default: 10 per page)
- **Create:** Add new participant via "Add Participant" button
  - Opens form drawer
  - Creates Supabase Auth account
  - Inserts record into `users` table
- **Update:** Edit participant details
  - Click on row → opens detail drawer with inline edit
- **Delete:** Soft delete participant (with validation)
  - Delete icon/button in table row

**Editable Fields:**
- `name` (string)
- `email` (string, must be unique)
- `participantType` ("online" | "offline")
- `company` (string, optional)
- `division` (string, optional)

**Non-Editable Fields:**
- `role` (locked to "participant")
- `isEligibleToDraw` (auto-calculated based on booth completion)
- `isCheckedIn` (system-managed)

**Filters (Above Table):**
- **Participant Type:** Dropdown (All / Online / Offline)
- **Check-in Status:** Dropdown (All / Checked In / Not Checked In)
- **Eligibility:** Dropdown (All / Eligible / Not Eligible)
- **Company:** Multi-select dropdown (dynamic options from database)
- **Search:** Text input (search by name or email)

**Pagination:**
- Page size: 10, 25, 50, 100
- Total count displayed
- Next/Previous navigation

**Delete Validation:**
- Check if `isCheckedIn === true`
- If checked in → block delete with error message: "Participant sudah check-in, tidak dapat dihapus"
- If not checked in → proceed with soft delete (set `deletedAt` timestamp or archive)

---

#### 9.2.3 Participant Detail View

**Trigger:** Click on participant row in table

**UI Component:** Full-width drawer/sheet

**Sections:**

**A. Basic Information (Inline Editable)**
- Name (editable)
- Email (editable)
- Company (editable)
- Division (editable)
- Participant Type (editable)
- Check-in Status (read-only badge)
- Eligibility Status (read-only badge)

**B. Activity Timeline**

Display chronological list of participant activities:

1. **Event Check-in**
   - Timestamp: `eventCheckinTime`
   - Method: QR / Manual
   - Checked in by: Staff name (from `users` collection)

2. **Booth Check-ins**
   - List all booth visits from `booth_checkins`
   - For each: Booth name, timestamp, answer text
   - Ordered by `checkinTime` (newest first)

3. **Ideation Activity**
   - If participant created/joined group: Show group details
   - If individual ideation submitted: Show submission details
   - Timestamp: `submittedAt`

**Timeline Format:**
```
[Icon] Event Check-in via QR
       10:30 AM, 15 Jan 2025
       Checked in by: Staff Name

[Icon] Booth: Astra Otoparts
       11:00 AM, 15 Jan 2025
       Answer: "Product innovation in automotive parts..."

[Icon] Ideation Submitted (Group)
       02:30 PM, 15 Jan 2025
       Group: "Future Mobility Solutions"
```

#### 9.2.4 Export Participants

**Trigger:** "Export CSV" button in participant management section

**Process:**
1. Admin clicks "Export CSV" button
2. Frontend fetches **all participants** (unpaginated query) using `getAllUsersForExport()` method
3. Client-side CSV generation using CSV utils from `@repo/react-components/lib`
4. Auto-download CSV file: `participants_[timestamp].csv`

**CSV Columns:**
- ID
- Name
- Email
- Role
- Participant Type
- Company
- Division
- Is Checked In
- Is Eligible To Draw
- Event Checkin Time
- Event Checkin Method
- Created At

**No filters applied** — exports all participant data.

---

#### 9.2.5 Submission Management

**Trigger:** "View Submissions" button in participant management section

**UI Component:** Drawer/Sheet with list view

**Display:**
- List all ideations from `ideations` collection
- Show: Title, Company Case, Creator Name, Group/Individual, Submitted At
- **Pagination:** Page size options (10, 25, 50, 100) with total count
- **Next/Previous navigation**

**Filters (Above Table):**
- **Type:** Dropdown (All / Group / Individual)
- **Company Case:** Multi-select dropdown (dynamic options)
- **Search:** Text input (search by title or creator name)

**Export:**
- **"Export CSV" button** to download all submissions
- CSV includes: ID, Title, Description, Company Case, Type (Group/Individual), Creator Name, Creator Email, Group Members (if group), Submitted At

**Click on submission item → Expands detail within drawer:**

**Individual Ideation:**
- Title
- Description (full text)
- Company Case
- Creator Name
- Submitted At

**Group Ideation:**
- Title
- Description (full text)
- Company Case
- Creator Name
- **Group Members List:**
  - Display all participants where `users.group_id = groups.id`
  - Show name, email, company for each member
  - Fetch via join query
- Submitted At

**Actions:**
- **No edit/delete** — submissions are read-only for admin

---

## 10. Helpdesk Dashboard

### 10.1 Overview

**Path:** `/staff/helpdesk`

**Purpose:** Allow staff to manage participant data on-site (e.g., fix registration errors, add walk-in participants).

### 10.2 Features

Helpdesk has **exact same CRUD functionality** as Admin Participant Management, including:
- Create, Read, Update, Delete participants
- Same editable fields: name, email, participantType, company, division
- Same delete validation: cannot delete if `isCheckedIn = true`
- Same filters: participantType, isCheckedIn, isEligibleToDraw, company, search

**Differences from Admin:**
- **No access** to Submission Management
- **No access** to Stats Dashboard
- **No access** to Export Data

**UI:** Same data table interface with drawer/sheet for CRUD operations.

---

## 11. Database Schema (PostgreSQL)

### Enums

```sql
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'participant');
CREATE TYPE participant_type AS ENUM ('online', 'offline');
CREATE TYPE checkin_method AS ENUM ('qr', 'manual');
```

---

### Tables

#### `events`

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  zoom_meeting_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'participant',
  participant_type participant_type,
  company TEXT,
  division TEXT,
  is_checked_in BOOLEAN DEFAULT false,
  event_checkin_time TIMESTAMP,
  event_checkin_method checkin_method,
  checked_in_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `groups`

```sql
-- Groups Table: For member organization only
-- Ideation content is stored in ideations table
-- Groups are NOT reusable - one group can only submit one ideation
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Note: is_submitted and submitted_at added back - groups are NOT reusable
```

#### `group_members`

```sql
-- Group Members Junction Table: Many-to-many relationship
-- Allows participants to be in multiple groups (not simultaneously, but over time)
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT now(),

  UNIQUE(group_id, participant_id)
);
```

#### `booths`

```sql
CREATE TABLE booths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  questions JSONB NOT NULL, -- Array of question strings, e.g., ["Question 1", "Question 2"]
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Constraint: questions must be a non-empty array
  CONSTRAINT questions_not_empty CHECK (jsonb_array_length(questions) > 0)
);

-- Note: question_text renamed to questions and changed to JSONB array
```

#### `booth_checkins`

```sql
CREATE TABLE booth_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booth_id UUID REFERENCES booths(id) ON DELETE CASCADE,
  answer TEXT,
  checkin_time TIMESTAMP DEFAULT now(),
  UNIQUE(participant_id, booth_id) -- Each booth can only be visited once
);
```

#### `ideations`

```sql
-- Ideations Table: Single source of truth for ideation content
-- Links to groups table via group_id for group ideations
-- group_id is NULL for individual ideations
-- Participants can submit multiple ideations (removed unique constraint on creator_id)
CREATE TABLE ideations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_case TEXT NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  is_group BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Constraint: group ideations must have group_id
  CONSTRAINT group_ideation_consistency CHECK (
    (is_group = false AND group_id IS NULL) OR
    (is_group = true AND group_id IS NOT NULL)
  ),

  -- Constraint: online participants cannot submit same company case twice
  CONSTRAINT unique_online_company_case UNIQUE NULLS NOT DISTINCT (creator_id, company_case, is_group)
    WHERE (is_group = false)
);

-- Note: Removed unique constraint on creator_id to allow multiple submissions
-- Added partial unique constraint on (creator_id, company_case) for online participants
```

#### `draw`

```sql
CREATE TABLE draw_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);
```

#### `draw_winners`

```sql
CREATE TABLE draw_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_log_id UUID REFERENCES draw_logs(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);
```
---
## 12. Validation Rules & Business Logic

### 12.1 User Management

**Create User:**
- `email` must be unique across all users
- `email` format validation (RFC 5322)
- `participantType` required if `role = "participant"`
- Auto-generate password

**Update User:**
- Cannot change `role`
- Cannot change `isEligibleToDraw` (system-calculated)
- Cannot change `isCheckedIn` (system-managed)
- `email` must remain unique if changed

**Delete User:**
- Hard validation: `isCheckedIn === false`
- If validation fails, return 400 error with message
- Consider soft delete (add `deletedAt` field) instead of hard delete

---

### 12.2 Check-in

**Event Check-in:**
- Can only check in once per participant
- Online participants: require `events.is_active = true`
- Offline participants: no event active check (QR scan works anytime)
- Update: `is_checked_in = true`, `event_checkin_time = now()`, `event_checkin_method`

**Booth Check-in:**
- Participant must be checked in to event first (`is_checked_in = true`)
- Each booth can be visited only once per participant (enforced by unique constraint)
- `answer` is required for booth check-in
- After booth check-in, `is_eligible_to_draw` is auto-calculated by database trigger:
  - Offline: 10 booths completed
  - Online: 6 booths completed

---

### 12.3 Ideation & Groups

**Group Creation:**
- Only `participant_type = 'offline'` can create groups
- Participants can create multiple groups
- Creator automatically becomes the first member via `group_members` table
- Groups store only organizational data: `name`, `creator_id`
- Ideation content (title, description, company_case) is NOT stored in groups table
- **Groups are NOT reusable** - one group can only submit one ideation
- After submission, the group is marked as `is_submitted = true` and locked
- To submit another ideation, participants must create a new group (can be with the same members)

**Invite to Group:**
- Target participant must be `participant_type = 'offline'`
- Target participant must have `is_checked_in = true`
- No restriction on existing group membership (participants can be in multiple groups over time)
- Creates entry in `group_members` table: `(group_id, participant_id, joined_at)`

**Leave Group:**
- Non-creator participants can leave groups only if group has NOT submitted
- Creator CANNOT leave their own group (enforced at both RLS and API layer)
- Deletes entry from `group_members` table
- Cannot leave if group has already submitted (`is_submitted = true`)

**Create Group Ideation:**
- **Hard validation:** Group must have exactly 2 members (validated in API layer)
- **Group submission validation:** Group must not have submitted before (`is_submitted = false`)
- **Company validation:** Both members must be from different companies (compare `users.company` field)
- **Company case validation (Critical):** Neither group member can have submitted an ideation with the same `company_case` before
  - System checks ALL groups where participants were/are members (via `group_members` junction table)
  - System checks ALL individual ideations by participants
  - Validation applies to ALL participants in the group, not just the creator
  - Example scenarios:
    - ✅ User A + User B → Submit Case X (first time for both)
    - ❌ User A + User C → Submit Case X (blocked: User A already submitted Case X)
    - ❌ User B + User D → Submit Case X (blocked: User B was in group that submitted Case X)
    - ✅ User C + User D → Submit Case X (allowed: neither has submitted Case X before)
- Leader fills ideation form: title, description, company_case
- System creates ideation record in `ideations` table linked to group via `group_id`
- Sets `is_group = true` on the ideation record
- **Updates group:** Sets `is_submitted = true` and `submitted_at = now()`
- **Group is locked** after submission - no more submissions allowed
- To submit another ideation, participants must create a new group (can be with the same members)

**Individual Ideation:**
- Only `participant_type = 'online'` can submit individual ideation
- Each online participant can submit multiple ideations
- **Company case validation:** Participant cannot submit two ideations with the same `company_case`
- Creates ideation record with `is_group = false` and `group_id = NULL`
- Database enforces uniqueness via partial unique constraint on `(creator_id, company_case)` for individual ideations
- Ideation content stored directly in `ideations` table

---

### 12.4 Lucky Draw

**Eligible Participants:**
- `is_eligible_to_draw = true`
- Have not won in previous draws (check `draw_winners` table)

**Submit Draw:**
- Validate all `winners` are eligible
- Create `draw_logs` record
- Insert winners into `draw_winners` table with references to draw_log_id and participant_id

---

### 12.5 Event Activation

**Event Active Status:**
- Controlled via Supabase Dashboard (direct database update)
- Online participant check-in disabled when `events.is_active = false`
- No UI control needed in admin panel

---

## 13. Routing Structure

```
/                   # landing (login popup)

/participant
  ├── index         # landing page (with progress & voucher sections)
  │               # zoom dialog opened from this page (offline only)
  ├── booth/
  │   └── index     # booth list (offline: FAB scanner, online: grid cards)
  └── collaboration/
      └── index     # group/individual ideation management

/staff
  ├── index         # staff landing menu (checkin, draw, helpdesk)
  ├── checkin       # QR scanner with dialog for event check-in
  ├── draw          # lucky draw page
  └── helpdesk      # participant CRUD management

/admin              # single page (stats + table + drawers)
```

---

## 14. Access Control & Route Guards

| Role        | Path           | Description                             |
| ----------- | -------------- | --------------------------------------- |
| Participant | /participant/* | Full participant portal (post check-in) |
| Staff       | /staff/*       | Tools for check-in, draw, helpdesk      |
| Admin       | /admin/*       | Global data and management              |

---

## 15. Frontend Technical Requirements

### 15.1 Tech Stack

**Framework & Build:**
- **Framework:** React 19+ with Vite
- **Routing:** Tanstack Router (file-based routing)
- **State Management:** Zustand & React Context + useReducer
- **Data Fetching:** Tanstack Query (React Query)
- **Backend:** Supabase Client (direct from frontend)
- **Database:** PostgreSQL via Supabase
- **Realtime:** Supabase Realtime (WebSocket-based subscriptions)

**UI & Components (Monorepo):**
- **UI Library:** Shadcn UI via `@repo/react-components`
  - Import components: `import { Button } from '@repo/react-components/ui'`
  - All Shadcn components are pre-configured in the shared package
- **QR Code Components:**
  - QR Scanner: Available in `@repo/react-components`
  - QR Generator: Available in `@repo/react-components`
- **Utilities:**
  - CSV Export: Utils available in `@repo/react-components/lib`
  - Date/Time formatting utilities in `@repo/react-components/lib`

**Forms & Validation:**
- **Forms:** React Hook Form
- **Validation:** Zod

**Note:** This is a monorepo project. UI components, utilities, and shared logic are centralized in `@repo/react-components` package.

### 15.2 Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 15.3 Constants File Structure
```ts
// src/lib/constants.ts

export const ADMIN_EMAILS = [
  'admin1@astra.com',
  'admin2@astra.com',
] as const

export const STAFF_EMAILS = [
  'staff1@astra.com',
  'staff2@astra.com',
] as const

export const BOOTH_THRESHOLD = {
  offline: 10,
  online: 6,
} as const

export const PAGINATION_SIZES = [10, 25, 50, 100] as const

export const COMPANY_OPTIONS = [
  'Astra Otoparts',
  'Astra Agro Lestari',
  'Astra Financial',
  // ... other companies
] as const
```

### 15.4 Protected Route Implementation
```tsx
// Pseudo-code
<Route path="/participant" component={ParticipantLayout}>
  <RouteGuard allowedRoles={['participant']} />
  <RequireCheckin /> {/* Check isCheckedIn */}
  {/* ... nested routes */}
</Route>

<Route path="/staff" component={StaffLayout}>
  <RouteGuard allowedRoles={['staff']} />
  {/* ... nested routes */}
</Route>

<Route path="/admin" component={AdminLayout}>
  <RouteGuard allowedRoles={['admin']} />
  {/* ... nested routes */}
</Route>
```

### 15.5 Key Features to Implement

**Real-time Updates (Supabase Realtime):**
- **Auth State Sync:** Automatic session sync across browser tabs using `api.auth.subscribeToAuthChanges()`
- **Progress Tracking:** Live progress bar updates as participants complete booths using `api.checkins.subscribeToProgress()`
- **Booth Management:** Real-time booth data updates for admin panel using `api.booths.subscribeToBooths()`
- **User Status:** Live user status state updates using `api.users.subscribeToUserChanges()`
- **Admin Stats Dashboard:** Real-time statistics updates as data changes using subscriptions to `users`, `booth_checkins`, and `ideations` tables

**Responsive Design:**
- Mobile-first approach (most participants will use mobile)
- Desktop-optimized for admin/staff dashboards

**Accessibility:**
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility

**Monorepo Integration:**
- Import all UI components from `@repo/react-components/ui`
- Use shared utilities from `@repo/react-components/lib`
- Leverage pre-built QR components for scanner and generator
- Use CSV export utilities for data export functionality

---

## 16. Backend Technical Notes

### 16.1 Supabase Configuration

**Database Setup:**
1. Run `supabase/schema.sql` to create:
   - Enums (user_role, participant_type, checkin_method)
   - Tables (events, users, booths, booth_checkins, groups, ideations, draw_logs, draw_winners)
   - Foreign keys with proper CASCADE/RESTRICT policies
   - Triggers for auto-updating timestamps and eligibility
   - Views for pre-calculated statistics

2. Run `supabase/rls-policies.sql` to set up Row Level Security:
   - Admin: Full access to all tables
   - Staff: Limited to check-ins, draws, helpdesk
   - Participants: Only their own data

**Indexes:**
- Primary keys (UUID) on all tables
- Unique constraints:
  - `users.email`
  - `booth_checkins(participant_id, booth_id)`
- Foreign key indexes automatically created by PostgreSQL

**Realtime Setup:**
- Enable Realtime on required tables in Supabase Dashboard:
  - `users` (for auth state sync)
  - `booth_checkins` (for progress tracking)
  - `booths` (for booth management)

---