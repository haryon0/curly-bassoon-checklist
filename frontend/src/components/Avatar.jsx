import React from 'react';

/**
 * Avatar — Displays user profile picture with initials fallback
 * @param {string} name - User's full name (for initials fallback)
 * @param {string} src - Optional image URL
 * @param {string} size - One of: 'sm' (8), 'md' (10), 'lg' (12) in width rem
 */
export default function Avatar({ name = 'User', src, size = 'md' }) {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-samara-primary flex items-center justify-center text-white font-semibold`}
      title={name}
    >
      {initials}
    </div>
  );
}
