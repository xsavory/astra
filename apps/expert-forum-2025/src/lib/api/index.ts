import { AuthAPI } from './auth'
import { UsersAPI } from './users'
import { BoothsAPI } from './booths'
import { CheckinsAPI } from './checkins'
import { GroupsAPI } from './groups'
import { IdeationsAPI } from './ideations'
import { DrawsAPI } from './draws'
import { EventsAPI } from './events'
import { StatsAPI } from './stats'

/**
 * Main API object that combines all API modules
 * Simple singleton pattern with all API instances
 */
const api = {
  auth: new AuthAPI(),
  users: new UsersAPI(),
  booths: new BoothsAPI(),
  checkins: new CheckinsAPI(),
  groups: new GroupsAPI(),
  ideations: new IdeationsAPI(),
  draws: new DrawsAPI(),
  events: new EventsAPI(),
  stats: new StatsAPI(),
} as const

// Export singleton instance as default
export default api

// Export type from the singleton
export type API = typeof api
