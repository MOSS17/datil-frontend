import { NavLink, Outlet } from 'react-router-dom';
import {
  Calendar,
  CalendarClock,
  HeartHandshake,
  Home,
  LogOut,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Inicio', icon: Home, end: true },
  { to: '/dashboard/citas', label: 'Calendario', icon: Calendar },
  { to: '/dashboard/servicios', label: 'Catálogo', icon: HeartHandshake },
  { to: '/dashboard/horario', label: 'Disponibilidad', icon: CalendarClock },
  { to: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-300 px-200">
      <span
        aria-hidden
        className="flex h-700 w-700 items-center justify-center rounded-sm bg-surface-primary font-serif text-body-sm text-on-color"
      >
        D
      </span>
      <span className="font-serif text-body-lg text-heading">Datil</span>
    </div>
  );
}

function SidebarNav() {
  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-100">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex h-1000 items-center gap-300 rounded-md px-400 font-sans text-body-sm transition-colors',
              isActive
                ? 'bg-surface-secondary-subtle text-primary'
                : 'text-body hover:bg-surface-secondary-subtle',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                aria-hidden
                size={16}
                strokeWidth={1.75}
                className={isActive ? 'text-icon-primary' : 'text-icon-secondary'}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-400">
      <hr className="border-t border-subtle" aria-hidden />
      <div className="flex items-center gap-300 px-200">
        <span
          aria-hidden
          className="flex h-900 w-900 shrink-0 items-center justify-center rounded-full bg-surface-accent-subtle font-sans text-body-sm font-semibold text-accent"
        >
          {getInitials(user.name)}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-sans text-body-sm font-medium text-body-emphasis">
            {user.name}
          </span>
          <span className="truncate font-sans text-caption text-muted">{user.email}</span>
        </div>
      </div>
      <Button
        variant="secondary"
        fullWidth
        leftIcon={<LogOut aria-hidden size={16} strokeWidth={1.75} />}
        onClick={logout}
      >
        Log Out
      </Button>
    </div>
  );
}

function Sidebar() {
  return (
    <aside
      aria-label="Barra lateral"
      className="hidden md:flex w-[260px] shrink-0 flex-col justify-between border-r border-control bg-surface px-400 py-600"
    >
      <div className="flex flex-col gap-800">
        <SidebarBrand />
        <SidebarNav />
      </div>
      <SidebarFooter />
    </aside>
  );
}

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surface-page">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
