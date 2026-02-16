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
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', minWidth: '220px', fontFamily: '"Segoe UI", sans-serif' }}>
            {/* Toggle Button / Display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    background: 'var(--bg-input)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: 'var(--text-main)'
                }}
            >
                <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
                    color: value === 'Todos' ? 'var(--text-muted)' : 'var(--text-main)'
                }}>
                    {value || placeholder}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▼</span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    marginTop: '2px'
                }}>
                    {/* Search Input */}
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-card)' }}>
                        <input
                            type="text"
                            autoFocus
                            placeholder="Digite para buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '3px',
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
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--border-color)',
                                        background: value === opt ? 'var(--color-primary)' : 'var(--bg-card)',
                                        color: value === opt ? 'white' : 'var(--text-main)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-input)'}
                                    onMouseLeave={(e) => e.target.style.background = value === opt ? 'var(--color-primary)' : 'var(--bg-card)'}
                                >
                                    {opt}
                                </li>
                            ))
                        ) : (
                            <li style={{ padding: '10px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
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
