interface Props {
  children: React.ReactNode
}

function AdminPageLayout({ children }: Props) {
  return (
    <div>
      <h1>Admin Page Layout</h1>
      {children}
    </div>
  )
}

export default AdminPageLayout