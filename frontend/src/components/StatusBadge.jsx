import React from 'react';

/**
 * StatusBadge — Displays checklist status with semantic coloring
 * @param {string} status - One of: 'completed', 'processing', 'failed', 'draft'
 * @param {string} label - Display text (defaults to capitalized status)
 */
export default function StatusBadge({ status, label }) {
  const statusMap = {
    completed: {
      className: 'badge-completed',
      defaultLabel: 'Completed',
    },
    processing: {
      className: 'badge-processing',
      defaultLabel: 'Processing',
    },
    failed: {
      className: 'badge-failed',
      defaultLabel: 'Failed',
    },
    draft: {
      className: 'badge-draft',
      defaultLabel: 'Draft',
    },
  };

  const config = statusMap[status] || statusMap.draft;

  return (
    <span className={config.className}>
      {label || config.defaultLabel}
    </span>
  );
}
