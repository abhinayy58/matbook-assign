import { NavLink } from "react-router-dom";
import { buttonVariants, Button } from "../ui/button";
import { cn } from "../../lib/utils";

const links = [
  { to: "/create", label: "Create" },
  { to: "/myforms", label: "Forms" },
  { to: "/forms", label: "Preview" },
  { to: "/submissions", label: "Submissions" },
];


export function AppShell({ children }) {



  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              Matbook
            </p>
          </div>
          <nav className="flex gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    buttonVariants({
                      variant: isActive ? "default" : "ghost",
                      size: "sm",
                    })
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

