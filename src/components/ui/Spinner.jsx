import React from 'react';

const Spinner = ({
    size = 'md', // 'sm', 'md', 'lg'
    color = 'var(--color-primary)',
    className = '',
    style = {}
}) => {
    const sizeMap = {
        sm: '16px',
        md: '24px',
        lg: '32px'
    };

    const spinnerSize = sizeMap[size] || sizeMap.md;

    return (
        <svg
            className={`ui-spinner ${className}`}
            style={{
                animation: 'spin 1s linear infinite',
                color: color,
                width: spinnerSize,
                height: spinnerSize,
                ...style
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Carregando"
            role="status"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                style={{ opacity: 0.25 }}
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                style={{ opacity: 0.75 }}
            ></path>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </svg>
    );
};

export default Spinner;
