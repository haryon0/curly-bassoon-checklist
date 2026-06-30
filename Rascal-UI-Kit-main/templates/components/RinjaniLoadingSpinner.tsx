import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import logoUrl from '../../assets/logo/rinjanibay/rinjanibay-navy.svg';

interface Props {
  /** App name shown in the headline, e.g. "Rinjani Concierge", "Rinjani Booking". */
  appName: string;
  /** Status sub-line. Defaults to "Please wait while we authenticate…". */
  message?: string;
}

/**
 * RinjaniLoadingSpinner — pre-bound for Rinjani Bay boutique villa apps.
 *
 * - Logo: `rinjanibay-navy.svg`
 * - Ring: turquoise (Rinjani signature accent #0E8A8A on #9FD4D4 track)
 * - Background: warm-cream + soft turquoise gradient — boutique villa,
 *   NOT the corporate cool blue.
 *
 * Brand DNA: https://rinjanibay.com — "Where Nature Meets Nurture · Magical, soulful and wild."
 *
 * Use for any Rinjani Bay surface — guest booking, concierge dashboard,
 * internal Rinjani ops, magic-link forms for Rinjani staff.
 */
const RinjaniLoadingSpinner: React.FC<Props> = ({ appName, message }) => (
  <LoadingSpinner
    appName={appName}
    message={message}
    logoSrc={logoUrl}
    logoAlt="Rinjani Bay"
    ringTrack="border-[#9FD4D4]"
    ringActive="border-t-[#0E8A8A]"
    bgClassName="min-h-screen bg-gradient-to-br from-[#E8F4F4] via-[#FAF7F2] to-[#E8DCC4]/40"
  />
);

export default RinjaniLoadingSpinner;
