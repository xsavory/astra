# Admin Dashboard - Implementation Continuation Guide

## 📋 Phase 1: COMPLETED ✅

### Components Created:
1. **AdminPageLayout** (`src/components/admin-page-layout.tsx`)
   - Navbar with user info, logout, fullscreen toggle
   - Responsive design (mobile + desktop)
   - No sidebar, always visible navbar

2. **AdminStatsCard** (`src/components/admin-stats-card.tsx`)
   - Reusable stats component
   - Support for badges (breakdown data)
   - Loading skeleton state
   - Icon support

3. **Admin Index Page** (`src/routes/admin/index.tsx`)
   - Main dashboard with 4 stats cards:
     - Total Participants (with offline/online badges)
     - Checked In (with breakdown)
     - Eligible for Draw
     - Submissions (with group/individual badges)
   - Real-time updates (auto-refresh every 30s)
   - Manual refresh button
   - Placeholder for participant management table

### Features Implemented:
- ✅ Layout dengan navbar (NO sidebar)
- ✅ Stats display dengan 4 metrics
- ✅ Real-time updates via React Query
- ✅ Manual refresh functionality
- ✅ Loading states
- ✅ Responsive design

---

## 📋 Phase 2: COMPLETED ✅

### Components Created:
1. **AdminParticipantFilters** (`src/components/admin-participant-filters.tsx`)
   - Participant Type filter (All/Online/Offline)
   - Check-in Status filter (All/Checked In/Not Checked In)
   - Eligibility filter (All/Eligible/Not Eligible)
   - Company filter (dynamic dropdown)
   - Search input (name/email)
   - Clear filters button

2. **AdminParticipantTable** (`src/components/admin-participant-table.tsx`)
   - Data table with columns: Name, Email, Type, Company, Check-in Status, Eligibility, Actions
   - Click row to open detail drawer (placeholder for Phase 4)
   - Delete button with disabled state for checked-in participants
   - Pagination with page size options (10, 25, 50, 100)
   - Loading skeleton rows
   - Empty state
   - Responsive (horizontal scroll on mobile)

3. **Admin Index Page Updates** (`src/routes/admin/index.tsx`)
   - Integrated filters and table components
   - State management with React useState (NO URL params)
   - React Query for data fetching with proper cache keys
   - Dynamic company filter options from data
   - Reset page to 1 on filter/limit changes

### Features Implemented:
- ✅ Filter controls (type, status, eligibility, company, search)
- ✅ Data table with pagination
- ✅ State management using React state
- ✅ Integration with UsersAPI
- ✅ Loading states and empty states
- ✅ Responsive design
- ✅ Delete button with validation

---

## 🚀 Next Session: Phase 3 - CRUD Operations

### Prompt to Continue:

```
Hi! Lanjut Admin Dashboard Phase 2 - Data Display.

Phase 1 sudah complete dengan files:
- src/components/admin-page-layout.tsx (layout)
- src/components/admin-stats-card.tsx (stats component)
- src/routes/admin/index.tsx (main page with stats)

Tolong baca src/routes/admin/index.tsx untuk lihat current implementation.

Phase 2 yang perlu dibuat:
1. AdminParticipantFilters component (filter dropdowns + search)
2. AdminParticipantTable component (data table dengan pagination)
3. Integration dengan UsersAPI untuk fetch participants

Requirements Phase 2:
- Filters: Type (All/Online/Offline), Check-in Status, Eligibility, Company (multi-select), Search (name/email)
- Table columns: Name, Email, Type, Company, Check-in Status, Eligibility, Actions
- Pagination: 10, 25, 50, 100 per page
- Click row untuk open detail drawer (dummy dulu)
- State management dengan URL params untuk filters

Referensi:
- PRD.md Section 9.2.2 (Participant Management)
- Existing UsersAPI di src/lib/api/users.ts
```

---

## 📝 Phase 2 Components to Create:

### 1. AdminParticipantFilters
**File:** `src/components/admin-participant-filters.tsx`

**Features:**
- Participant Type filter (Select: All/Online/Offline)
- Check-in Status filter (Select: All/Checked In/Not Checked In)
- Eligibility filter (Select: All/Eligible/Not Eligible)
- Company filter (Multi-select with dynamic options)
- Search input (debounced, search by name/email)
- Clear filters button

**State Management:**
- Use URL search params for filter state
- Props: `onFilterChange` callback

### 2. AdminParticipantTable
**File:** `src/components/admin-participant-table.tsx`

**Features:**
- Table with columns:
  - Name (sortable)
  - Email
  - Type (badge: Online/Offline)
  - Company
  - Check-in Status (badge with icon)
  - Eligibility (badge with icon)
  - Actions (delete button)
- Click row to open detail drawer
- Loading states (skeleton rows)
- Empty state
- Responsive (horizontal scroll on mobile)

**Data Fetching:**
- Use `api.users.getUsers(options)` with filters
- React Query for caching
- Server-side pagination

### 3. Pagination Component
**Reuse:** Use existing pagination from `@repo/react-components/ui`

**Features:**
- Page size selector (10, 25, 50, 100)
- Total count display
- Previous/Next buttons
- Page numbers

---

## 🔄 Integration Points

### API Methods to Use:
```typescript
// From src/lib/api/users.ts
api.users.getUsers({
  page: 1,
  limit: 10,
  participantType: 'offline' | 'online' | undefined,
  isCheckedIn: true | false | undefined,
  isEligibleToDraw: true | false | undefined,
  company: string | undefined,
  search: string | undefined,
})
```

### State Management:
- Use Tanstack Router `useSearch` for URL params
- Use `useNavigate` to update filters
- React Query for data fetching and caching

---

## 📦 Subsequent Phases

### Phase 3: CRUD Operations
- AdminParticipantFormDrawer (add/edit)
- Delete confirmation dialog
- CSV export functionality
- Create CSV utils

### Phase 4: Detail View
- AdminParticipantDetailDrawer
- Activity timeline (check-in, booths, ideations)
- Inline editing

### Phase 5: Submission Management
- AdminSubmissionDrawer
- Submission filters and search
- Export submissions CSV

---

## 🎯 Key Files Reference

### Existing Components:
- `src/components/admin-page-layout.tsx` - Layout wrapper
- `src/components/admin-stats-card.tsx` - Stats component
- `src/components/staff-page-layout.tsx` - Reference for layout patterns

### Main Page:
- `src/routes/admin/index.tsx` - Admin dashboard (has inline comments showing next steps)

### API:
- `src/lib/api/users.ts` - UsersAPI with CRUD methods
- `src/lib/api/stats.ts` - StatsAPI for dashboard metrics

### Types:
- `src/types/schema.ts` - User, Stats, and other types

### PRD:
- `PRD.md` Section 9 - Full admin requirements

---

## 💡 Tips for Next Session

1. **Read First:**
   - `src/routes/admin/index.tsx` (see Phase 1 implementation)
   - `src/lib/api/users.ts` (understand API methods)
   - PRD.md Section 9.2.2 (participant management requirements)

2. **Start With:**
   - AdminParticipantFilters (simpler, establishes state management pattern)
   - Then AdminParticipantTable (uses filters state)
   - Then integrate both into admin/index.tsx

3. **Testing:**
   - Test filters update URL params correctly
   - Test pagination works with filters
   - Test loading states and error handling

4. **Commit Message Template:**
```bash
git commit -m "feat(admin): implement Phase 2 - Participant table and filters

- Create AdminParticipantFilters with type, status, company filters
- Create AdminParticipantTable with pagination
- Integrate with UsersAPI for data fetching
- Add URL-based state management for filters

Next: Phase 3 - CRUD operations"
```

---

## 📊 Progress Tracker

- [x] **Phase 1:** Core Foundation (Layout + Stats) ✅
- [ ] **Phase 2:** Data Display (Table + Filters)
- [ ] **Phase 3:** CRUD Operations
- [ ] **Phase 4:** Detail View
- [ ] **Phase 5:** Submission Management

---

**Last Updated:** Phase 1 Complete
**Next Action:** Start Phase 2 - AdminParticipantFilters + AdminParticipantTable
