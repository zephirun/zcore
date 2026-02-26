import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ trigger, children, align = 'right', ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }} className="ui-dropdown">
            <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        [align]: 0,
                        marginTop: 'var(--space-2)',
                        minWidth: '200px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        overflow: 'hidden',
                        animation: 'fadeInUp var(--motion-base) var(--ease-decelerate) forwards',
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export const DropdownItem = ({ children, onClick, danger = false, ...props }) => {
    return (
        <div
            onClick={onClick}
            style={{
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-sm)',
                color: danger ? 'var(--color-error)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'background var(--motion-fast) var(--ease-standard), color var(--motion-fast) var(--ease-standard)',
                ...(props.style || {})
            }}
            onMouseEnter={e => e.currentTarget.style.background = danger ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {children}
        </div>
    );
};

export default Dropdown;
