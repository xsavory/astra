/**
 * Admin Dashboard - Main Page
 *
 * Implementation Status:
 * =====================
 * Phase 1: Core Foundation ✅ DONE
 * - AdminPageLayout: ✅ Complete (navbar with user info, logout, fullscreen)
 * - AdminStatsCard: ✅ Complete (reusable stats component)
 * - Stats Section: ✅ Complete (4 metrics with real-time updates)
 *
 * Phase 2: Data Display 🚧 TODO
 * - [ ] AdminParticipantFilters (type, status, company, search)
 * - [ ] AdminParticipantTable (read-only with pagination)
 * - [ ] Click row to open detail drawer
 *
 * Phase 3: CRUD Operations 🚧 TODO
 * - [ ] AdminParticipantFormDrawer (add/edit)
 * - [ ] Delete with validation
 * - [ ] CSV export functionality
 *
 * Phase 4: Detail View 🚧 TODO
 * - [ ] AdminParticipantDetailDrawer (basic info + timeline)
 *
 * Phase 5: Submission Management 🚧 TODO
 * - [ ] AdminSubmissionDrawer (list + detail + export)
 *
 * @see PRD.md Section 9 for full requirements
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, Trophy, FileText, RefreshCw } from 'lucide-react'

import AdminStatsCard from 'src/components/admin-stats-card'
import PageLoader from 'src/components/page-loader'
import { Button } from '@repo/react-components/ui'
import api from 'src/lib/api'
import type { Stats } from 'src/types/schema'

export const Route = createFileRoute('/admin/')({
  component: AdminIndexPage,
  pendingComponent: PageLoader,
})

function AdminIndexPage() {
  // Fetch stats with real-time updates
  const { data: stats, isLoading, refetch, isFetching } = useQuery<Stats>({
    queryKey: ['adminStats'],
    queryFn: () => api.stats.getStats(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  })

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Monitor event statistics and manage participants
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Participants */}
        <AdminStatsCard
          title="Total Participants"
          value={stats?.totalParticipants.total || 0}
          badges={[
            { label: 'Offline', value: stats?.totalParticipants.offline || 0 },
            { label: 'Online', value: stats?.totalParticipants.online || 0 },
          ]}
          icon={Users}
          isLoading={isLoading}
        />

        {/* Checked In */}
        <AdminStatsCard
          title="Checked In"
          value={stats?.checkedIn.total || 0}
          badges={[
            { label: 'Offline', value: stats?.checkedIn.offline || 0 },
            { label: 'Online', value: stats?.checkedIn.online || 0 },
          ]}
          icon={UserCheck}
          isLoading={isLoading}
        />

        {/* Eligible for Draw */}
        <AdminStatsCard
          title="Eligible for Draw"
          value={stats?.eligibleForDraw || 0}
          icon={Trophy}
          isLoading={isLoading}
        />

        {/* Submissions */}
        <AdminStatsCard
          title="Submissions"
          value={stats?.submissions.total || 0}
          badges={[
            { label: 'Group', value: stats?.submissions.group || 0 },
            { label: 'Individual', value: stats?.submissions.individual || 0 },
          ]}
          icon={FileText}
          isLoading={isLoading}
        />
      </div>

      {/* Placeholder for Participant Management Section */}
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Participant Management Table
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Coming in Phase 2: Filters, Table, and CRUD operations
        </p>
      </div>
    </div>
  )
}

export default AdminIndexPage
