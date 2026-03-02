import Input from '@/components/ui/Input';
import React, { useState, useRef, useEffect } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder = "Selecione..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm(''); // Reset search on close
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Filter options based on search term
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', minWidth: '220px' }}>
            {/* Toggle Button / Display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '0 14px',
                    height: '40px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    transition: 'all 0.2s ease',
                }}
            >
                <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
                    color: value === 'Selecionar Todos' || !value ? 'var(--text-muted)' : 'var(--text-main)',
                    fontWeight: value && value !== 'Selecionar Todos' ? '600' : '400'
                }}>
                    {value || placeholder}
                </span>
                <span style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    marginLeft: '8px',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                }}>▼</span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    {/* Search Input */}
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-card)' }}>
                        <Input
                            type="text"
                            autoFocus
                            placeholder="Digite para buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                outline: 'none',
                                background: 'var(--bg-input)',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>

                    {/* Options List */}
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt}
                                    onClick={() => handleSelect(opt)}
                                    style={{
                                        padding: '10px 14px',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--border-color)',
                                        background: value === opt ? 'var(--color-info-light, #ecf5fe)' : 'transparent',
                                        color: value === opt ? 'var(--color-info-strong, #005a9e)' : 'var(--text-main)',
                                        fontWeight: value === opt ? '600' : '400',
                                        transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (value !== opt) e.target.style.background = 'var(--bg-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (value !== opt) e.target.style.background = 'transparent';
                                    }}
                                >
                                    {opt}
                                </li>
                            ))
                        ) : (
                            <li style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                Nenhum resultado encontrado
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
