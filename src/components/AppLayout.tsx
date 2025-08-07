import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Menu } from "lucide-react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Global trigger header */}
          <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur-sm flex-shrink-0">
            <SidebarTrigger className="ml-2">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
          </header>

          <main className="flex-1 min-h-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}