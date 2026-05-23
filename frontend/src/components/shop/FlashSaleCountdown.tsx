import { useState, useEffect } from 'react';

interface FlashSaleCountdownProps {
  endDate?: string;
}

export function FlashSaleCountdown({ endDate }: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function getEndTime() {
      if (endDate) {
        const d = new Date(endDate);
        if (!isNaN(d.getTime()) && d.getTime() > Date.now()) return d;
      }
      const eod = new Date();
      eod.setHours(23, 59, 59, 999);
      return eod;
    }

    let endTime = getEndTime();

    function tick() {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setExpired(true);
        return;
      }
      setExpired(false);
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (expired) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">Sale ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest mr-1">Ends in</span>
      {[
        { val: pad(timeLeft.hours), label: 'HRS' },
        { val: pad(timeLeft.minutes), label: 'MIN' },
        { val: pad(timeLeft.seconds), label: 'SEC' },
      ].map(({ val, label }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-extrabold text-white tabular-nums w-12 text-center bg-white/10 border-2 border-white/20 px-1.5 py-1 leading-none">
              {val}
            </span>
            <span className="text-[9px] text-white/40 font-bold mt-1 tracking-widest">{label}</span>
          </div>
          {i < 2 && <span className="text-white/30 font-bold text-2xl -mt-4">:</span>}
        </div>
      ))}
    </div>
  );
}
