import React, { forwardRef } from 'react';
import FormField from './FormField';

const Select = forwardRef(({
    label,
    error,
    hint,
    required,
    options = [],
    fullWidth = true,
    className = '',
    containerStyle = {},
    hasError = false,
    ...props
}, ref) => {
    const isInvalid = !!error || hasError;

    const selectElement = (
        <select
            ref={ref}
            className={`ui-select ${className}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                height: 'var(--density-input-height)',
                padding: '0 var(--density-padding-md)',
                border: `1px solid ${isInvalid ? 'var(--color-error)' : 'var(--border-input)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'var(--font-main)',
                boxSizing: 'border-box',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                backgroundSize: '16px',
                paddingRight: '40px',
                transition: 'border-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard), background-color var(--motion-fast) var(--ease-standard)',
                ...(props.style || {})
            }}
            {...props}
        >
            {props.children || options.map((opt, idx) => (
                <option key={opt.value || idx} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );

    if (label || error || hint) {
        return (
            <FormField label={label} error={error} hint={hint} required={required} style={containerStyle}>
                {selectElement}
            </FormField>
        );
    }

    return selectElement;
});

Select.displayName = 'Select';

export default Select;
