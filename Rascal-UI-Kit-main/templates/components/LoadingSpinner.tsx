import React from 'react';

interface LoadingSpinnerProps {
  /** App name shown in the headline, e.g. "EPR", "OKR Tracker", "Samara Booking". */
  appName?: string;
  /** Status sub-line. Defaults to "Please wait while we authenticate…". */
  message?: string;
  /** Logo URL or imported SVG path. Drop the brand SVG you want (Rascal Republic / Rinjani Bay / Samara Lombok). */
  logoSrc: string;
  /** Optional alt text override for the logo. */
  logoAlt?: string;
  /**
   * Ring active-arc class. Defaults to Rascal corporate blue.
   * Rinjani Bay → "border-t-[#0E8A8A]" (turquoise)
   * Samara Lombok → "border-t-[#D4A648]" (sunset gold)
   * See docs/BRAND_COLORS.md.
   */
  ringActive?: string;
  /** Ring track (dimmer outline). Defaults to Rascal corporate light-blue. */
  ringTrack?: string;
  /**
   * Tailwind className for the full-screen gradient background.
   * Default = Rascal corporate `bg-gradient-to-br from-blue-50 via-white to-purple-50`.
   * Villa brands pass their own warm-cream gradient — see brand-bound variants.
   */
  bgClassName?: string;
}

/**
 * LoadingSpinner — full-screen branded loading state.
 *
 * Two-layer composition: brand logo (pulsing) sits at center, a ring
 * orbits around it (spinning). The combo reads as "we're working" while
 * keeping the brand present — far less generic than a lone spinner.
 *
 * This is the canonical visual DNA. Live reference:
 *   https://okr.rascalrepublic.com (boot screen)
 * Static SVG preview: ../../assets/animations/canonical-loading-preview.svg
 *
 * If you only need to pick a brand and render — use the pre-bound variants
 * (RascalLoadingSpinner / RinjaniLoadingSpinner / SamaraLoadingSpinner)
 * instead so you don't have to wire ring colors or import the logo yourself.
 *
 * The ring color carries brand identity — Rascal blue (corporate), Rinjani
 * turquoise (boutique villa), Samara sunset-gold (boutique villa).
 * See docs/BRAND_COLORS.md for the rationale.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  appName = 'Rascal',
  message = 'Please wait while we authenticate…',
  logoSrc,
  logoAlt = 'Logo',
  ringActive = 'border-t-blue-600',
  ringTrack = 'border-blue-200',
  bgClassName = 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50',
}) => {
  return (
    <div className={`${bgClassName} flex items-center justify-center`}>
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 flex items-center justify-center mx-auto">
            <img src={logoSrc} alt={logoAlt} className="w-full h-full object-contain animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 border-4 ${ringTrack} ${ringActive} rounded-full animate-spin`}></div>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Loading {appName}</h2>
          <p className="text-sm text-stone-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
