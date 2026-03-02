import React, { forwardRef } from 'react';
import FormField from './FormField';

const Textarea = forwardRef(({
    label,
    error,
    hint,
    success,
    required,
    fullWidth = true,
    className = '',
    containerStyle = {},
    rows = 4,
    hasError = false,
    isSuccess = false,
    ...props
}, ref) => {
    const isInvalid = !!error || hasError;
    const isValid = !!success || isSuccess;

    // Determine border color: error trumps success
    const borderColor = isInvalid ? 'var(--color-error)' : (isValid ? 'var(--color-success)' : 'var(--border-input)');

    const textareaElement = (
        <textarea
            ref={ref}
            rows={rows}
            className={`ui-textarea ${className}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                padding: '11px 14px',
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'var(--font-main)',
                letterSpacing: '-0.01em',
                boxSizing: 'border-box',
                resize: 'vertical',
                transition: 'border-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard), background-color var(--motion-fast) var(--ease-standard)',
                ...(props.style || {})
            }}
            {...props}
        />
    );

    if (label || error || hint || success) {
        return (
            <FormField label={label} error={error} hint={hint} success={success} required={required} style={containerStyle}>
                {textareaElement}
            </FormField>
        );
    }

    return textareaElement;
});

Textarea.displayName = 'Textarea';

export default Textarea;
