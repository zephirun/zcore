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
    const [allowedUnit, setAllowedUnit] = useState(null); // Store Allowed Unit
    const [allowedModules, setAllowedModules] = useState([]); // Store Allowed Modules
    const [users, setUsers] = useState([]);; // List of users

    const [selectedQuarter, setSelectedQuarter] = useState(0); // Q1 by default
    const [quarterData, setQuarterData] = useState([]);
    const [globalFilters, setGlobalFilters] = useState({ vendor: 'Selecionar Todos', client: 'Selecionar Todos', ranking: 'Sem Ordenação' });

    // Dynamic Available Units
    const ALL_UNITS = React.useMemo(() => [
        { id: 'curitiba', name: 'GMAD Curitiba' },
        { id: 'madville', name: 'GMAD Madville' }
    ], []);

    const AVAILABLE_UNITS = React.useMemo(() => {
        return (userRole === 'admin' || !allowedUnit)
            ? ALL_UNITS
            : ALL_UNITS.filter(u => u.id === allowedUnit);
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
                { id: 'sales-campaigns', name: 'Campanhas de Vendas' }
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
                { id: 'supplier-campaigns', name: 'Campanhas Fornecedores' }
            ]
        },
        {
            id: 'logistica',
            name: 'Logística',
            modules: [
                { id: 'delivery-schedule', name: 'Agendamento de Entrega' },
                { id: 'warehouse-management', name: 'Gerenciamento de Armazém (Gestão de Almoxarifado)' },
                { id: 'warehouse-training', name: 'Treinamentos' }
            ]
        },
        {
            id: 'financeiro',
            name: 'Financeiro',
            modules: [
                { id: 'cost-center', name: 'Centro de Custo' },
                { id: 'serasa-spc', name: 'Serasa/SPC' },
                { id: 'credit-auth', name: 'Autorização de Crédito' }
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
            id: 'logistica-geral',
            name: 'Operações',
            modules: [
                { id: 'fleet-management', name: 'Gestão de Frota' }
            ]
        },
        {
            id: 'processos',
            name: 'Processos',
            modules: [
                { id: 'processes', name: 'Processos' },
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
                { id: 'marketing-offers', name: 'Ofertas' }
            ]
        },
        {
            id: 'sgi',
            name: 'SGI',
            modules: [
                { id: 'quality', name: 'Qualidade' },
                { id: 'environment', name: 'Meio Ambiente' },
                { id: 'safety', name: 'Segurança e Saúde' },
                { id: 'social-responsibility', name: 'Responsabilidade Social' }
            ]
        }
    ], []);

    // Flat list for backward compatibility
    const AVAILABLE_MODULES = React.useMemo(() => MODULE_CATEGORIES.flatMap(cat => cat.modules), [MODULE_CATEGORIES]);

    // Load Initial Data (Auth + Users + Sales)
    useEffect(() => {
        // 1. Load Users from DB
        const loadUsers = async () => {
            const dbUsers = await api.fetchUsers();
            if (dbUsers && dbUsers.length > 0) {
                setUsers(dbUsers);
            }
        };
        loadUsers();

        // 2. Check Auth Persistence
        const storedAuth = localStorage.getItem('gmad_auth');
        const storedUnit = localStorage.getItem('gmad_active_unit');
        const storedRole = localStorage.getItem('gmad_user_role');
        const storedUsername = localStorage.getItem('gmad_username');
        const storedName = localStorage.getItem('gmad_name'); // Load Name
        const storedAllowedUnit = localStorage.getItem('gmad_allowed_unit');
        const storedAllowedModules = localStorage.getItem('gmad_allowed_modules');

        if (storedAuth === 'true') {
            setIsAuthenticated(true);
            if (storedUnit) setActiveUnit(storedUnit);
            if (storedRole) setUserRole(storedRole);
            if (storedUsername) setUsername(storedUsername);
            if (storedName) setName(storedName);
            if (storedAllowedUnit) setAllowedUnit(storedAllowedUnit === 'null' ? null : storedAllowedUnit);
            if (storedAllowedModules) setAllowedModules(JSON.parse(storedAllowedModules));

            loadServerData();
        }
    }, [activeUnit]); // Refresh if active unit changes if needed

    const loadServerData = async (unit) => {
        try {
            const targetUnit = unit || activeUnit;
            const data = await import('../services/api').then(module => module.fetchSalesData(targetUnit));
            setSalesData(data);
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
            setAllowedUnit(foundUser.allowedUnit || null);
            setAllowedModules(foundUser.allowedModules || []);

            // Persist session
            localStorage.setItem('gmad_auth', 'true');
            localStorage.setItem('gmad_active_unit', activeUnit);
            localStorage.setItem('gmad_user_role', foundUser.role);
            localStorage.setItem('gmad_username', foundUser.username);
            localStorage.setItem('gmad_name', foundUser.name || foundUser.username);
            localStorage.setItem('gmad_allowed_unit', foundUser.allowedUnit || 'null');
            localStorage.setItem('gmad_allowed_modules', JSON.stringify(foundUser.allowedModules || []));

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
        localStorage.removeItem('gmad_allowed_unit');
        localStorage.removeItem('gmad_allowed_modules');

        setSalesData([]);
        setUserRole('viewer');
        setUsername('');
        setName('');
        setAllowedUnit(null);
        setAllowedModules([]);
        setActiveUnit('madville');
    };

    // User Management Functions
    const registerUser = async (newName, newUser, newPass, newRole, newAllowedUnit, newAllowedModules) => {
        const result = await api.registerUserApi({
            name: newName,
            username: newUser,
            password: newPass,
            role: newRole,
            allowedUnit: newAllowedUnit,
            allowedModules: newAllowedModules
        });

        if (result && result.success) {
            const updatedUsers = await api.fetchUsers();
            setUsers(updatedUsers);
            return true;
        }
        return false;
    };

    const updateUser = async (targetUsername, updates) => {
        const result = await api.updateUserApi(targetUsername, updates);

        if (result && result.success) {
            const updatedUsers = await api.fetchUsers();
            setUsers(updatedUsers);

            // Update current session if editing self
            if (username === targetUsername) {
                if (updates.name) setName(updates.name);
                localStorage.setItem('gmad_name', updates.name);
            }
            return true;
        }
        return false;
    };

    const deleteUser = async (targetUsername) => {
        const result = await api.deleteUserApi(targetUsername);
        if (result && result.success) {
            const updatedUsers = await api.fetchUsers();
            setUsers(updatedUsers);
            return true;
        }
        return false;
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
            allowedUnit,
            allowedModules,
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
            updateQuarter,
            switchUnit,
            globalFilters,
            setGlobalFilters
        }}>
            {children}
        </DataContext.Provider>
    );
};
