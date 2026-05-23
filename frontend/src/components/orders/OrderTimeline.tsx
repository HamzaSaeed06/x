import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';

interface TimelineStep {
  key: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

const STEPS: TimelineStep[] = [
  { key: 'pending',   label: 'Order Placed',  icon: Clock,        description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed',      icon: CheckCircle,  description: 'Order confirmed by store' },
  { key: 'shipped',   label: 'Shipped',        icon: Truck,        description: 'On its way to you' },
  { key: 'delivered', label: 'Delivered',      icon: Package,      description: 'Package delivered' },
];

interface OrderTimelineProps {
  status: string;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 py-4 px-5 bg-red-50 border border-red-100 rounded-xl">
        <XCircle size={22} className="text-red-500 flex-shrink-0" />
        <div>
          <p className="text-[13px] font-bold text-red-700">Order Cancelled</p>
          <p className="text-[12px] text-red-500 mt-0.5">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  if (status === 'returned') {
    return (
      <div className="flex items-center gap-3 py-4 px-5 bg-gray-50 border border-gray-200 rounded-xl">
        <Package size={22} className="text-gray-500 flex-shrink-0" />
        <div>
          <p className="text-[13px] font-bold text-gray-700">Order Returned</p>
          <p className="text-[12px] text-gray-500 mt-0.5">This order has been returned.</p>
        </div>
      </div>
    );
  }

  const activeIdx = STEPS.findIndex(s => s.key === status);
  const effectiveIdx = activeIdx === -1 ? 0 : activeIdx;

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" style={{ marginLeft: 0 }}>
        <div
          className="h-full bg-black transition-all duration-700"
          style={{ width: effectiveIdx > 0 ? `${(effectiveIdx / (STEPS.length - 1)) * 100}%` : '0%' }}
        />
      </div>

      <div className="relative flex justify-between">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = effectiveIdx >= i;
          const active = effectiveIdx === i;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 flex-1 first:items-start last:items-end">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                  done
                    ? 'bg-black border-black text-white'
                    : 'bg-white border-gray-200 text-gray-300'
                } ${active ? 'ring-4 ring-black/10' : ''}`}
              >
                <Icon size={16} strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className={`text-[11px] font-bold whitespace-nowrap ${done ? 'text-black' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {active && step.description && (
                  <p className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
