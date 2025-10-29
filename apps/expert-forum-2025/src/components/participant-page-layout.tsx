interface Props {
  children: React.ReactNode
}

function ParticipantPageLayout({ children }: Props) {
  return (
    <div>
      <h1>Participant Page Layout</h1>
      {children}
    </div>
  )
}

export default ParticipantPageLayout