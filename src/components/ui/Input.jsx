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
    leftIcon = null,
    rightIcon = null,
    ...props
}, ref) => {
    const isInvalid = !!error || hasError;

    const inputElement = leftIcon || rightIcon ? (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {leftIcon && (
                <span style={{
                    position: 'absolute',
                    left: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 1
                }}>
                    {leftIcon}
                </span>
            )}
            <input
                ref={ref}
                className={`ui-input ${className}`}
                style={{
                    width: fullWidth ? '100%' : 'auto',
                    height: 'var(--density-input-height)',
                    paddingLeft: leftIcon ? '38px' : 'var(--density-padding-md)',
                    paddingRight: rightIcon ? '38px' : 'var(--density-padding-md)',
                    border: `1px solid ${isInvalid ? 'var(--color-error)' : 'var(--border-input)'}`,
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-sm)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontFamily: 'var(--font-main)',
                    boxSizing: 'border-box',
                    transition: 'border-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)',
                    ...(props.style || {})
                }}
                {...props}
            />
            {rightIcon && (
                <span style={{
                    position: 'absolute',
                    right: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                }}>
                    {rightIcon}
                </span>
            )}
        </div>
    ) : (
        <input
            ref={ref}
            className={`ui-input ${className}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                height: 'var(--density-input-height)',
                padding: '0 var(--density-padding-md)',
                border: `1px solid ${isInvalid ? 'var(--color-error)' : 'var(--border-input)'}`,
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'var(--font-main)',
                boxSizing: 'border-box',
                transition: 'border-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)',
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
