interface Props {
  children: React.ReactNode
}

function StaffPageLayout({ children }: Props) {
  return (
    <div>
      <h1>Staff Page Layout</h1>
      {children}
    </div>
  )
}

export default StaffPageLayout