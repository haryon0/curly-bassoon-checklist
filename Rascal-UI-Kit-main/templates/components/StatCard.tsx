import React from 'react';

type Tone = 'neutral' | 'ok' | 'warn' | 'risk' | 'info';

const TONE: Record<Tone, { value: string; bg: string; border: string }> = {
  neutral: { value: 'text-stone-900',   bg: 'bg-white',       border: 'border-stone-200' },
  ok:      { value: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  warn:    { value: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200' },
  risk:    { value: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200' },
  info:    { value: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200' },
};

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  tone?: Tone;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, tone = 'neutral', icon }) => {
  const t = TONE[tone];
  return (
    <div className={`${t.bg} border ${t.border} rounded-xl p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
        {icon && <div className="text-stone-400">{icon}</div>}
      </div>
      <div className={`text-3xl font-semibold tabular-nums mt-1 ${t.value}`}>{value}</div>
      {sub && <div className="text-[11px] text-stone-500 mt-0.5">{sub}</div>}
    </div>
  );
};

export default StatCard;
