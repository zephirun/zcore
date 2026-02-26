import Input from '@/components/ui/Input';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, allModules as sourceModules } from '../config/menuConfig';

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Flatten all modules for search
    // FIX: Map directly from allModules and lookup category name
    const allModules = sourceModules.map(mod => {
        const cat = categories.find(c => c.id === mod.category);
        return {
            ...mod,
            categoryName: cat ? cat.name : 'Geral',
            type: 'module'
        };
    });

    const filteredItems = query === ''
        ? []
        : allModules.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase())
        );

    // Initial "Quick Actions" when query is empty
    const quickActions = [
        { id: 'dashboard', title: 'Ir para Dashboard', type: 'action', path: '/sales/dashboard', icon: '📊' },
        { id: 'report', title: 'Criar Relatório', type: 'action', path: '/sales/report', icon: '📝' },
        { id: 'delivery', title: 'Nova Entrega', type: 'action', path: '/logistics/delivery-schedule', icon: '🚚' },
    ];

    const results = query === '' ? quickActions : filteredItems;

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    const handleSelect = (item) => {
        if (item.path) {
            navigate(item.path);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(15, 23, 42, 0.4)', // Dark overlay
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingTop: '120px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '600px',
                    maxWidth: '90%',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    overflow: 'hidden',
                    animation: 'fadeSlide 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    borderBottom: '1px solid var(--color-border)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '20px', opacity: 0.4 }}>🔍</span>
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="O que você procura?"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '16px',
                            color: 'var(--color-text-primary)',
                            background: 'transparent'
                        }}
                    />
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--color-text-secondary)',
                        background: 'var(--color-surface)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600'
                    }}>
                        ESC
                    </div>
                </div>

                <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '8px'
                }}>
                    {results.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                            Nenhum resultado encontrado.
                        </div>
                    ) : (
                        results.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: index === selectedIndex ? 'var(--color-surface)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'background 0.1s ease'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: index === selectedIndex ? '#fff' : 'rgba(0,0,0,0.03)',
                                    borderRadius: '6px',
                                    color: 'var(--color-primary)'
                                }}>
                                    {item.icon || '⚡'}
                                </div>
                                <div>
                                    <div style={{
                                        color: index === selectedIndex ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        {item.title}
                                    </div>
                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                                        {item.subtitle || 'Ação Rápida'} {item.categoryName ? `• ${item.categoryName}` : ''}
                                    </div>
                                </div>
                                {index === selectedIndex && (
                                    <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        ↵
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <style>
                {`
                @keyframes fadeSlide {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </div>
    );
};

export default CommandPalette;
