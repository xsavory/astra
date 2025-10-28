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

   **Case A: Email is Admin or Staff**
   - System detects email in `ADMIN_EMAILS` or `STAFF_EMAILS`
   - Password input field appears
   - User enters password
   - Submit → Supabase Auth login with email + password
   - Redirect based on role:
     - Admin → `/admin`
     - Staff → `/staff/index` (staff landing page)

   **Case B: Email is Participant**
   - System detects email NOT in admin/staff lists
   - **No password input shown**
   - Automatically use hardcoded password from `.env`:
     ```
     VITE_PARTICIPANT_DEFAULT_PASSWORD=your_hardcoded_password
     ```
   - Submit → Supabase Auth login with email + env password
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
- **Zoom** → `/participant/zoom/index`

### 4.3 Zoom Page

**Path:** `/participant/zoom/index`

**Purpose:** Provide access to event Zoom meeting

**Data Source:**
- Zoom meeting URL fetched from `events.zoomMeetingUrl` field
- Query event record on page load

**Content:**
- Display Zoom logo (large, centered)
- Show meeting URL in readable format (from database)
- Copy button to copy URL to clipboard
- Primary CTA button: "Join Zoom Meeting" → opens Zoom via deeplink or web URL
  - Deeplink format: `zoommtg://zoom.us/join?confno=[MEETING_ID]`
  - Fallback to web URL: `https://zoom.us/j/[MEETING_ID]`
- If Zoom URL not found in database, show message: "Zoom meeting belum tersedia"

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
  * **Question text**
* Purpose: Introduce Astra subsidiaries, educate about company products and nutrition awareness.

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
5. If valid and not visited → Opens booth question dialog:
   - Display booth name
   - Display question text
   - Text input for answer
   - Submit button
6. Participant types answer and submits
7. System records booth check-in:
   ```ts
   {
     boothId,
     participantId,
     checkinTime,
     answer
   }
   ```
8. Success toast/notification appears
9. QR scanner dialog closes
10. Booth card appears in the list

**After Booth Check-ins:**
- Display **card list** of checked-in booths (newest first)
- Each card shows:
  - Booth name
  - Check-in timestamp
  - Status badge: "Completed"
- Click on card → Opens booth detail drawer:
  - Booth name
  - Booth description
  - Poster image (if available)
  - Question text
  - Answer that was submitted (read-only)
  - Check-in timestamp

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
2. Opens booth detail drawer/dialog:
   - Booth poster image (full)
   - Booth name
   - Full description
   - Question text
   - Text input for answer
   - Submit button
3. Participant types answer and submits
4. System records booth check-in
5. Success notification
6. Drawer closes
7. Booth card updates to "Completed" state
8. Progress bar updates

**Interaction Flow (Completed Booth):**
1. Participant clicks on completed booth card
2. Opens booth detail drawer (read-only):
   - Booth poster image
   - Booth name
   - Full description
   - Question text
   - Answer that was submitted (read-only, no edit)
   - Check-in timestamp
   - "Completed" badge
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

| Mode                    | Type    | Description                          |
| ----------------------- | ------- | ------------------------------------ |
| **Group Ideation**      | Offline | Requires a group of ≥5 participants. |
| **Individual Ideation** | Online  | Solo submission (no group).          |

---

### 7.2 Group Ideation (Offline)

#### Flow

1. Offline participant opens **Collaboration** menu.

2. If no group yet → CTA "Create Group".

   * Fills group name only (e.g., "Tim Inovasi Astra").
   * Becomes **creatorId** (group leader).
   * Group is created for member organization only.

3. If group exists, there is a card that represents the group.

4. Leader can **invite participants** using a search field:

   * Only offline participants **without an existing group** appear.
   * Invited participants have their `group_id` set to this group.

5. Participants can **leave** a group (before submission).

6. Once group size ≥5, the **Submit Group** button becomes enabled.

7. Leader clicks **Submit Group**, which:
   * Validates group member count in real-time (to ensure no member has left).
   * Sets `is_submitted = true`, `submitted_at = ISODateTime` on the group.
   * Locks the group (no more invites/leaves).

8. After group is submitted, leader can create the **Group Ideation**:
   * Opens ideation form with fields: title, description, company case.
   * Submits ideation content linked to the group via `group_id`.
   * Ideation is stored in `ideations` table with `is_group = true`.

9. Group and ideation become read-only.

---

### 7.3 Individual Ideation (Online)

1. Online participant opens **Collaboration** menu.

2. If no submission yet → CTA “Create Submission".

3. If submission exist, there is  a card that represent the submission.

4. Sees direct submission form (no group flow).

5. Fills Astra company sub options, title, and ideation content description.

6. Clicks **Submit**, creates ideation record with:

   ```ts
   {
     isGroup: false,
     isSubmitted: true,
     submittedAt: ISODateTime
   }
   ```

7. Confirmation appears, and submission locks.

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
- Stats refresh on page load or manual refresh button

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
- Simple list with scroll (or pagination if many submissions)

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

**No filters/search** — simple scrollable list.

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
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  is_checked_in BOOLEAN DEFAULT false,
  event_checkin_time TIMESTAMP,
  event_checkin_method checkin_method,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `groups`

```sql
-- Groups Table: For member organization only
-- Ideation content is stored in ideations table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `booths`

```sql
CREATE TABLE booths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  question_text TEXT,
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
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
  )
);
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
- Auto-generate password or use default from env for participants

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
- Each offline participant can only be in ONE group at a time
- Creator automatically has `group_id` set to the new group
- Groups store only organizational data: `name`, `creator_id`, submission status
- Ideation content (title, description, company_case) is NOT stored in groups table

**Invite to Group:**
- Target participant must be `participant_type = 'offline'`
- Target participant must NOT have `group_id` (not in any group)
- Target participant must NOT have submitted individual ideation
- Sets `users.group_id = groupId` for the invited participant

**Leave Group:**
- Participant can leave only if `is_submitted = false`
- If creator leaves, consider deleting group or transferring ownership
- Sets `users.group_id = null` for the participant

**Submit Group (Step 1):**
- **Hard validation:** Group must have >= 5 members (validated in API layer)
- Re-fetch group data in real-time before submission to ensure no member left
- Lock group: set `is_submitted = true`, `submitted_at = now()`
- Prevent further invites/leaves after submission (enforced by RLS policies)

**Create Group Ideation (Step 2):**
- Can only be done after group is submitted (`is_submitted = true`)
- Leader fills ideation form: title, description, company_case
- Creates ideation record in `ideations` table linked to group via `group_id`
- Sets `is_group = true` on the ideation record
- Each group can have only ONE ideation

**Individual Ideation:**
- Only `participant_type = 'online'` can submit individual ideation
- Each online participant can submit only once
- Creates ideation record with `is_group = false` and `group_id = NULL`
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
  ├── booth/
  │   └── index     # booth list (offline: FAB scanner, online: grid cards)
  ├── collaboration/
  │   └── index
  └── zoom/
      └── index     # zoom meeting page with URL & join button

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

# Auth
VITE_PARTICIPANT_DEFAULT_PASSWORD=expertforum2025
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
- **Eligibility Status:** Live eligibility status updates using `api.checkins.subscribeToEligibilityChanges()`

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