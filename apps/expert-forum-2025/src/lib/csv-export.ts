/**
 * CSV Export Utilities
 *
 * Functions for exporting data to CSV format:
 * - exportParticipantsToCSV: Export participant data
 * - Includes all participant fields for admin reporting
 *
 * @see PRD.md Section 9.2.4 (Export Participants)
 */

import { downloadCSV } from '@repo/react-components/lib'
import type { User } from 'src/types/schema'

/**
 * Convert participants data to CSV string
 */
function convertParticipantsToCSV(users: User[]): string {
  // Define CSV headers
  const headers = [
    'ID',
    'Name',
    'Email',
    'Role',
    'Participant Type',
    'Company',
    'Division',
    'Is Checked In',
    'Is Eligible To Draw',
    'Event Checkin Time',
    'Event Checkin Method',
    'Created At',
  ]

  // Create CSV rows
  const rows = users.map((user) => [
    user.id,
    user.name,
    user.email,
    user.role,
    user.participant_type || '',
    user.company || '',
    user.division || '',
    user.is_checked_in ? 'Yes' : 'No',
    user.is_eligible_to_draw ? 'Yes' : 'No',
    user.event_checkin_time
      ? new Date(user.event_checkin_time).toLocaleString('id-ID')
      : '',
    user.event_checkin_method || '',
    new Date(user.created_at).toLocaleString('id-ID'),
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
        .join(',')
    ),
  ].join('\n')

  return csvContent
}

/**
 * Export participants to CSV file
 * Generates filename with timestamp
 */
export function exportParticipantsToCSV(users: User[]): void {
  const csvContent = convertParticipantsToCSV(users)
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .substring(0, 19)
  const filename = `participants_${timestamp}.csv`

  downloadCSV(csvContent, filename)
}
