import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellRinging,
  Checks,
  Package,
  ClockCounterClockwise,
  Gift,
  ShoppingCart,
  Star,
  Tag,
  X,
} from 'phosphor-react';
import { useAuthStore } from '@/store/authStore';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/lib/services/notificationService';
import { Link } from 'wouter';

const TYPE_ICONS: Record<string, React.ElementType> = {
  order: Package,
  promo: Gift,
  restock: BellRinging,
  flash_sale: Tag,
  loyalty: Star,
  abandoned_cart: ShoppingCart,
  system: ClockCounterClockwise,
};

export function NotificationBell() {
  const { user, isLoading } = useAuthStore();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getNotifications().then(setNotifs).catch(() => {});
    const interval = setInterval(() => {
      getNotifications().then(setNotifs).catch(() => {});
    }, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (isLoading || !user) return null;

  const unread = notifs.filter((n) => !n.isRead).length;

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open && unread > 0) {
      // Mark visible notifications as read after a short delay
      setTimeout(() => {
        notifs.filter((n) => !n.isRead).forEach((n) => markAsRead(n.id));
        setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }, 1500);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-[var(--neutral-100)] transition-colors"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        {unread > 0 ? <BellRinging className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[var(--border-default)] shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
            <span className="font-semibold text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-[var(--text-muted)] hover:text-black flex items-center gap-1">
                  <Checks className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-[var(--neutral-300)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
              </div>
            ) : (
              notifs.slice(0, 20).map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? ClockCounterClockwise;
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--neutral-50)] transition-colors ${!n.isRead ? 'bg-[var(--neutral-50)]' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-black text-white' : 'bg-[var(--neutral-100)] text-[var(--text-muted)]'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {n.link ? (
                          <Link href={n.link} onClick={() => setOpen(false)} className="font-medium text-xs leading-tight block hover:underline">
                            {n.title}
                          </Link>
                        ) : (
                          <p className="font-medium text-xs leading-tight">{n.title}</p>
                        )}
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-[var(--neutral-400)] mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.isRead && <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 flex-shrink-0" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
