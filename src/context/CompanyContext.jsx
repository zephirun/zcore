import { createContext, useContext, useState } from 'react';
import { COMPANIES, DEFAULT_COMPANY } from '../config/companies';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
    const [activeCompanyId, setActiveCompanyId] = useState(
        () => localStorage.getItem('zcore_company') || DEFAULT_COMPANY
    );

    const activeCompany = COMPANIES[activeCompanyId] || COMPANIES[DEFAULT_COMPANY];

    function switchCompany(id) {
        if (!COMPANIES[id]) return;
        setActiveCompanyId(id);
        localStorage.setItem('zcore_company', id);
    }

    return (
        <CompanyContext.Provider value={{
            activeCompany,
            activeCompanyId,
            switchCompany,
            companies: COMPANIES,
        }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const ctx = useContext(CompanyContext);
    if (!ctx) throw new Error('useCompany must be used inside <CompanyProvider>');
    return ctx;
}
