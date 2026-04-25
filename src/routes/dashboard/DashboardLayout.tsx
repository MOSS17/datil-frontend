import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Calendar,
  CalendarClock,
  HeartHandshake,
  Home,
  LogOut,
  Menu,
  Settings,
  X,
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

function SidebarBrand({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-300 px-200">
      <div className="flex items-center gap-300">
        <span
          aria-hidden
          className="flex h-700 w-700 items-center justify-center rounded-sm bg-surface-primary font-serif text-body-sm text-on-color"
        >
          D
        </span>
        <span className="font-serif text-body-lg text-heading">Datil</span>
      </div>
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className="inline-flex items-center justify-center rounded-md border border-default bg-surface p-100 md:hidden"
      >
        <X aria-hidden size={24} strokeWidth={1.75} />
      </button>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-100">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex h-1000 items-center gap-300 rounded-md px-400 font-sans text-body-sm transition-colors',
              isActive
                ? 'bg-surface-secondary-subtle text-primary'
                : 'hover:bg-surface-secondary-subtle',
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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside
      aria-label="Barra lateral"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col justify-between border-r border-control bg-surface px-400 py-600 transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:static md:translate-x-0 md:transition-none',
      )}
    >
      <div className="flex flex-col gap-800">
        <SidebarBrand onClose={onClose} />
        <SidebarNav onNavigate={onClose} />
      </div>
      <SidebarFooter />
    </aside>
  );
}

function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex items-center px-400 pt-600 pb-400 md:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={onOpen}
        className="inline-flex items-center justify-center rounded-md border border-default bg-surface p-100"
      >
        <Menu aria-hidden size={24} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  return (
    <div className="flex h-screen bg-surface-page">
      {drawerOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-surface-primary/25 md:hidden"
        />
      )}
      <Sidebar open={drawerOpen} onClose={closeDrawer} />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <MobileTopBar onOpen={openDrawer} />
        <Outlet />
      </main>
    </div>
  );
}
