import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [salesData, setSalesData] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeUnit, setActiveUnit] = useState('madville');
    const [userRole, setUserRole] = useState('viewer'); // 'admin' | 'viewer'
    const [username, setUsername] = useState(''); // Store current username
    const [name, setName] = useState(''); // Store Real Name
    const [group, setGroup] = useState(''); // Store User Group
    const [avatarUrl, setAvatarUrl] = useState(''); // Store Avatar URL
    const [allowedUnit, setAllowedUnit] = useState(null); // Store Allowed Unit
    const [allowedVendor, setAllowedVendor] = useState(null); // Store Allowed Vendor
    const [allowedModules, setAllowedModules] = useState([]); // Store Allowed Modules
    const [users, setUsers] = useState([]);; // List of users
    const [clientRecords, setClientRecords] = useState([]); // Client Metadata (Payment, Terms, etc)

    const [selectedQuarter, setSelectedQuarter] = useState(0); // Q1 by default
    const [quarterData, setQuarterData] = useState([]);
    const [globalFilters, setGlobalFilters] = useState({ vendor: 'Selecionar Todos', client: 'Selecionar Todos', ranking: 'Sem Ordenação' });
    const [theme, setTheme] = useState(() => localStorage.getItem('gmad_theme') || 'dark'); // Load from local storage
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Sidebar state

    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('gmad_theme', newTheme);
            return newTheme;
        });
    };

    // Apply Theme to DOM
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Dynamic Available Units
    const ALL_UNITS = React.useMemo(() => [
        { id: 'curitiba', name: 'GMAD Curitiba' },
        { id: 'madville', name: 'GMAD Madville' }
    ], []);

    const AVAILABLE_UNITS = React.useMemo(() => {
        if (userRole === 'admin' || !allowedUnit) return ALL_UNITS;

        let allowedList = [];
        try {
            // Try to parse as JSON array (e.g., '["madville", "curitiba"]')
            allowedList = JSON.parse(allowedUnit);
        } catch (e) {
            // Fallback: Check if it's a single string or comma-separated
            allowedList = allowedUnit.split ? allowedUnit.split(',') : [allowedUnit];
        }

        if (!Array.isArray(allowedList)) allowedList = [allowedUnit];

        return ALL_UNITS.filter(u => allowedList.includes(u.id));
    }, [userRole, allowedUnit, ALL_UNITS]);

    // Centralized Modules List - Grouped by Category
    const MODULE_CATEGORIES = React.useMemo(() => [
        {
            id: 'vendas',
            name: 'Vendas',
            modules: [
                { id: 'sales-analysis', name: 'Análise Trimestral de Vendas' },
                { id: 'synthetic-sales-summary', name: 'Resumo Sintético de Vendas' },
                { id: 'smart-catalog', name: 'Catálogo Inteligente' },
                { id: 'sales-campaigns', name: 'Campanhas de Vendas' },
                { id: 'sales-intelligence', name: 'Radar Estratégico' }
            ]
        },
        {
            id: 'compras',
            name: 'Compras',
            modules: [
                { id: 'order-control', name: 'Controle de Pedidos' },
                { id: 'purchase-requisitions', name: 'Requisições de Compra' },
                { id: 'branch-transfers', name: 'Transferências entre Filiais' },
                { id: 'uniform-control', name: 'Controle de Uniformes' },
                { id: 'gifts-control', name: 'Controle de Brindes' },
                { id: 'material-request', name: 'Solicitação de Materiais' },
                { id: 'central-area', name: 'Área Central GMAD' },
                { id: 'supplier-campaigns', name: 'Campanhas Fornecedores' },
                { id: 'purchasing-intelligence', name: 'Inteligência de Compras' }
            ]
        },
        {
            id: 'logistica',
            name: 'Logística',
            modules: [
                { id: 'delivery-schedule', name: 'Agendamento de Entrega' },
                { id: 'warehouse-management', name: 'Gerenciamento de Armazém' },
                { id: 'warehouse-training', name: 'Treinamentos' },
                { id: 'fleet-management', name: 'Gestão de Frota' }
            ]
        },
        {
            id: 'financeiro',
            name: 'Financeiro',
            modules: [
                { id: 'cost-center', name: 'Centro de Custo' },
                { id: 'serasa-spc', name: 'Serasa/SPC' },
                { id: 'credit-auth', name: 'Autorização de Crédito' },
                { id: 'financial-intelligence', name: 'Inteligência Financeira' }
            ]
        },
        {
            id: 'fabrica',
            name: 'Centro de Serviço',
            modules: [
                { id: 'input-management', name: 'Gestão de Insumos' }
            ]
        },
        {
            id: 'sac',
            name: 'SAC e Logística Reversa',
            modules: [
                { id: 'returns', name: 'Devoluções' },
                { id: 'rnc', name: 'RNC' },
                { id: 'technical-assistance', name: 'Assistência Técnica' },
                { id: 'supplier-dealing', name: 'Tratativas Fornecedores' }
            ]
        },
        {
            id: 'diretoria',
            name: 'Diretoria',
            modules: [
                { id: 'dre', name: 'DRE (Demonstração do Resultado)' }
            ]
        },
        {
            id: 'ia',
            name: 'IA e Agentes',
            modules: [
                { id: 'ai-agents', name: 'Agentes de IA' },
                { id: 'ai-sales', name: 'IA de Vendas' }
            ]
        },
        {
            id: 'processos',
            name: 'Processos',
            modules: [
                { id: 'process-docs', name: 'Documentação' },
                { id: 'process-pop', name: 'POP' },
                { id: 'process-flowchart', name: 'Fluxograma' }
            ]
        },
        {
            id: 'rh',
            name: 'Recursos Humanos',
            modules: [
                { id: 'time-tracking', name: 'Controle de Ponto' },
                { id: 'employee-management', name: 'Gestão de Colaboradores' }
            ]
        },
        {
            id: 'ti',
            name: 'TI',
            modules: [
                { id: 'it-assets', name: 'Gerenciamento de Equipamentos' }
            ]
        },
        {
            id: 'marketing',
            name: 'Marketing',
            modules: [
                { id: 'marketing-schedule', name: 'Cronograma' },
                { id: 'marketing-offers', name: 'Ofertas' }
            ]
        },
        {
            id: 'equipe',
            name: 'Equipe',
            modules: [
                { id: 'team-portal', name: 'Portal da Equipe' }
            ]
        }
    ], []);

    // Flat list for backward compatibility
    const AVAILABLE_MODULES = React.useMemo(() => MODULE_CATEGORIES.flatMap(cat => cat.modules), [MODULE_CATEGORIES]);

    // Refactor loadUsers to be accessible
    const refreshUserList = async () => {
        const dbUsers = await api.fetchUsers();
        if (dbUsers && dbUsers.length > 0) {
            setUsers(dbUsers);
        }
    };

    // Load Initial Data (Auth + Users + Sales)
    useEffect(() => {
        // 1. Load Users from DB
        refreshUserList();

        // 2. Check Auth Persistence
        const storedAuth = localStorage.getItem('gmad_auth');
        const storedUnit = localStorage.getItem('gmad_active_unit');
        const storedRole = localStorage.getItem('gmad_user_role');
        const storedUsername = localStorage.getItem('gmad_username');
        const storedName = localStorage.getItem('gmad_name'); // Load Name
        const storedGroup = localStorage.getItem('gmad_group'); // Load Group
        const storedAvatarUrl = localStorage.getItem('gmad_avatar_url'); // Load Avatar
        const storedAllowedUnit = localStorage.getItem('gmad_allowed_unit');
        const storedAllowedModules = localStorage.getItem('gmad_allowed_modules');

        if (storedAuth === 'true') {
            setIsAuthenticated(true);
            if (storedUnit) setActiveUnit(storedUnit);
            if (storedRole) setUserRole(storedRole);
            if (storedUsername) setUsername(storedUsername);
            if (storedName) setName(storedName);
            if (storedGroup) setGroup(storedGroup);
            if (storedAvatarUrl) setAvatarUrl(storedAvatarUrl);
            if (storedAllowedUnit) setAllowedUnit(storedAllowedUnit === 'null' ? null : storedAllowedUnit);
            if (localStorage.getItem('gmad_allowed_vendor')) setAllowedVendor(localStorage.getItem('gmad_allowed_vendor') === 'null' ? null : localStorage.getItem('gmad_allowed_vendor'));
            if (storedAllowedModules) setAllowedModules(JSON.parse(storedAllowedModules));

            loadServerData();
        }
    }, [activeUnit]); // Refresh if active unit changes if needed

    // --- PRESENCE HEARTBEAT ---
    useEffect(() => {
        let heartbeatInterval;
        let refreshUsersInterval;

        if (isAuthenticated && username) {
            // 1. Initial Presence Update
            api.updateUserPresence(username);

            // 2. Heartbeat (every 30s)
            heartbeatInterval = setInterval(() => {
                api.updateUserPresence(username);
            }, 30000);

            // 3. Refresh Other Users (every 60s)
            refreshUsersInterval = setInterval(() => {
                refreshUserList();
            }, 60000);
        }

        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            if (refreshUsersInterval) clearInterval(refreshUsersInterval);
        };
    }, [isAuthenticated, username]);

    const loadServerData = async (unit) => {
        try {
            const targetUnit = unit || activeUnit;
            const data = await import('../services/api').then(module => module.fetchSalesData(targetUnit));

            // Filter data by vendor if restricted
            const finalData = (userRole !== 'admin' && allowedVendor)
                ? data.filter(item => item.client?.vendor === allowedVendor)
                : data;

            setSalesData(finalData);

            // Load Client Records
            const records = await api.fetchClientRecords(targetUnit);
            setClientRecords(records);
        } catch (e) {
            console.error("Failed to load server data", e);
        }
    };

    const login = async (inputUser, inputPass) => {
        const result = await api.loginUser(inputUser, inputPass);

        if (result && result.success) {
            const foundUser = result.user;
            setIsAuthenticated(true);
            setUserRole(foundUser.role);
            setUsername(foundUser.username);
            setName(foundUser.name || foundUser.username); // Set Name
            setGroup(foundUser.group || ''); // Set Group
            setAvatarUrl(foundUser.avatarUrl || ''); // Set Avatar
            setAllowedUnit(foundUser.allowedUnit || null);
            setAllowedVendor(foundUser.allowedVendor || null);
            setAllowedModules(foundUser.allowedModules || []);

            // Persist session
            localStorage.setItem('gmad_auth', 'true');
            localStorage.setItem('gmad_active_unit', activeUnit);
            localStorage.setItem('gmad_user_role', foundUser.role);
            localStorage.setItem('gmad_username', foundUser.username);
            localStorage.setItem('gmad_name', foundUser.name || foundUser.username);
            localStorage.setItem('gmad_group', foundUser.group || '');
            localStorage.setItem('gmad_avatar_url', foundUser.avatarUrl || '');
            localStorage.setItem('gmad_allowed_unit', foundUser.allowedUnit || 'null');
            localStorage.setItem('gmad_allowed_vendor', foundUser.allowedVendor || 'null');
            localStorage.setItem('gmad_allowed_modules', JSON.stringify(foundUser.allowedModules || []));

            // Log activity
            api.logActivity(foundUser.username, 'LOGIN');

            loadServerData(activeUnit);
            return { success: true, user: foundUser }; // Return Full User Object
        }

        return { success: false };
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('gmad_auth');
        localStorage.removeItem('gmad_active_unit');
        localStorage.removeItem('gmad_user_role');
        localStorage.removeItem('gmad_username');
        localStorage.removeItem('gmad_name');
        localStorage.removeItem('gmad_group');
        localStorage.removeItem('gmad_avatar_url');
        localStorage.removeItem('gmad_allowed_unit');
        localStorage.removeItem('gmad_allowed_vendor');
        localStorage.removeItem('gmad_allowed_modules');

        setSalesData([]);
        setUserRole('viewer');
        setUsername('');
        setName('');
        setGroup('');
        setAvatarUrl('');
        setAllowedUnit(null);
        setAllowedVendor(null);
        setAllowedModules([]);
        setActiveUnit('madville');
    };

    // User Management Functions
    const registerUser = async (newName, newUser, newPass, newRole, newAllowedUnit, newAllowedModules, newAllowedVendor, newGroup) => {
        const result = await api.registerUserApi({
            name: newName,
            username: newUser,
            password: newPass,
            role: newRole,
            group: newGroup,
            allowedUnit: newAllowedUnit,
            allowedVendor: newAllowedVendor || null,
            allowedModules: newAllowedModules
        });

        if (result && result.success) {
            await refreshUserList();
            return { success: true };
        }
        return { success: false, error: result?.error || 'Erro desconhecido' };
    };

    const updateUser = async (targetUsername, updates) => {
        const result = await api.updateUserApi(targetUsername, updates);

        if (result && result.success) {
            await refreshUserList();

            // Update current session if editing self
            if (username === targetUsername) {
                if (updates.name) setName(updates.name);
                if (updates.group) setGroup(updates.group);
                if (updates.avatarUrl) setAvatarUrl(updates.avatarUrl);

                localStorage.setItem('gmad_name', updates.name || name);
                if (updates.group) localStorage.setItem('gmad_group', updates.group);
                if (updates.avatarUrl) localStorage.setItem('gmad_avatar_url', updates.avatarUrl);
            }
            return { success: true };
        }
        return { success: false, error: result?.error || 'Erro desconhecido' };
    };

    const deleteUser = async (targetUsername) => {
        const result = await api.deleteUserApi(targetUsername);
        if (result && result.success) {
            await refreshUserList();
            return true;
        }
        return false;
    };

    // Client Records Functions
    const saveClientRecord = async (record) => {
        const payload = {
            ...record,
            unit: activeUnit
        };
        const result = await api.saveClientRecord(payload);
        if (result.success) {
            // Optimistic update or refresh
            const records = await api.fetchClientRecords(activeUnit);
            setClientRecords(records);
            return { success: true };
        }
        return { success: false, error: result.error };
    };

    const switchUnit = (unit) => {
        setActiveUnit(unit);
        localStorage.setItem('gmad_active_unit', unit);
        loadServerData(unit);
        setQuarterData([]);
    };

    const saveReportData = async (newData) => {
        setSalesData(newData);
        await import('../services/api').then(module => module.saveSalesData(newData, activeUnit));
    };

    const clearData = async () => {
        setSalesData([]);
        await import('../services/api').then(module => module.clearSalesData(activeUnit));
    };

    const refreshData = async () => {
        await loadServerData(activeUnit);
    };

    const updateQuarter = (quarterIndex) => {
        setSelectedQuarter(quarterIndex);
        filterDataByQuarter(salesData, quarterIndex);
    };

    const filterDataByQuarter = (data, quarterIndex) => {
        if (!data || data.length === 0) {
            setQuarterData([]);
            return;
        }

        const monthIndices = [
            quarterIndex * 3,
            quarterIndex * 3 + 1,
            quarterIndex * 3 + 2
        ];

        const numMonths = data[0]?.numMonths || data[0]?.months?.length || 3;

        const filtered = data.map(item => {
            let selectedMonths;

            if (numMonths >= 12) {
                selectedMonths = [
                    item.months[monthIndices[0]] || { amount: 0, margin_percent: 0, deadline: 0 },
                    item.months[monthIndices[1]] || { amount: 0, margin_percent: 0, deadline: 0 },
                    item.months[monthIndices[2]] || { amount: 0, margin_percent: 0, deadline: 0 }
                ];
            } else {
                selectedMonths = item.months;
            }

            const totalAmount = selectedMonths.reduce((sum, m) => sum + m.amount, 0);
            const totalMarginRev = selectedMonths.reduce((sum, m) => sum + (m.margin_percent * m.amount), 0);
            const avgMargin = totalAmount ? totalMarginRev / totalAmount : 0;

            const monthsWithSales = selectedMonths.filter(m => m.amount > 0);
            const avgDeadline = monthsWithSales.length > 0
                ? monthsWithSales.reduce((sum, m) => sum + m.deadline, 0) / monthsWithSales.length
                : 0;

            return {
                client: item.client,
                months: selectedMonths,
                total: {
                    amount: totalAmount,
                    margin_percent: avgMargin,
                    deadline: avgDeadline
                }
            };
        });

        setQuarterData(filtered);
    };

    useEffect(() => {
        if (salesData && salesData.length > 0) {
            filterDataByQuarter(salesData, selectedQuarter);
        }
    }, [salesData, selectedQuarter]);

    const uniqueVendors = React.useMemo(() => {
        if (!salesData) return [];
        const vendors = new Set();
        salesData.forEach(item => {
            if (item.client?.vendor) vendors.add(item.client.vendor);
        });
        return Array.from(vendors).sort();
    }, [salesData]);

    return (
        <DataContext.Provider value={{
            salesData,
            quarterData,
            selectedQuarter,
            isAuthenticated,
            activeUnit,
            userRole,
            username,
            name,
            group,
            avatarUrl,
            allowedUnit,
            allowedVendor,
            allowedModules,
            clientRecords,
            saveClientRecord,
            uniqueVendors,
            AVAILABLE_UNITS,
            ALL_UNITS,
            MODULE_CATEGORIES,
            AVAILABLE_MODULES,
            users,
            login,
            logout,
            registerUser,
            updateUser,
            deleteUser,
            saveReportData,
            clearData,
            refreshData,
            refreshUserList, // EXPOSED HERE
            updateQuarter,
            switchUnit,
            globalFilters,
            setGlobalFilters,
            theme,
            toggleTheme,
            sidebarCollapsed,
            setSidebarCollapsed
        }}>
            {children}
        </DataContext.Provider>
    );
};
