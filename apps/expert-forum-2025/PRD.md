# 🎯 Microsite Event Platform — Product Requirements Document

## 1. Overview

The Microsite Event Platform is a hybrid (offline + online) engagement microsite for Astra Group’s corporate event.
It enables participants to check in, interact with booth content, submit ideation ideas, and join a lucky draw.
Built with **React + Vite + Tanstack Router** frontend and **Appwrite** backend.

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

All users (admin, staff, and participants) login through the same landing page `/`. Authentication is handled via **Appwrite Auth** with a conditional flow based on email detection.

### 3.2 User Registration

All users (admin, staff, participants) are **manually registered** by the admin team before the event:
- Create auth account in **Appwrite Auth**
- Insert user record into `users` collection with appropriate role

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
   - Submit → Appwrite login with email + password
   - Redirect based on role:
     - Admin → `/admin`
     - Staff → `/staff/index` (staff landing page)

   **Case B: Email is Participant**
   - System detects email NOT in admin/staff lists
   - **No password input shown**
   - Automatically use hardcoded password from `.env`:
     ```
     VITE_PARTICIPANT_PASSWORD=your_hardcoded_password
     ```
   - Submit → Appwrite login with email + env password
   - Redirect to `/participant`

#### 3.3.3 Error Handling

- **Invalid email (not found in Appwrite):** Show error "Email tidak terdaftar"
- **Wrong password (admin/staff):** Show error "Password salah" (no attempt limit)
- **Appwrite connection error:** Show error "Gagal terhubung ke server"

#### 3.3.4 Session Management

- Use Appwrite session for auth state
- Store user data in React Context/Zustand
- Implement protected routes based on `role`

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
- Progress bar visually updates in real-time as booths are completed
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
- Each booth can be answered only once and cannot be edited
- Progress updates in real-time after each booth check-in
- Voucher unlocks when threshold is met

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

2. If no group yet → CTA “Create Group”.

   * Fills Astra company sub options, title, and ideation content description.
   * Becomes **creatorId** (group leader).

3. If group exist, there is  a card that represent the group.

4. Leader can **invite participants** using a search field:

   * Only offline participants **without an existing group** appear.
   * Invited participants are added to `participantIds`.

5. Participants can **leave** a group (before submission).

6. Once group size ≥5, the ideation form becomes enabled.

7. Before submission, system checks group member count in real-time (to ensure no member has left).

8. Leader clicks **Submit**, locking the group:

   ```ts
   {
     isSubmitted: true,
     submittedAt: ISODateTime
   }
   ```

9. Group becomes read-only.

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
  - Creates Appwrite Auth account
  - Inserts record into `users` collection
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
  - Display all `participantIds` from `groups.participantIds`
  - Show name, email, company for each member
  - Fetch via join query or multiple lookups
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

## 11. Database Schema

### Enums

```ts
enum UserRole { ADMIN, STAFF, PARTICIPANT }
enum ParticipantType { ONLINE, OFFLINE }
enum CheckinMethod { QR, MANUAL }
```

---

### Collections

#### `events`

```ts
{
  $id: string
  name: string
  date: string
  isActive: boolean
  zoomMeetingUrl: string
  createdAt: string
  updatedAt: string
}
```

#### `users`

```ts
{
  $id: string
  name: string
  email: string
  role: "admin" | "staff" | "participant"
  participantType?: "online" | "offline"
  company?: string
  division?: string
  isCheckedIn?: boolean
  isEligibleToDraw?: boolean
  eventCheckinTime?: string
  eventCheckinMethod?: "qr" | "manual"
  groupId?: string
  createdAt: string
  updatedAt: string
}
```

#### `groups`

```ts
{
  $id: string
  title: string
  description: string
  companyCase: string
  creatorId: string
  participantIds: string[]
  isSubmitted: boolean
  submittedAt?: string
  createdAt: string
}
```

#### `booths`

```ts
{
  $id: string
  name: string
  description?: string
  posterUrl?: string
  questionText?: string
  order: number
}
```

#### `booth_checkins`

```ts
{
  $id: string
  participantId: string
  boothId: string
  answer?: string
  checkinTime: string
}
```

#### `ideations`

```ts
{
  $id: string
  title: string
  description: string
  companyCase: string
  creatorId: string
  participantIds: string[]
  isGroup: boolean
  isSubmitted: boolean
  submittedAt?: string
  createdAt: string
}
```

#### `draw_logs`

```ts
{
  $id: string
  winners: string[]
  createdAt: string
}
```

---

## 12. Appwrite Methods Specification

> **Note:** This project uses **Appwrite SDK** directly from the frontend. No custom backend API is needed. All data operations are performed via Appwrite's database, authentication, and storage services.

---

### 12.1 Authentication Methods

#### `loginUser(email: string, password: string)`
**Purpose:** Authenticate user and create session

**Appwrite Operations:**
```ts
import { account } from './appwrite'

const loginUser = async (email: string, password: string) => {
  const session = await account.createEmailPasswordSession(email, password)
  const user = await account.get()
  return { session, user }
}
```

**Returns:** `{ session: Session, user: User }`

---

#### `logoutUser()`
**Purpose:** End current session

**Appwrite Operations:**
```ts
const logoutUser = async () => {
  await account.deleteSession('current')
}
```

---

#### `getCurrentUser()`
**Purpose:** Get currently logged-in user

**Appwrite Operations:**
```ts
const getCurrentUser = async () => {
  const accountUser = await account.get()
  // Fetch user details from users collection
  const userDoc = await databases.getDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    accountUser.$id
  )
  return userDoc
}
```

---

### 12.2 User Management Methods (Admin/Helpdesk)

#### `getUsers(options)`
**Purpose:** Fetch paginated users with filters

**Parameters:**
```ts
{
  page?: number          // default: 1
  limit?: number         // default: 10
  participantType?: "online" | "offline"
  isCheckedIn?: boolean
  isEligibleToDraw?: boolean
  company?: string
  search?: string        // searches name and email
}
```

**Appwrite Operations:**
```ts
import { databases, Query } from './appwrite'

const getUsers = async (options) => {
  const queries = [
    Query.equal('role', 'participant'),
    Query.limit(options.limit || 10),
    Query.offset((options.page - 1) * options.limit)
  ]

  if (options.participantType) {
    queries.push(Query.equal('participantType', options.participantType))
  }

  if (options.isCheckedIn !== undefined) {
    queries.push(Query.equal('isCheckedIn', options.isCheckedIn))
  }

  if (options.isEligibleToDraw !== undefined) {
    queries.push(Query.equal('isEligibleToDraw', options.isEligibleToDraw))
  }

  if (options.company) {
    queries.push(Query.equal('company', options.company))
  }

  if (options.search) {
    queries.push(Query.search('name', options.search))
    // or Query.search('email', options.search)
  }

  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_USERS,
    queries
  )

  return {
    users: response.documents,
    total: response.total,
    page: options.page,
    limit: options.limit
  }
}
```

**Returns:** `{ users: User[], total: number, page: number, limit: number }`

---

#### `getAllUsersForExport()`
**Purpose:** Fetch all participants without pagination for CSV export

**Appwrite Operations:**
```ts
const getAllUsersForExport = async () => {
  const queries = [
    Query.equal('role', 'participant'),
    Query.limit(9999) // or use pagination loop
  ]

  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_USERS,
    queries
  )

  return response.documents
}
```

**Returns:** `User[]`

---

#### `getUserWithDetails(userId: string)`
**Purpose:** Get user with all related data (booth checkins, ideation, group)

**Appwrite Operations:**
```ts
const getUserWithDetails = async (userId: string) => {
  // Get user document
  const user = await databases.getDocument(DATABASE_ID, COLLECTION_USERS, userId)

  // Get booth checkins
  const boothCheckins = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_BOOTH_CHECKINS,
    [Query.equal('participantId', userId), Query.orderDesc('checkinTime')]
  )

  // Get ideation (if exists)
  const ideations = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDEATIONS,
    [Query.equal('creatorId', userId)]
  )

  // Get group (if exists)
  let group = null
  if (user.groupId) {
    group = await databases.getDocument(DATABASE_ID, COLLECTION_GROUPS, user.groupId)
  }

  return {
    user,
    boothCheckins: boothCheckins.documents,
    ideation: ideations.documents[0] || null,
    group
  }
}
```

**Returns:** `{ user: User, boothCheckins: BoothCheckin[], ideation?: Ideation, group?: Group }`

---

#### `createUser(data)`
**Purpose:** Create new participant (auth + database record)

**Parameters:**
```ts
{
  name: string
  email: string
  participantType: "online" | "offline"
  company?: string
  division?: string
}
```

**Appwrite Operations:**
```ts
import { account, databases, ID } from './appwrite'

const createUser = async (data) => {
  // 1. Create auth account
  const password = import.meta.env.VITE_PARTICIPANT_PASSWORD || 'defaultPass123'
  const userId = ID.unique()

  await account.create(userId, data.email, password, data.name)

  // 2. Create database record
  const userDoc = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    userId,
    {
      name: data.name,
      email: data.email,
      role: 'participant',
      participantType: data.participantType,
      company: data.company || null,
      division: data.division || null,
      isCheckedIn: false,
      isEligibleToDraw: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  )

  return { user: userDoc, authUserId: userId }
}
```

**Returns:** `{ user: User, authUserId: string }`

---

#### `updateUser(userId: string, data)`
**Purpose:** Update participant information

**Parameters:**
```ts
{
  name?: string
  email?: string
  participantType?: "online" | "offline"
  company?: string
  division?: string
}
```

**Appwrite Operations:**
```ts
const updateUser = async (userId: string, data) => {
  const updates = {
    ...data,
    updatedAt: new Date().toISOString()
  }

  const user = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    userId,
    updates
  )

  // If email changed, update auth email too
  if (data.email) {
    await account.updateEmail(data.email, data.currentPassword) // may need re-auth
  }

  return user
}
```

**Returns:** `User`

---

#### `deleteUser(userId: string)`
**Purpose:** Delete participant (with validation)

**Appwrite Operations:**
```ts
const deleteUser = async (userId: string) => {
  // 1. Fetch user to check isCheckedIn
  const user = await databases.getDocument(DATABASE_ID, COLLECTION_USERS, userId)

  if (user.isCheckedIn) {
    throw new Error('Participant sudah check-in, tidak dapat dihapus')
  }

  // 2. Soft delete (add deletedAt) or hard delete
  await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    userId,
    { deletedAt: new Date().toISOString() }
  )

  // Or hard delete:
  // await databases.deleteDocument(DATABASE_ID, COLLECTION_USERS, userId)

  return { success: true }
}
```

**Returns:** `{ success: boolean }`

---

### 12.3 Check-in Methods

#### `checkinEvent(participantId: string, method: "qr" | "manual", staffId?: string)`
**Purpose:** Check-in participant to event

**Appwrite Operations:**
```ts
const checkinEvent = async (participantId, method, staffId) => {
  // For online participants, check if event is active
  const user = await databases.getDocument(DATABASE_ID, COLLECTION_USERS, participantId)

  if (user.participantType === 'online') {
    const event = await databases.listDocuments(DATABASE_ID, COLLECTION_EVENTS, [Query.limit(1)])
    if (!event.documents[0]?.isActive) {
      throw new Error('Event belum aktif')
    }
  }

  // Check if already checked in
  if (user.isCheckedIn) {
    throw new Error('Participant sudah check-in')
  }

  // Update user
  const updatedUser = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    participantId,
    {
      isCheckedIn: true,
      eventCheckinTime: new Date().toISOString(),
      eventCheckinMethod: method,
      checkedInBy: staffId || null
    }
  )

  return updatedUser
}
```

**Returns:** `User`

---

#### `checkinBooth(participantId: string, boothId: string, answer: string)`
**Purpose:** Check-in participant to booth and record answer

**Appwrite Operations:**
```ts
const checkinBooth = async (participantId, boothId, answer) => {
  const user = await databases.getDocument(DATABASE_ID, COLLECTION_USERS, participantId)

  // Validate: must be checked in to event first
  if (!user.isCheckedIn) {
    throw new Error('Participant belum check-in ke event')
  }

  // Check if already visited this booth
  const existing = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_BOOTH_CHECKINS,
    [
      Query.equal('participantId', participantId),
      Query.equal('boothId', boothId)
    ]
  )

  if (existing.documents.length > 0) {
    throw new Error('Booth sudah dikunjungi')
  }

  // Create booth checkin record
  const checkin = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_BOOTH_CHECKINS,
    ID.unique(),
    {
      participantId,
      boothId,
      answer,
      checkinTime: new Date().toISOString()
    }
  )

  // Recalculate eligibility
  const boothCount = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_BOOTH_CHECKINS,
    [Query.equal('participantId', participantId)]
  )

  const threshold = user.participantType === 'offline' ? 10 : 6
  const isEligible = boothCount.total >= threshold

  const updatedUser = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    participantId,
    { isEligibleToDraw: isEligible }
  )

  return { checkin, user: updatedUser }
}
```

**Returns:** `{ checkin: BoothCheckin, user: User }`

---

### 12.4 Booth Methods

#### `getBooths()`
**Purpose:** Fetch all booths

**Appwrite Operations:**
```ts
const getBooths = async () => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_BOOTHS,
    [Query.orderAsc('order')]
  )

  return response.documents
}
```

**Returns:** `Booth[]`

---

#### `getBooth(boothId: string)`
**Purpose:** Fetch single booth

**Appwrite Operations:**
```ts
const getBooth = async (boothId: string) => {
  const booth = await databases.getDocument(DATABASE_ID, COLLECTION_BOOTHS, boothId)
  return booth
}
```

**Returns:** `Booth`

---

### 12.5 Ideation Methods

#### `getIdeations()`
**Purpose:** Fetch all ideation submissions

**Appwrite Operations:**
```ts
const getIdeations = async () => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDEATIONS,
    [Query.equal('isSubmitted', true), Query.orderDesc('submittedAt')]
  )

  return response.documents
}
```

**Returns:** `Ideation[]`

---

#### `getIdeationWithDetails(ideationId: string)`
**Purpose:** Get ideation with creator and participants data

**Appwrite Operations:**
```ts
const getIdeationWithDetails = async (ideationId: string) => {
  const ideation = await databases.getDocument(
    DATABASE_ID,
    COLLECTION_IDEATIONS,
    ideationId
  )

  // Fetch creator
  const creator = await databases.getDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    ideation.creatorId
  )

  // Fetch participants (for group ideations)
  let participants = []
  if (ideation.isGroup && ideation.participantIds.length > 0) {
    participants = await Promise.all(
      ideation.participantIds.map(id =>
        databases.getDocument(DATABASE_ID, COLLECTION_USERS, id)
      )
    )
  }

  return { ideation, creator, participants }
}
```

**Returns:** `{ ideation: Ideation, creator: User, participants: User[] }`

---

#### `createIdeation(data)`
**Purpose:** Create ideation submission (individual or group)

**Parameters:**
```ts
{
  title: string
  description: string
  companyCase: string
  creatorId: string
  participantIds: string[] // for group
  isGroup: boolean
}
```

**Appwrite Operations:**
```ts
const createIdeation = async (data) => {
  const ideation = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDEATIONS,
    ID.unique(),
    {
      title: data.title,
      description: data.description,
      companyCase: data.companyCase,
      creatorId: data.creatorId,
      participantIds: data.participantIds || [],
      isGroup: data.isGroup,
      isSubmitted: false,
      createdAt: new Date().toISOString()
    }
  )

  return ideation
}
```

**Returns:** `Ideation`

---

#### `submitIdeation(ideationId: string, participantIds?: string[])`
**Purpose:** Submit ideation (with group validation)

**Appwrite Operations:**
```ts
const submitIdeation = async (ideationId: string, participantIds?: string[]) => {
  const ideation = await databases.getDocument(
    DATABASE_ID,
    COLLECTION_IDEATIONS,
    ideationId
  )

  // For group: validate minimum 5 members
  if (ideation.isGroup) {
    if (participantIds.length < 5) {
      throw new Error('Grup minimal 5 anggota')
    }
  }

  const updatedIdeation = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_IDEATIONS,
    ideationId,
    {
      isSubmitted: true,
      submittedAt: new Date().toISOString()
    }
  )

  return updatedIdeation
}
```

**Returns:** `Ideation`

---

### 12.6 Group Methods (Offline Participants)

#### `createGroup(data)`
**Purpose:** Create new group for offline collaboration

**Parameters:**
```ts
{
  title: string
  description: string
  companyCase: string
  creatorId: string
}
```

**Appwrite Operations:**
```ts
const createGroup = async (data) => {
  const group = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_GROUPS,
    ID.unique(),
    {
      title: data.title,
      description: data.description,
      companyCase: data.companyCase,
      creatorId: data.creatorId,
      participantIds: [data.creatorId], // auto-add creator
      isSubmitted: false,
      createdAt: new Date().toISOString()
    }
  )

  // Update creator's groupId
  await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    data.creatorId,
    { groupId: group.$id }
  )

  return group
}
```

**Returns:** `Group`

---

#### `inviteToGroup(groupId: string, participantId: string)`
**Purpose:** Invite participant to group

**Appwrite Operations:**
```ts
const inviteToGroup = async (groupId: string, participantId: string) => {
  // Validate: participant is offline and not in any group
  const participant = await databases.getDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    participantId
  )

  if (participant.participantType !== 'offline') {
    throw new Error('Hanya offline participant yang bisa join grup')
  }

  if (participant.groupId) {
    throw new Error('Participant sudah ada di grup lain')
  }

  // Update group
  const group = await databases.getDocument(DATABASE_ID, COLLECTION_GROUPS, groupId)

  const updatedGroup = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_GROUPS,
    groupId,
    {
      participantIds: [...group.participantIds, participantId]
    }
  )

  // Update participant's groupId
  await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    participantId,
    { groupId }
  )

  return updatedGroup
}
```

**Returns:** `Group`

---

#### `leaveGroup(groupId: string, participantId: string)`
**Purpose:** Remove participant from group

**Appwrite Operations:**
```ts
const leaveGroup = async (groupId: string, participantId: string) => {
  const group = await databases.getDocument(DATABASE_ID, COLLECTION_GROUPS, groupId)

  if (group.isSubmitted) {
    throw new Error('Grup sudah di-submit, tidak bisa keluar')
  }

  // Update group
  const updatedGroup = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_GROUPS,
    groupId,
    {
      participantIds: group.participantIds.filter(id => id !== participantId)
    }
  )

  // Clear participant's groupId
  await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_USERS,
    participantId,
    { groupId: null }
  )

  return updatedGroup
}
```

**Returns:** `Group`

---

#### `getAvailableParticipants()`
**Purpose:** Get offline participants without existing group

**Appwrite Operations:**
```ts
const getAvailableParticipants = async () => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_USERS,
    [
      Query.equal('participantType', 'offline'),
      Query.isNull('groupId')
    ]
  )

  return response.documents
}
```

**Returns:** `User[]`

---

### 12.7 Draw Methods

#### `getEligibleParticipants()`
**Purpose:** Get participants eligible for draw

**Appwrite Operations:**
```ts
const getEligibleParticipants = async () => {
  // Get all draw logs to exclude past winners
  const drawLogs = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_DRAW_LOGS
  )

  const pastWinners = drawLogs.documents.flatMap(log => log.winners)

  // Get eligible participants
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_USERS,
    [Query.equal('isEligibleToDraw', true)]
  )

  // Filter out past winners
  const eligible = response.documents.filter(
    user => !pastWinners.includes(user.$id)
  )

  return eligible
}
```

**Returns:** `User[]`

---

#### `submitDraw(winners: string[], staffId: string)`
**Purpose:** Save draw results

**Appwrite Operations:**
```ts
const submitDraw = async (winners: string[], staffId: string) => {
  const drawLog = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_DRAW_LOGS,
    ID.unique(),
    {
      winners,
      staffId,
      createdAt: new Date().toISOString()
    }
  )

  return drawLog
}
```

**Returns:** `DrawLog`

---

### 12.8 Event Methods

#### `getEvent()`
**Purpose:** Get current event data including Zoom meeting URL

**Appwrite Operations:**
```ts
const getEvent = async () => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_EVENTS,
    [Query.limit(1)]
  )

  if (response.documents.length === 0) {
    throw new Error('Event tidak ditemukan')
  }

  return response.documents[0]
}
```

**Returns:** `Event` (with `zoomMeetingUrl` field)

**Usage:**
- Zoom page: Fetch `zoomMeetingUrl` from event
- Check-in validation: Check `isActive` status for online participants
- Display event info across the app

---

### 12.9 Statistics Methods (Admin)

#### `getStats()`
**Purpose:** Get dashboard statistics

**Appwrite Operations:**
```ts
const getStats = async () => {
  // Total participants
  const allParticipants = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_USERS,
    [Query.equal('role', 'participant'), Query.limit(9999)]
  )

  const offlineCount = allParticipants.documents.filter(
    u => u.participantType === 'offline'
  ).length

  const onlineCount = allParticipants.documents.filter(
    u => u.participantType === 'online'
  ).length

  // Checked-in participants
  const checkedIn = allParticipants.documents.filter(u => u.isCheckedIn)
  const checkedInOffline = checkedIn.filter(u => u.participantType === 'offline').length
  const checkedInOnline = checkedIn.filter(u => u.participantType === 'online').length

  // Eligible for draw
  const eligible = allParticipants.documents.filter(u => u.isEligibleToDraw).length

  // Submissions
  const submissions = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDEATIONS,
    [Query.equal('isSubmitted', true)]
  )

  const groupSubmissions = submissions.documents.filter(s => s.isGroup).length
  const individualSubmissions = submissions.documents.filter(s => !s.isGroup).length

  return {
    totalParticipants: {
      total: allParticipants.total,
      offline: offlineCount,
      online: onlineCount
    },
    checkedIn: {
      total: checkedIn.length,
      offline: checkedInOffline,
      online: checkedInOnline
    },
    eligibleForDraw: eligible,
    submissions: {
      total: submissions.total,
      group: groupSubmissions,
      individual: individualSubmissions
    }
  }
}
```

**Returns:**
```ts
{
  totalParticipants: { total: number, offline: number, online: number }
  checkedIn: { total: number, offline: number, online: number }
  eligibleForDraw: number
  submissions: { total: number, group: number, individual: number }
}
```

---

## 13. Validation Rules & Business Logic

### 13.1 User Management

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

### 13.2 Check-in

**Event Check-in:**
- Can only check in once per participant
- Online participants: require `events.isActive === true`
- Offline participants: no event active check (QR scan works anytime)
- Update: `isCheckedIn = true`, `eventCheckinTime = now()`, `eventCheckinMethod`

**Booth Check-in:**
- Participant must be checked in to event first (`isCheckedIn === true`)
- Each booth can be visited only once per participant
- `answer` is required for booth check-in
- After booth check-in, recalculate `isEligibleToDraw`:
  - Offline: 10 booths completed
  - Online: 6 booths completed

---

### 13.3 Ideation & Groups

**Group Creation:**
- Only `participantType = "offline"` can create groups
- Each offline participant can only be in ONE group at a time
- `creatorId` automatically added to `participantIds`

**Invite to Group:**
- Target participant must be `participantType = "offline"`
- Target participant must NOT have `groupId` (not in any group)
- Target participant must NOT have submitted individual ideation

**Leave Group:**
- Participant can leave only if `isSubmitted = false`
- If creator leaves, consider deleting group or transferring ownership
- Remove participant from `participantIds`, clear `groupId`

**Submit Group Ideation:**
- **Hard validation:** `participantIds.length >= 5`
- Re-fetch group data in real-time before submission to ensure no member left
- Lock group: set `isSubmitted = true`, `submittedAt = now()`
- Prevent further edits/invites/leaves after submission

**Individual Ideation:**
- Only `participantType = "online"` can submit individual ideation
- Each online participant can submit only once
- Lock submission: set `isSubmitted = true`, `submittedAt = now()`

---

### 13.4 Lucky Draw

**Eligible Participants:**
- `isEligibleToDraw === true`
- Have not won in previous draws (check `draw_logs.winners`)

**Submit Draw:**
- Validate all `winners` are eligible
- Create `draw_logs` record
- Consider updating `users` with `hasWon` flag or similar

---

### 13.5 Event Activation

**Event Active Status:**
- Controlled via Appwrite Console (direct database update)
- Online participant check-in disabled when `events.isActive = false`
- No UI control needed in admin panel

---

## 14. Routing Structure

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

## 15. Access Control & Route Guards

| Role        | Path           | Description                             |
| ----------- | -------------- | --------------------------------------- |
| Participant | /participant/* | Full participant portal (post check-in) |
| Staff       | /staff/*       | Tools for check-in, draw, helpdesk      |
| Admin       | /admin/*       | Global data and management              |

---

## 16. Frontend Technical Requirements

### 16.1 Tech Stack

**Framework & Build:**
- **Framework:** React 18+ with Vite
- **Routing:** Tanstack Router (file-based routing)
- **State Management:** Zustand or React Context + useReducer
- **Data Fetching:** Tanstack Query (React Query)
- **Backend:** Appwrite SDK (direct from frontend)

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

### 16.2 Environment Variables
```env
# Appwrite
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id

# Collections
VITE_COLLECTION_USERS=users
VITE_COLLECTION_BOOTHS=booths
VITE_COLLECTION_BOOTH_CHECKINS=booth_checkins
VITE_COLLECTION_IDEATIONS=ideations
VITE_COLLECTION_GROUPS=groups
VITE_COLLECTION_DRAW_LOGS=draw_logs
VITE_COLLECTION_EVENTS=events

# Auth
VITE_PARTICIPANT_PASSWORD=default_participant_password
```

### 16.3 Constants File Structure
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

### 16.4 Protected Route Implementation
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

### 16.5 Key Features to Implement

**Real-time Updates:**
- Consider Appwrite Realtime for live stats updates on admin dashboard
- Live progress bar updates for participants
- Group member updates for offline collaboration

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

## 17. Backend Technical Notes

### 17.1 Appwrite Configuration

**Collections to Create:**
1. `events` - Single record for event config
2. `users` - All users (synced with Appwrite Auth)
3. `booths` - Pre-populated booth data
4. `booth_checkins` - Participant booth interactions
5. `ideations` - All ideation submissions
6. `groups` - Group formations (offline participants)
7. `draw_logs` - Draw history

**Indexes Required:**
- `users`: `email` (unique), `role`, `participantType`, `isCheckedIn`, `isEligibleToDraw`
- `booth_checkins`: `participantId`, `boothId`, composite (`participantId` + `boothId`)
- `ideations`: `creatorId`, `isGroup`, `isSubmitted`
- `groups`: `creatorId`, `isSubmitted`

**Permissions:**
- Use Appwrite's built-in role-based permissions
- Separate read/write permissions for each role
- Staff and Admin get broader access

### 17.2 Key Backend Logic

**Auto-Calculate isEligibleToDraw:**
- Trigger: After booth check-in
- Logic:
  ```ts
  const boothCount = await getBoothCheckinCount(participantId)
  const threshold = participantType === 'offline' ? 10 : 6
  const isEligible = boothCount >= threshold

  await updateUser(participantId, { isEligibleToDraw: isEligible })
  ```

**Group Validation Before Submit:**
- Re-fetch group in real-time
- Count `participantIds.length`
- Ensure >= 5 before allowing submission

**Prevent Duplicate Booth Check-ins:**
- Query `booth_checkins` for existing record with same `participantId` + `boothId`
- Return error if exists

---