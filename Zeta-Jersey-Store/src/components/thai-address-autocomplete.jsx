'use client';
import * as React from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { useThaiAddressAutocomplete } from 'thaizip/react';
import { cn } from '../lib/utils';
import { useThaiAddressIndex } from '../hooks/use-thai-address-index';
const DEFAULT_TEXTS = {
    th: {
        placeholder: 'พิมพ์ตำบล อำเภอ จังหวัด หรือรหัสไปรษณีย์',
        clearAriaLabel: 'ล้างที่อยู่',
        loadingText: 'กำลังโหลดข้อมูล...',
        errorText: 'โหลดข้อมูลที่อยู่ไม่สำเร็จ',
        retryLabel: 'ลองใหม่',
        emptyText: 'ไม่พบที่อยู่',
    },
    en: {
        placeholder: 'Type sub-district, district, province or postal code',
        clearAriaLabel: 'Clear address',
        loadingText: 'Loading address data...',
        errorText: 'Failed to load address data',
        retryLabel: 'Retry',
        emptyText: 'No address found',
    },
};
/**
 * Mirrors thaizip's own `${tambon} > ${amphure} > ${province} ${zipCode}` label shape, for
 * the two spots that only have a `ResolvedThaiAddress` (no originating suggestion item) to
 * work from: the initial text seed and the controlled-`value` re-sync below. Everywhere
 * else — in particular the on-select echo — reads a suggestion's own `.label` field
 * instead of re-deriving text by hand, so this formula exists in exactly one place.
 */
function addressLabel(address, locale) {
    return locale === 'en'
        ? `${address.subdistrictEn} > ${address.districtEn} > ${address.provinceEn} ${address.zipCode}`
        : `${address.subdistrict} > ${address.district} > ${address.province} ${address.zipCode}`;
}
export function ThaiAddressAutocomplete({ locale = 'th', texts, disabled = false, className, inputClassName, onError, ref, ...rest }) {
    const resolvedTexts = React.useMemo(() => ({ ...DEFAULT_TEXTS[locale], ...texts }), [locale, texts]);
    const { index, error, retry } = useThaiAddressIndex();
    React.useEffect(() => {
        if (error)
            onError?.(error);
    }, [error, onError]);
    if (error) {
        return (<div role="alert" className={cn('flex flex-col items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive', className)}>
        <p>{resolvedTexts.errorText}</p>
        <button type="button" onClick={retry} className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
          {resolvedTexts.retryLabel}
        </button>
      </div>);
    }
    // Deliberately NOT rendered by feeding `useThaiAddressAutocomplete` a placeholder index
    // while loading: thaizip's hook treats any `index` reference change (even swapping a
    // placeholder for the real thing) as "re-search the pending query", which would fire a
    // spurious search the moment loading finishes. Mounting the search-hook-consuming
    // subtree only once `index` is final and stable avoids that entirely.
    if (!index) {
        return (<div className={cn('relative w-full', className)}>
        <input ref={ref} disabled readOnly aria-busy="true" placeholder={resolvedTexts.loadingText} value="" className={cn('flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', inputClassName)}/>
      </div>);
    }
    return (<ThaiAddressAutocompleteReady {...rest} index={index} locale={locale} texts={resolvedTexts} disabled={disabled} className={className} inputClassName={inputClassName} ref={ref}/>);
}
function ThaiAddressAutocompleteReady({ index, value, defaultValue, onValueChange, name, id, locale, texts, limit, debounce, threshold, disabled = false, required = false, onBlur, 'aria-invalid': ariaInvalid, className, inputClassName, popupClassName, itemClassName, ref, }) {
    const isControlled = value !== undefined;
    // Uncontrolled bookkeeping only — stays `null` (unused) in controlled mode, where
    // `resolvedAddress` below is derived straight from `value` instead.
    const [internalResolved, setInternalResolved] = React.useState(() => isControlled ? null : (defaultValue ?? null));
    const resolvedAddress = isControlled ? (value ?? null) : internalResolved;
    // Seed the input text once from whichever value is present on first render.
    const [initialQuery] = React.useState(() => {
        const seed = isControlled ? (value ?? null) : (defaultValue ?? null);
        return seed ? addressLabel(seed, locale) : '';
    });
    const { query, setQuery, setQuerySilent, suggestions, selectSuggestion, clear } = useThaiAddressAutocomplete({
        index,
        limit,
        debounce,
        threshold,
        locale,
        initialQuery,
    });
    // Controlled mode: re-sync the visible text whenever the caller changes `value`
    // (including -> null).
    React.useEffect(() => {
        if (!isControlled)
            return;
        setQuerySilent(value ? addressLabel(value, locale) : '');
    }, [isControlled, value, locale, setQuerySilent]);
    function commitSelection(item) {
        const result = selectSuggestion(item);
        if (!result)
            return;
        setQuerySilent(item.label);
        if (!isControlled)
            setInternalResolved(result);
        onValueChange?.(result);
    }
    // `inputValue`/`onInputValueChange` below make Root's input text fully controlled by
    // `query`, but Root ALSO fires this same callback for its own internal bookkeeping —
    // most importantly, `AriaCombobox`'s `handleUnmount` force-resyncs the input to
    // Root's own (uncontrolled, easily stale — it never learns about a clear performed
    // through our own clear button, or a `defaultValue` seed it never selected) internal
    // "selected value" on every popup close, and a "did the current items list still
    // contain my selection" layout effect can do the same the moment `suggestions` is
    // cleared after a pick. Both — along with the item-press echo below — are Base UI's own
    // synthetic writes, never a real user edit, and are reliably distinguishable: genuine
    // typing is the ONLY path that reports `reason === 'input-change'` (see
    // ComboboxInput.js). Every other reason is ignored outright: since `query` (and
    // therefore the rendered `inputValue`) is left untouched, the next render simply
    // re-asserts our own text and the synthetic write never becomes visible.
    function handleInputValueChange(nextValue, reason) {
        if (reason !== 'input-change')
            return;
        setQuery(nextValue);
        if (nextValue === '' && resolvedAddress !== null) {
            if (!isControlled)
                setInternalResolved(null);
            onValueChange?.(null);
        }
    }
    function handleComboboxValueChange(item) {
        // Root's own value-change can in principle report `null` on some close paths — a
        // mere close must NOT clear the resolved selection, so only a real press is handled.
        if (item)
            commitSelection(item);
    }
    function handleClear() {
        clear();
        if (!isControlled)
            setInternalResolved(null);
        onValueChange?.(null);
    }
    return (<div className={cn('relative w-full', className)}>
      <Combobox.Root items={suggestions} filter={null} inputValue={query} onInputValueChange={(nextValue, eventDetails) => handleInputValueChange(nextValue, eventDetails.reason)} onValueChange={handleComboboxValueChange} disabled={disabled}>
        <div className="relative">
          <Combobox.Input id={id} ref={ref} required={required} disabled={disabled} aria-invalid={ariaInvalid} onBlur={onBlur} placeholder={texts.placeholder} className={cn('flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', inputClassName)}/>

          {query.length > 0 && !disabled && (
        // A plain button, not `Combobox.Clear`: that part's built-in visibility tracks
        // Base UI's own internal selected-value state, not "input has text" — the
        // wrong semantics here since the clear affordance must stay visible while any
        // text remains, confirmed or not.
        <button type="button" tabIndex={-1} onMouseDown={(event) => event.preventDefault()} onClick={handleClear} aria-label={texts.clearAriaLabel} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring">
              ✕
            </button>)}
        </div>

        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4} className="z-50 outline-none">
            <Combobox.Popup className={cn('max-h-64 w-[var(--anchor-width)] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md', popupClassName)}>
              <Combobox.Empty className="px-2 py-4 text-center text-sm text-muted-foreground">
                {texts.emptyText}
              </Combobox.Empty>
              <Combobox.List>
                {(item) => (<Combobox.Item key={item.id} value={item} className={cn('flex cursor-default items-center gap-3 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground', itemClassName)}>
                    <span>{locale === 'en' ? item.labelEn : item.labelTh}</span>
                  </Combobox.Item>)}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      {name && (<>
          <input type="hidden" name={`${name}-subdistrict`} value={resolvedAddress?.subdistrict ?? ''} disabled={disabled}/>
          <input type="hidden" name={`${name}-district`} value={resolvedAddress?.district ?? ''} disabled={disabled}/>
          <input type="hidden" name={`${name}-province`} value={resolvedAddress?.province ?? ''} disabled={disabled}/>
          <input type="hidden" name={`${name}-zipcode`} value={resolvedAddress?.zipCode ?? ''} disabled={disabled}/>
        </>)}
    </div>);
}
