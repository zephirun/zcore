import Select from '@/components/ui/Select';
import React from 'react';

const QuarterSelector = ({ selectedQuarter, onQuarterChange }) => {
    const quarters = [
        { name: 'Q1 (Jan-Mar)', value: 0, months: ['Janeiro', 'Fevereiro', 'Março'] },
        { name: 'Q2 (Abr-Jun)', value: 1, months: ['Abril', 'Maio', 'Junho'] },
        { name: 'Q3 (Jul-Set)', value: 2, months: ['Julho', 'Agosto', 'Setembro'] },
        { name: 'Q4 (Out-Dez)', value: 3, months: ['Outubro', 'Novembro', 'Dezembro'] }
    ];

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: "var(--space-4)",
            boxShadow: 'var(--shadow-sm)'
        }}>
            <label style={{
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--text-main)',
                minWidth: '140px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                📅 Trimestre
            </label>

            <Select
                value={selectedQuarter}
                onChange={(e) => onQuarterChange(parseInt(e.target.value))}
                style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontWeight: '500',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '200px',
                    transition: 'all 0.15s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            >
                {quarters.map((q) => (
                    <option key={q.value} value={q.value} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                        {q.name}
                    </option>
                ))}
            </Select>

            <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginLeft: 'auto',
                padding: '6px 14px',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontWeight: '500'
            }}>
                {quarters[selectedQuarter].months.join(' • ')}
            </div>
        </div>
    );
};

export default QuarterSelector;
