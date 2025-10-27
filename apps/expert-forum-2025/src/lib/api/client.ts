import { Client, Account, TablesDB, ID, Query } from 'appwrite'

// Appwrite client configuration
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT as string)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID as string)

// Appwrite services
export const account = new Account(client)
export const tablesDB = new TablesDB(client)

// Export ID and Query utilities
export { ID, Query }

// Database and table IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string

export const TABLES = {
  USERS: import.meta.env.VITE_COLLECTION_USERS as string,
  BOOTHS: import.meta.env.VITE_COLLECTION_BOOTHS as string,
  BOOTH_CHECKINS: import.meta.env.VITE_COLLECTION_BOOTH_CHECKINS as string,
  IDEATIONS: import.meta.env.VITE_COLLECTION_IDEATIONS as string,
  GROUPS: import.meta.env.VITE_COLLECTION_GROUPS as string,
  DRAW_LOGS: import.meta.env.VITE_COLLECTION_DRAW_LOGS as string,
  EVENTS: import.meta.env.VITE_COLLECTION_EVENTS as string,
} as const

export default client
