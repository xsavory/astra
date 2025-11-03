import type { User } from 'src/types/schema'


interface CollaborationOfflinePageProps {
  user: User
}

function CollaborationOfflinePage({ }: CollaborationOfflinePageProps) {
  return (
    <div>
      <h1>Collaboration Offline Page</h1>
    </div>
  )
}
export default CollaborationOfflinePage