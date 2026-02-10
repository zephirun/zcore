// Simulating SQL Tables
export const customersData = [
    { id: '001', name: 'SO CLI NOME CLIENTE', vendor: 'VENDEDOR' },
    { id: '002', name: 'EMPRESA XYZ LTDA', vendor: 'VENDEDOR A' },
    { id: '003', name: 'COMÉRCIO ABC S/A', vendor: 'VENDEDOR B' },
];

export const salesData = [
    // Client 001 - Jan, Feb, Mar
    { id: 1, client_id: '001', date: '2025-01-15', amount: 45230.00, margin_percent: 18.5, deadline: 30 },
    { id: 2, client_id: '001', date: '2025-02-10', amount: 52180.00, margin_percent: 21.2, deadline: 35 },
    { id: 3, client_id: '001', date: '2025-03-05', amount: 48950.00, margin_percent: 19.8, deadline: 32 },

    // Client 002 - Jan, Feb, Mar
    { id: 4, client_id: '002', date: '2025-01-20', amount: 38420.00, margin_percent: 22.3, deadline: 45 },
    { id: 5, client_id: '002', date: '2025-02-15', amount: 41290.00, margin_percent: 24.1, deadline: 42 },
    { id: 6, client_id: '002', date: '2025-03-12', amount: 39850.00, margin_percent: 23.5, deadline: 44 },

    // Client 003 - Jan, Feb, Mar
    { id: 7, client_id: '003', date: '2025-01-05', amount: 62750.00, margin_percent: 25.8, deadline: 60 },
    { id: 8, client_id: '003', date: '2025-02-02', amount: 58920.00, margin_percent: 26.4, deadline: 55 },
    { id: 9, client_id: '003', date: '2025-03-25', amount: 61340.00, margin_percent: 26.1, deadline: 58 },
];
