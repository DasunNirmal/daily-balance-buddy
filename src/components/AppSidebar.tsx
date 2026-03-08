import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/daily', label: 'Daily Expenses', icon: Receipt },
  { to: '/salary', label: 'Salary', icon: Wallet },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          H
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">Henuka Fresh Fruits</p>
          <p className="text-xs text-muted-foreground">Expense Tracker</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === item.to
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <p className="mb-2 truncate px-3 text-xs text-muted-foreground">{user?.email}</p>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
