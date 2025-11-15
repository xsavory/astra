/**
 * AdminParticipantFilters Component
 *
 * Filter controls for participant table:
 * - Participant Type (All/Online/Offline)
 * - Check-in Status (All/Checked In/Not Checked In)
 * - Eligibility (All/Eligible/Not Eligible)
 * - Company (Select)
 * - Search (debounced input for name/email)
 * - Clear Filters button
 *
 * Uses URL search params for state persistence
 *
 * @see PRD.md Section 9.2.2 (Participant Management - Filters)
 */

import { Search, X } from 'lucide-react'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@repo/react-components/ui'
import { COMPANY_OPTIONS } from 'src/lib/constants'
import type { ParticipantType } from 'src/types/schema'

export interface ParticipantFilters {
  participantType?: ParticipantType | 'all'
  isCheckedIn?: boolean | 'all'
  isEligibleToDraw?: boolean | 'all'
  company?: string
  search?: string
}

interface AdminParticipantFiltersProps {
  filters: ParticipantFilters
  onFiltersChange: (filters: ParticipantFilters) => void
}

function AdminParticipantFilters({
  filters,
  onFiltersChange,
}: AdminParticipantFiltersProps) {
  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '' && value !== 'all'
  )

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange({
      participantType: 'all',
      isCheckedIn: 'all',
      isEligibleToDraw: 'all',
      company: '',
      search: '',
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Participant Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Participant Type</label>
          <Select
            value={filters.participantType || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                participantType: value as ParticipantType | 'all',
              })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Check-in Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Check-in Status</label>
          <Select
            value={
              filters.isCheckedIn === undefined || filters.isCheckedIn === 'all'
                ? 'all'
                : filters.isCheckedIn
                  ? 'checked-in'
                  : 'not-checked-in'
            }
            onValueChange={(value) => {
              const filterValue =
                value === 'all'
                  ? 'all'
                  : value === 'checked-in'
                    ? true
                    : false
              onFiltersChange({ ...filters, isCheckedIn: filterValue })
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="not-checked-in">Not Checked In</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Eligibility Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Eligibility</label>
          <Select
            value={
              filters.isEligibleToDraw === undefined ||
              filters.isEligibleToDraw === 'all'
                ? 'all'
                : filters.isEligibleToDraw
                  ? 'eligible'
                  : 'not-eligible'
            }
            onValueChange={(value) => {
              const filterValue =
                value === 'all'
                  ? 'all'
                  : value === 'eligible'
                    ? true
                    : false
              onFiltersChange({ ...filters, isEligibleToDraw: filterValue })
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="All Eligibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Eligibility</SelectItem>
              <SelectItem value="eligible">Eligible for Draw</SelectItem>
              <SelectItem value="not-eligible">Not Eligible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Company Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <Select
            value={filters.company || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                company: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {COMPANY_OPTIONS.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

export default AdminParticipantFilters
