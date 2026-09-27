import { useId } from 'react';
import { getPersonalizationTextAttributes } from '../lib/personalizationPreview.js';
import SleeveBadge from './SleeveBadge.jsx';

export default function JerseyPersonalizationPreview({ template, printEnabled, name, number, sleeveBadge = 'none', sleeveZoom = false }) {
  const id = useId().replace(/:/g, '');
  const badgeGeometry = template.sleeveBadge;
  const viewBox = sleeveZoom ? badgeGeometry.zoomViewBox : template.viewBox;
  const printName = name || 'YOUR NAME';
  const printNumber = number || '00';

  return (
    <svg viewBox={viewBox.join(' ')} className="h-auto max-h-[520px] w-full max-w-[min(100%,650px)]" role="img" aria-label={`Jersey back${printEnabled ? `, ${printName} ${printNumber}` : ''}${sleeveBadge !== 'none' ? ', sleeve badge' : ''}`}>
      <defs>
        <clipPath id={`${id}-sleeve-edge`} clipPathUnits="userSpaceOnUse">
          <path d={badgeGeometry.clipPath} />
        </clipPath>
        <filter id={`${id}-fabric-print`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" seed="8" result="fabric" />
          <feColorMatrix in="fabric" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.2 0 0 0 0.78" result="ink-grain" />
          <feComposite in="SourceGraphic" in2="ink-grain" operator="in" result="printed-ink" />
          <feDisplacementMap in="printed-ink" in2="fabric" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <image href={template.backImageUrl} x={template.viewBox[0]} y={template.viewBox[1]} width={template.viewBox[2]} height={template.viewBox[3]} />
      {sleeveBadge !== 'none' && <g clipPath={`url(#${id}-sleeve-edge)`}>
        <g transform={`translate(${badgeGeometry.x} ${badgeGeometry.y}) rotate(${badgeGeometry.rotate}) skewY(${badgeGeometry.skewY}) scale(${badgeGeometry.scaleX} ${badgeGeometry.scaleY})`}>
          <SleeveBadge badge={sleeveBadge} width="64" height="96" />
        </g>
      </g>}
      {printEnabled && <g filter={`url(#${id}-fabric-print)`}>
        <text {...getPersonalizationTextAttributes(template.name)}>{printName}</text>
        <text {...getPersonalizationTextAttributes(template.number)}>{printNumber}</text>
      </g>}
    </svg>
  );
}
