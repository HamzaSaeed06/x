const STATUS_MAP: Record<string, { label: string; fg: string; bg: string }> = {
  pending:    { label: 'Pending',    fg: 'var(--status-pending-fg)',    bg: 'var(--status-pending-bg)'    },
  confirmed:  { label: 'Confirmed',  fg: 'var(--status-confirmed-fg)',  bg: 'var(--status-confirmed-bg)'  },
  processing: { label: 'Processing', fg: 'var(--status-processing-fg)', bg: 'var(--status-processing-bg)' },
  shipped:    { label: 'Shipped',    fg: 'var(--status-shipped-fg)',    bg: 'var(--status-shipped-bg)'    },
  delivered:  { label: 'Delivered',  fg: 'var(--status-delivered-fg)',  bg: 'var(--status-delivered-bg)'  },
  cancelled:  { label: 'Cancelled',  fg: 'var(--status-cancelled-fg)',  bg: 'var(--status-cancelled-bg)'  },
  returned:   { label: 'Returned',   fg: 'var(--status-returned-fg)',   bg: 'var(--status-returned-bg)'   },
  admin:      { label: 'Admin',      fg: '#1e293b',                     bg: '#e2e8f0'                     },
  user:       { label: 'Customer',   fg: 'var(--admin-text-muted)',     bg: 'var(--admin-surface-2)'      },
  active:     { label: 'Active',     fg: 'var(--admin-success)',        bg: 'var(--admin-success-bg)'     },
  suspended:  { label: 'Suspended',  fg: 'var(--admin-danger)',         bg: 'var(--admin-danger-bg)'      },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status?.toLowerCase()] ?? {
    label: status,
    fg: 'var(--admin-text-secondary)',
    bg: 'var(--admin-surface-2)',
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ color: cfg.fg, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}
