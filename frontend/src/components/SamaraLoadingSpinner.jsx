import React from 'react';

/**
 * SamaraLoadingSpinner — Branded loading indicator with Samara accent
 * Displays spinning ring in sunset gold (#D4A648) on warm cream gradient
 */
export default function SamaraLoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FCFAF5]">
      {/* Gradient background option */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(135deg, #F8EFD9 0%, #FCFAF5 50%, #CFD4DB 100%)',
        }}
      />

      {/* Spinner container */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Spinning ring */}
        <div
          className="w-16 h-16 rounded-full border-4"
          style={{
            borderColor: '#EBD9A8',
            borderTopColor: '#D4A648',
            animation: 'spin 0.8s linear infinite',
          }}
        />

        {/* Message */}
        {message && (
          <p className="text-sm text-stone-600 font-medium">{message}</p>
        )}
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
