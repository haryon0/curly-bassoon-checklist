import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import logoUrl from '../../assets/logo/samaralombok/samaralombok-navy.svg';

interface Props {
  /** App name shown in the headline, e.g. "Samara Booking", "Samara Concierge". */
  appName: string;
  /** Status sub-line. Defaults to "Please wait while we authenticate…". */
  message?: string;
}

/**
 * SamaraLoadingSpinner — pre-bound for Samara Lombok boutique villa apps.
 *
 * - Logo: `samaralombok-navy.svg`
 * - Ring: sunset gold (Samara signature accent #D4A648 on #EBD9A8 track)
 * - Background: cream + sunset-gold + sky gradient — captures the
 *   "golden hour over Lombok ocean" mood of the property.
 *
 * Brand DNA: https://samaralombok.com — "An Elevated Hospitality Experience in South Lombok."
 *
 * Use for any Samara Lombok surface — guest booking, villa concierge,
 * internal Samara ops.
 */
const SamaraLoadingSpinner: React.FC<Props> = ({ appName, message }) => (
  <LoadingSpinner
    appName={appName}
    message={message}
    logoSrc={logoUrl}
    logoAlt="Samara Lombok"
    ringTrack="border-[#EBD9A8]"
    ringActive="border-t-[#D4A648]"
    bgClassName="min-h-screen bg-gradient-to-br from-[#F8EFD9] via-[#FCFAF5] to-[#CFD4DB]/30"
  />
);

export default SamaraLoadingSpinner;
