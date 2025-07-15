import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Organizations", href: "/organizations" },
  { name: "Users", href: "/users" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-white border-r shadow-sm hidden md:block">
      <div className="p-6 text-2xl font-bold">Admin</div>
      <nav className="flex flex-col space-y-1 px-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors ${
                active ? "bg-gray-200 text-gray-900" : "text-gray-800"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
