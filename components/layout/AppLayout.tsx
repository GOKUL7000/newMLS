import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
