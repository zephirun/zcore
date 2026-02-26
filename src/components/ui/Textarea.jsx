import React, { forwardRef } from 'react';
import FormField from './FormField';

const Textarea = forwardRef(({
    label,
    error,
    hint,
    required,
    fullWidth = true,
    className = '',
    containerStyle = {},
    rows = 4,
    hasError = false,
    ...props
}, ref) => {
    const isInvalid = !!error || hasError;

    const textareaElement = (
        <textarea
            ref={ref}
            rows={rows}
            className={`ui-textarea ${className}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                padding: '11px 14px',
                border: `1px solid ${isInvalid ? 'var(--color-error)' : 'var(--border-input)'}`,
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

    if (label || error || hint) {
        return (
            <FormField label={label} error={error} hint={hint} required={required} style={containerStyle}>
                {textareaElement}
            </FormField>
        );
    }

    return textareaElement;
});

Textarea.displayName = 'Textarea';

export default Textarea;
