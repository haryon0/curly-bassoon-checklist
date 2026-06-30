import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import logoUrl from '../../assets/logo/rascalrepublic/rascalrepublic-navy.svg';

interface Props {
  /** App name shown in the headline, e.g. "OKR Tracker", "EPR", "Leadership Portal". */
  appName: string;
  /** Status sub-line. Defaults to "Please wait while we authenticate…". */
  message?: string;
}

/**
 * RascalLoadingSpinner — pre-bound for Rascal Republic corporate apps.
 *
 * - Logo: `rascalrepublic-navy.svg`
 * - Ring: blue (corporate accent) — `border-blue-200` track, `border-t-blue-600` active arc
 * - Background: cool blue-to-purple gradient (`from-blue-50 via-white to-purple-50`)
 *
 * Visual DNA: https://okr.rascalrepublic.com (the canonical reference).
 *
 * Use for OKR Tracker, EPR, Leadership Portal, Account Portal, and every
 * internal Rascal Republic group ops tool.
 */
const RascalLoadingSpinner: React.FC<Props> = ({ appName, message }) => (
  <LoadingSpinner
    appName={appName}
    message={message}
    logoSrc={logoUrl}
    logoAlt="Rascal Republic"
    ringTrack="border-blue-200"
    ringActive="border-t-blue-600"
    bgClassName="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
  />
);

export default RascalLoadingSpinner;
