'use client';
import * as React from 'react';
import { Select } from '@base-ui/react/select';
import { cn } from '../lib/utils';
import { useThaiAddressIndex } from '../hooks/use-thai-address-index';
import { DEFAULT_CASCADE_TEXTS, optionName, useThaiAddressCascade, } from '../hooks/use-thai-address-cascade';
export function ThaiAddressCascadeSelect({ locale = 'th', texts, disabled = false, className, labelClassName, triggerClassName, onError, ref, ...rest }) {
    const resolvedTexts = React.useMemo(() => ({ ...DEFAULT_CASCADE_TEXTS[locale], ...texts }), [locale, texts]);
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
    // Same rationale as thai-address-autocomplete.tsx: mount the index-consuming
    // subtree only once `index` is final and stable.
    if (!index) {
        return (<div aria-busy="true" className={cn('grid w-full grid-cols-1 gap-4 sm:grid-cols-2', className)}>
        {[resolvedTexts.provinceLabel, resolvedTexts.districtLabel, resolvedTexts.subdistrictLabel, resolvedTexts.zipLabel].map((label) => (<div key={label} className="flex flex-col gap-1.5">
              <span className={cn('text-sm font-medium text-foreground', labelClassName)}>{label}</span>
              <button type="button" disabled className={cn('flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm text-muted-foreground shadow-sm outline-none disabled:cursor-not-allowed disabled:opacity-50', triggerClassName)}>
                {resolvedTexts.loadingText}
              </button>
            </div>))}
      </div>);
    }
    return (<ThaiAddressCascadeSelectReady {...rest} index={index} locale={locale} texts={resolvedTexts} disabled={disabled} className={className} labelClassName={labelClassName} triggerClassName={triggerClassName} ref={ref}/>);
}
function ThaiAddressCascadeSelectReady({ index, value, defaultValue, onValueChange, name, locale, texts, disabled = false, required = false, onBlur, 'aria-invalid': ariaInvalid, className, labelClassName, triggerClassName, popupClassName, itemClassName, ref, }) {
    const id = React.useId();
    const { provinces, amphures, tambons, provinceId, amphureId, tambonId, selectedProvince, selectedAmphure, selectedTambon, resolvedAddress, zipCode: zipValue, setProvince: handleProvinceChange, setAmphure: handleAmphureChange, setTambon: handleTambonChange, } = useThaiAddressCascade({ index, value, defaultValue, onValueChange, locale });
    return (<div className={cn('grid w-full grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      <CascadeField labelId={`${id}-province-label`} label={texts.provinceLabel} placeholder={texts.provincePlaceholder} options={provinces} value={provinceId} selected={selectedProvince} onChange={handleProvinceChange} disabled={disabled} required={required} locale={locale} triggerRef={ref} onBlur={onBlur} ariaInvalid={ariaInvalid} labelClassName={labelClassName} triggerClassName={triggerClassName} popupClassName={popupClassName} itemClassName={itemClassName}/>
      <CascadeField labelId={`${id}-district-label`} label={texts.districtLabel} placeholder={texts.districtPlaceholder} options={amphures} value={amphureId} selected={selectedAmphure} onChange={handleAmphureChange} disabled={disabled || provinceId === null} required={required} locale={locale} ariaInvalid={ariaInvalid} labelClassName={labelClassName} triggerClassName={triggerClassName} popupClassName={popupClassName} itemClassName={itemClassName}/>
      <CascadeField labelId={`${id}-subdistrict-label`} label={texts.subdistrictLabel} placeholder={texts.subdistrictPlaceholder} options={tambons} value={tambonId} selected={selectedTambon} onChange={handleTambonChange} disabled={disabled || amphureId === null} required={required} locale={locale} ariaInvalid={ariaInvalid} labelClassName={labelClassName} triggerClassName={triggerClassName} popupClassName={popupClassName} itemClassName={itemClassName}/>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-zip`} className={cn('text-sm font-medium text-foreground', labelClassName)}>
          {texts.zipLabel}
        </label>
        <input id={`${id}-zip`} readOnly tabIndex={-1} value={zipValue} className={cn('flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm text-muted-foreground shadow-sm outline-none', triggerClassName)}/>
      </div>

      {name && (<>
          <input type="hidden" name={`${name}-subdistrict`} value={resolvedAddress?.subdistrict ?? ''} disabled={disabled}/>
          <input type="hidden" name={`${name}-district`} value={resolvedAddress?.district ?? ''} disabled={disabled}/>
          <input type="hidden" name={`${name}-province`} value={resolvedAddress?.province ?? ''} disabled={disabled}/>
          <input type="hidden" name={`${name}-zipcode`} value={resolvedAddress?.zipCode ?? ''} disabled={disabled}/>
        </>)}
    </div>);
}
function CascadeField({ labelId, label, placeholder, options, value, selected, onChange, disabled, required, locale, triggerRef, onBlur, ariaInvalid, labelClassName, triggerClassName, popupClassName, itemClassName, }) {
    return (<div className="flex flex-col gap-1.5">
      <span id={labelId} className={cn('text-sm font-medium text-foreground', labelClassName)}>
        {label}
      </span>
      <Select.Root value={value} onValueChange={(next) => onChange(next)} disabled={disabled} required={required}>
        <Select.Trigger ref={triggerRef} aria-labelledby={labelId} aria-invalid={ariaInvalid} onBlur={onBlur} className={cn('flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', triggerClassName)}>
          <span className={cn('truncate', selected === null && 'text-muted-foreground')}>
            {selected ? optionName(selected, locale) : placeholder}
          </span>
          <Select.Icon className="shrink-0 text-muted-foreground">▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={4} className="z-50 outline-none">
            <Select.Popup className={cn('max-h-64 w-[var(--anchor-width)] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md', popupClassName)}>
              <Select.List>
                {options.map((option) => (<Select.Item key={option.id} value={option.id} label={optionName(option, locale)} className={cn('flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground', itemClassName)}>
                    <Select.ItemText>{optionName(option, locale)}</Select.ItemText>
                  </Select.Item>))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>);
}
