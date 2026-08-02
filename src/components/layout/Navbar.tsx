import { NavLink } from "react-router-dom";
import { clsx } from "clsx";

const navItems = [
  { to: "/", label: "首页" },
  { to: "/word", label: "单词" },
  { to: "/article", label: "文章" },
  { to: "/materials", label: "素材" },
  { to: "/stats", label: "统计" },
  { to: "/settings", label: "设置" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-1">
        <div className="font-bold text-lg text-blue-600 dark:text-blue-400 mr-6 shrink-0">
          ⌨️ 打字大师
        </div>
        <div className="flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
