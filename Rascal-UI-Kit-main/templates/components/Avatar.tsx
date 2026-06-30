import React from 'react';

interface AvatarProps {
  name: string;
  /** Default w-9 h-9. Set custom size via Tailwind classes. */
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, className }) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('');
  return (
    <div
      className={`shrink-0 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[11px] font-semibold text-stone-600 ${
        className ?? 'w-9 h-9'
      }`}
      aria-hidden="true"
    >
      {initials || '·'}
    </div>
  );
};

export default Avatar;
