import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    name: "Organizations", 
    href: "/organizations", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    name: "Users", 
    href: "/users", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-72 glass-sidebar hidden md:block relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="grid grid-cols-6 gap-4 p-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-purple-400 rounded-full opacity-20"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Logo Section */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin</h2>
            <p className="text-xs text-white/60">Control Panel</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col space-y-2 p-6">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                active 
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r"></div>
              )}
              
              <div className={`transition-all duration-300 ${
                active ? "text-purple-300" : "text-white/50 group-hover:text-white/80"
              }`}>
                {item.icon}
              </div>
              
              <span className="flex-1">{item.name}</span>
              
              {/* Hover effect */}
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                active 
                  ? "bg-purple-400" 
                  : "bg-transparent group-hover:bg-white/30"
              }`}></div>
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-white">System Status</p>
              <p className="text-xs text-green-400">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
