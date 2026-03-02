import React, { forwardRef } from 'react';
import FormField from './FormField';

const Input = forwardRef(({
    label,
    error,
    hint,
    success,
    required,
    fullWidth = true,
    className = '',
    containerStyle = {},
    hasError = false,
    isSuccess = false,
    ...props
}, ref) => {
    const isInvalid = !!error || hasError;
    const isValid = !!success || isSuccess;

    // Determine border color: error trumps success
    const borderColor = isInvalid ? 'var(--color-error)' : (isValid ? 'var(--color-success)' : 'var(--border-input)');

    const inputElement = (
        <input
            ref={ref}
            className={`ui-input ${className}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                height: 'var(--density-input-height)',
                padding: '0 var(--density-padding-md)',
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-base)',
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

    if (label || error || hint || success) {
        return (
            <FormField label={label} error={error} hint={hint} success={success} required={required} style={containerStyle}>
                {inputElement}
            </FormField>
        );
    }

    return inputElement;
});

Input.displayName = 'Input';

export default Input;
