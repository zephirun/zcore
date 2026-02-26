import React from 'react';
import { useData } from '../../context/DataContext';

const ThemeSwitcher = ({ style }) => {
    const { theme, toggleTheme } = useData();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="ui-theme-switcher"
            aria-label="Toggle Dark Mode"
            style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid transparent',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'background var(--motion-fast) var(--ease-standard), border-color var(--motion-fast) var(--ease-standard)',
                ...style
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
            }}
        >
            <div style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                transition: 'transform var(--motion-base) var(--ease-decelerate), opacity var(--motion-base) var(--ease-decelerate)',
                transform: isDark ? 'translateY(0)' : 'translateY(-100%)',
                opacity: isDark ? 1 : 0
            }}>
                {/* Moon Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            </div>

            <div style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                transition: 'transform var(--motion-base) var(--ease-decelerate), opacity var(--motion-base) var(--ease-decelerate)',
                transform: isDark ? 'translateY(100%)' : 'translateY(0)',
                opacity: isDark ? 0 : 1
            }}>
                {/* Sun Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            </div>
        </button>
    );
};

export default ThemeSwitcher;
