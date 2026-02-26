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
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2c3e50',
                minWidth: '150px'
            }}>
                📅 Selecione o Trimestre:
            </label>

            <Select
                value={selectedQuarter}
                onChange={(e) => onQuarterChange(parseInt(e.target.value))}
                style={{
                    padding: '10px 15px',
                    fontSize: '14px',
                    border: '2px solid #006400',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#2c3e50',
                    fontWeight: '500',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '200px',
                    transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#004d00'}
                onMouseOut={(e) => e.target.style.borderColor = '#006400'}
            >
                {quarters.map((q) => (
                    <option key={q.value} value={q.value}>
                        {q.name}
                    </option>
                ))}
            </Select>

            <div style={{
                fontSize: '12px',
                color: '#7f8c8d',
                marginLeft: '10px',
                padding: '8px 12px',
                background: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
            }}>
                {quarters[selectedQuarter].months.join(' • ')}
            </div>
        </div>
    );
};

export default QuarterSelector;
