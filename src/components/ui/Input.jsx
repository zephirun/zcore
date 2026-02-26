import React, { forwardRef } from 'react';
import FormField from './FormField';

const Input = forwardRef(({
    label,
    error,
    hint,
    required,
    fullWidth = true,
    className = '',
    containerStyle = {},
    hasError = false,
    ...props
}, ref) => {
    const isInvalid = !!error || hasError;

    const inputElement = (
        <input
            ref={ref}
            className={`ui-input ${className}`}
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
                transition: 'border-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard), background-color var(--motion-fast) var(--ease-standard)',
                ...(props.style || {})
            }}
            {...props}
        />
    );

    if (label || error || hint) {
        return (
            <FormField label={label} error={error} hint={hint} required={required} style={containerStyle}>
                {inputElement}
            </FormField>
        );
    }

    return inputElement;
});

Input.displayName = 'Input';

export default Input;
