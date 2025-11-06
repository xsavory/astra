/**
 * CSV Export Utilities
 *
 * Functions for exporting data to CSV format:
 * - exportParticipantsToCSV: Export participant data
 * - exportSubmissionsToCSV: Export submission (ideation) data
 * - Includes all fields for admin reporting
 *
 * @see PRD.md Section 9.2.4 (Export Participants)
 * @see PRD.md Section 9.2.5 (Submission Management - Export)
 */

import { downloadCSV } from '@repo/react-components/lib'
import type { User, Ideation } from 'src/types/schema'

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

/**
 * Convert submissions data to CSV string
 * Includes group members for group submissions
 */
function convertSubmissionsToCSV(submissions: Array<Ideation & { creator: User }>, groupMembers?: Map<string, User[]>): string {
  // Define CSV headers
  const headers = [
    'ID',
    'Title',
    'Description',
    'Company Case',
    'Type',
    'Creator Name',
    'Creator Email',
    'Group Members',
    'Submitted At',
  ]

  // Create CSV rows
  const rows = submissions.map((submission) => {
    // Get group members if it's a group submission
    let groupMembersStr = ''
    if (submission.is_group && submission.group_id && groupMembers) {
      const members = groupMembers.get(submission.group_id) || []
      groupMembersStr = members.map((m) => `${m.name} (${m.email}${m.company ? ` - ${m.company}` : ''})`).join('; ')
    }

    return [
      submission.id,
      submission.title,
      submission.description,
      submission.company_case,
      submission.is_group ? 'Group' : 'Individual',
      submission.creator.name,
      submission.creator.email,
      groupMembersStr,
      new Date(submission.submitted_at).toLocaleString('id-ID'),
    ]
  })

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
 * Export submissions to CSV file
 * Generates filename with timestamp
 * Note: Group members need to be fetched separately for each group submission
 */
export function exportSubmissionsToCSV(submissions: Array<Ideation & { creator: User }>, groupMembers?: Map<string, User[]>): void {
  const csvContent = convertSubmissionsToCSV(submissions, groupMembers)
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .substring(0, 19)
  const filename = `submissions_${timestamp}.csv`

  downloadCSV(csvContent, filename)
}
