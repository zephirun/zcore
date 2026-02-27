export const COMPANIES = {
    madville: {
        id: 'madville',
        name: 'GMAD Madville',
        shortName: 'Madville',
        apiBase: import.meta.env.VITE_API_MADVILLE || 'http://localhost:3001/api/madville',
        color: '#7C6EF8',
    },
    curitiba: {
        id: 'curitiba',
        name: 'GMAD Curitiba',
        shortName: 'Curitiba',
        apiBase: import.meta.env.VITE_API_CURITIBA || 'http://localhost:3001/api/curitiba',
        color: '#3B82F6',
    },
};

export const DEFAULT_COMPANY = 'madville';
