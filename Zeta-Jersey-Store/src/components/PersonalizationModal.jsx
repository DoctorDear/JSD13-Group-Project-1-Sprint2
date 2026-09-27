import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { preparePersonalization } from '../lib/personalization.js';
import { getAvailableSleeveBadges, getBackPreviewImage, getPreferredSleeveBadge, isPersonalizationEligible, normalizePersonalizationName } from '../lib/personalizationPreview.js';
import JerseyPersonalizationPreview from './JerseyPersonalizationPreview.jsx';
import SleeveBadge from './SleeveBadge.jsx';
import { getSleeveBadge } from '../lib/sleeveBadges.js';

const sizesLabel = (size) => ({ XS: 'Extra Small', S: 'Small', M: 'Medium', L: 'Large', XL: 'Extra Large', '2XL': '2X Large' })[size] || size;

export default function PersonalizationModal({ product, initialSize, adding, onClose, onAdd }) {
  const [size, setSize] = useState(initialSize);
  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [sleeveBadge, setSleeveBadge] = useState(() => getPreferredSleeveBadge(product.personalizationTemplate?.sleeveBadgeOptions));
  const [zoomSleeve, setZoomSleeve] = useState(false);
  const closeButton = useRef(null);
  const dialog = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled)')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const template = product.personalizationTemplate;
  const preview = preparePersonalization({ enabled, name, number, sleeveBadge, productPrice: product.price });
  const eligible = isPersonalizationEligible(product);
  const backImage = getBackPreviewImage(product);
  const image = backImage || product.images?.[0];
  const badge = getSleeveBadge(sleeveBadge);
  const totalPrice = preview.price;
  const availableBadges = getAvailableSleeveBadges(template?.sleeveBadgeOptions);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!size) {
      setError('Please select a size.');
      return;
    }
    if (enabled && (!name || !number)) {
      setError('Enter both a name and a number, or choose No print.');
      return;
    }
    if (preview.error) {
      setError(preview.error);
      return;
    }
    setError('');
    await onAdd({ size, customName: preview.customName, customNumber: preview.customNumber, sleeveBadge });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-0 sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="personalization-title" className="relative flex flex-col h-full w-full max-w-6xl overflow-y-auto bg-white shadow-2xl sm:max-h-[min(92vh,900px)] sm:rounded-2xl lg:grid lg:h-[min(92vh,900px)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Close jersey personalization" className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-zeta-main shadow-sm hover:bg-slate-100"><X size={20} /></button>

        <form id="personalization-form" onSubmit={handleSubmit} className="shrink-0 px-5 pb-8 pt-8 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zeta-muted">Personalize your jersey</p>
          <h2 id="personalization-title" className="mt-2 pr-10 text-3xl font-bold leading-tight text-zeta-main">Customize your jersey</h2>
          <p className="mt-2 text-sm text-zeta-muted">{product.name}</p>

          <div className="mt-8">
            <label htmlFor="personalization-size" className="block border-b border-slate-200 pb-2 text-base font-semibold text-zeta-main">Size</label>
            <select id="personalization-size" value={size} onChange={(event) => { setSize(event.target.value); setError(''); }} className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-zeta-main focus:border-zeta-main focus:outline-none focus:ring-2 focus:ring-zeta-main/15">
              <option value="">Select a size</option>
              {product.sizes?.map((item) => <option key={item} value={item}>{item} ({sizesLabel(item)})</option>)}
            </select>
          </div>

          <fieldset className="mt-8">
            <legend className="w-full border-b border-slate-200 pb-2 text-base font-semibold text-zeta-main">Name and number printing</legend>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[false, true].map((value) => <button key={String(value)} type="button" onClick={() => { setEnabled(value); setError(''); }} aria-pressed={enabled === value} className={`min-h-12 rounded-lg border px-4 py-2 text-sm font-semibold transition ${enabled === value ? 'border-zeta-main bg-zeta-main text-white' : 'border-slate-300 text-zeta-main hover:border-zeta-main'}`}>{value ? 'Print' : 'No print'}</button>)}
            </div>
          </fieldset>

          {enabled && <div className="mt-8 grid gap-5 sm:grid-cols-[minmax(0,1fr)_120px]">
            <div>
              <label htmlFor="printed-name" className="block border-b border-slate-200 pb-2 font-semibold text-zeta-main">Name on shirt</label>
              <input id="printed-name" value={name} onChange={(event) => { setName(normalizePersonalizationName(event.target.value)); setError(''); }} maxLength={20} autoComplete="off" placeholder="YOUR NAME" className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-3 uppercase text-zeta-main focus:border-zeta-main focus:outline-none focus:ring-2 focus:ring-zeta-main/15" />
            </div>
            <div>
              <label htmlFor="printed-number" className="block border-b border-slate-200 pb-2 font-semibold text-zeta-main">Number</label>
              <input id="printed-number" value={number} onChange={(event) => { setNumber(event.target.value); setError(''); }} inputMode="numeric" maxLength={2} autoComplete="off" placeholder="10" className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-zeta-main focus:border-zeta-main focus:outline-none focus:ring-2 focus:ring-zeta-main/15" />
            </div>
          </div>}

          <p className="mt-3 text-xs leading-5 text-zeta-muted">Up to 20 English letters and a number from 0–99</p>
          {availableBadges.length > 0 && <fieldset className="mt-7">
            <legend className="w-full border-b border-slate-200 pb-2 font-semibold text-zeta-main">Sleeve badge</legend>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {availableBadges.map((option) => <button key={option.id} type="button" aria-pressed={sleeveBadge === option.id} onClick={() => setSleeveBadge(option.id)} className={`flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 px-2 py-3 text-center text-xs ${sleeveBadge === option.id ? 'border-zeta-main bg-violet-50 text-zeta-main' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}>
                {option.id === 'none' ? <span aria-hidden="true" className="flex h-14 items-center text-4xl">⊘</span> : <SleeveBadge badge={option.id} className="h-14 w-12" />}
                <span className="font-semibold">{option.label}</span>
                <span>{option.price ? `+฿${option.price.toLocaleString()}` : 'Included'}</span>
              </button>)}
            </div>
          </fieldset>}
          {error && <p role="alert" className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-5 space-y-2 text-sm text-zeta-muted" aria-label="Personalization price details">
            <div className="flex justify-between gap-4"><span>Jersey</span><span>฿{Number(product.price ?? 0).toLocaleString()}</span></div>
            <div className="flex justify-between gap-4"><span>Name printing</span><span>฿{preview.namePrice.toLocaleString()}</span></div>
            <div className="flex justify-between gap-4"><span>Number printing</span><span>฿{preview.numberPrice.toLocaleString()}</span></div>
            <div className="flex justify-between gap-4"><span>{badge.label} sleeve badge</span><span>{badge.price ? `+฿${badge.price.toLocaleString()}` : 'Included'}</span></div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
            <span className="font-semibold text-zeta-main">Total per shirt</span>
            <span className="text-xl font-bold text-zeta-main" aria-live="polite">฿{totalPrice.toLocaleString()}</span>
          </div>
          <button type="submit" disabled={adding} className="mt-5 min-h-12 w-full rounded-lg bg-zeta-main px-6 font-semibold text-white transition hover:bg-zeta-main/90 disabled:opacity-60">{adding ? 'Adding...' : 'Add to cart'}</button>
        </form>

        <div className="flex shrink-0 flex-col bg-[#f8f8fc] px-5 pb-6 pt-16 sm:px-8 lg:min-h-0 lg:px-10 lg:py-10">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-zeta-muted">Live preview</p><p className="mt-1 text-sm text-zeta-muted">{backImage ? 'Preview on the back of the shirt' : 'Product image and print preview'}</p></div>
            <span className="whitespace-nowrap text-xl font-semibold text-zeta-main">฿{totalPrice.toLocaleString()}</span>
          </div>
          {eligible && <div className="mt-4 flex gap-2" aria-label="Preview view">
            {[false, true].map((zoom) => <button key={String(zoom)} type="button" aria-pressed={zoomSleeve === zoom} onClick={() => setZoomSleeve(zoom)} className={`rounded-full border px-4 py-2 text-xs font-semibold ${zoomSleeve === zoom ? 'border-zeta-main bg-zeta-main text-white' : 'border-slate-300 bg-white text-zeta-main'}`}>{zoom ? 'Sleeve close-up' : 'Full shirt'}</button>)}
          </div>}
          <div className="mt-5 flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-white p-4 lg:min-h-[480px]">
            {eligible ? <JerseyPersonalizationPreview template={template} printEnabled={enabled} name={preview.customName} number={number} sleeveBadge={sleeveBadge} sleeveZoom={zoomSleeve} /> : image ? <img src={image} alt={product.name} className="max-h-[440px] max-w-full object-contain" /> : <span className="text-sm text-zeta-muted">No product image</span>}
          </div>
          <p className="mt-3 text-center text-xs text-zeta-muted">Preview only. Placement and colors may vary by shirt model.</p>
        </div>
      </div>
    </div>
  );
}
