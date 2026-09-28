import { useId } from 'react';

// Logo source: https://www.premierleague.com/resources/v1.37.7/i/svg-files/elements/pl-logo-light.svg
export default function SleeveBadge({ badge, ...props }) {
  const backingId = useId().replace(/:/g, '');
  if (badge === 'none') return null;
  return <svg viewBox="0 0 44 66" aria-hidden="true" {...props}>
    <defs><filter id={backingId} x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="expanded" />
      <feMorphology in="expanded" operator="erode" radius="1.7" result="backing" />
      <feFlood floodColor="#fffdf7" result="white" />
      <feComposite in="white" in2="backing" operator="in" result="whiteBacking" />
      <feMerge><feMergeNode in="whiteBacking" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter></defs>
    <svg x="2" y="0" width="40" height="48" viewBox="0 0 40 48">
      <image href="/images/personalization/premier-league.svg" width="116" height="48" filter={`url(#${backingId})`} />
    </svg>
    {badge === 'premier-league-racism' && <g>
      <rect x="0" y="49" width="44" height="16" rx="1" fill="#161616" stroke="#fff" strokeWidth="0.6" />
      <text x="22" y="56" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7">No room</text>
      <text x="22" y="63" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7">for racism</text>
    </g>}
  </svg>;
}
