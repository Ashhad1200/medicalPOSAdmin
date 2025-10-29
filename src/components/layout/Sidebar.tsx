import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissionCheck } from "@/hooks/useOrganizationPermissions";
import { ModuleName } from "@/config/database.types";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  module?: ModuleName;
  requiredAction?: 'read' | 'create' | 'update' | 'delete';
  requiredRole?: 'admin' | 'manager';
  specialPermission?: string;
}

const allNavItems: NavItem[] = [
  { 
    name: "Dashboard", 
    href: "/", 
    module: "dashboard",
    requiredAction: "read",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    name: "Organizations", 
    href: "/organizations", 
    requiredRole: "admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    name: "Users", 
    href: "/users", 
    module: "users",
    requiredAction: "read",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )
  },
  { 
    name: "Inventory", 
    href: "/inventory", 
    module: "inventory",
    requiredAction: "read",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  { 
    name: "Sales", 
    href: "/sales", 
    module: "sales",
    requiredAction: "read",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    name: "Reports", 
    href: "/reports", 
    module: "reports",
    requiredAction: "read",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    name: "Settings", 
    href: "/settings", 
    module: "settings",
    requiredAction: "read",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  { 
    name: "Billing", 
    href: "/billing", 
    module: "billing",
    requiredAction: "read",
    requiredRole: "manager",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { canAccess, hasSpecialAccess, isAdmin, isManager, userRole } = usePermissionCheck();

  // Filter navigation items based on permissions
  const getVisibleNavItems = (): NavItem[] => {
    return allNavItems.filter((item) => {
      // Check role-based access
      if (item.requiredRole === 'admin' && !isAdmin()) {
        return false;
      }
      if (item.requiredRole === 'manager' && !isManager()) {
        return false;
      }

      // Check special permissions
      if (item.specialPermission && !hasSpecialAccess(item.specialPermission)) {
        return false;
      }

      // Check module permissions
      if (item.module && item.requiredAction) {
        return canAccess(item.module, item.requiredAction);
      }

      return true;
    });
  };

  const visibleNavItems = getVisibleNavItems();

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
            <div className="mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${
                userRole === 'admin' ? 'bg-red-500/20 text-red-300' :
                userRole === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col space-y-2 p-6">
        {visibleNavItems.map((item) => {
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
              
              {/* Permission indicator */}
              {item.module && (
                <div className="w-2 h-2 rounded-full bg-green-400 opacity-60" title={`${item.module} access`}></div>
              )}
              
              {/* Hover effect */}
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                active 
                  ? "bg-purple-400" 
                  : "bg-transparent group-hover:bg-white/30"
              }`}></div>
            </Link>
          );
        })}
        
        {/* No access message */}
        {visibleNavItems.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-white/60 text-sm">No accessible modules</p>
            <p className="text-white/40 text-xs mt-1">Contact your administrator</p>
          </div>
        )}
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
