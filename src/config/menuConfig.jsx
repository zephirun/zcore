import React from 'react';

// Define all available modules
export const allModules = [
    {
        id: 'sales-analysis',
        title: 'Faturamento Trimestral',
        subtitle: 'Vendedores X Clientes',
        category: 'vendas',
        size: 'large',
        health: 'stable',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
        ),
        path: '/sales/dashboard'
    },
    {
        id: 'sales-analysis-real',
        title: 'Faturamento em Tempo Real',
        subtitle: 'Dados Direto do Oracle',
        category: 'vendas',
        size: 'large',
        health: 'stable',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
                <circle cx="12" cy="12" r="10" />
            </svg>
        ),
        path: '/sales/analysis'
    },
    {
        id: 'client-records',
        title: 'Ficha de Clientes',
        subtitle: 'Histórico e Observações',
        category: 'vendas',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        ),
        path: '/sales/client-records'
    },
    {
        id: 'team-records',
        title: 'Ficha de Equipe',
        subtitle: 'Metas e Histórico',
        category: 'vendas',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        ),
        path: '/sales/team-records'
    },
    {
        id: 'synthetic-sales-summary',
        title: 'Resumo Sintético de Vendas',
        subtitle: 'Visão Geral e KPIs',
        category: 'vendas',
        size: 'large',
        health: 'stable',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
        ),
        path: '/sales/synthetic-summary'
    },
    {
        id: 'smart-catalog',
        title: 'Catálogo Inteligente',
        subtitle: 'Produtos e Recomendações',
        category: 'vendas',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
        ),
        path: '/sales/smart-catalog',
        status: 'coming-soon'
    },
    {
        id: 'sales-intelligence',
        title: 'Radar Estratégico',
        subtitle: 'Inteligência e Predição',
        category: 'vendas',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m16 12-4-4-4 4"></path>
                <path d="m12 8v8"></path>
            </svg>
        ),
        path: '/sales/intelligence'
    },
    {
        id: 'sales-simulation',
        title: 'Simulação de Vendas',
        subtitle: 'Projeção de Metas',
        category: 'vendas',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                <line x1="8" y1="18" x2="8.01" y2="18"></line>
                <line x1="16" y1="18" x2="16.01" y2="18"></line>
                <line x1="12" y1="14" x2="12.01" y2="14"></line>
                <line x1="8" y1="14" x2="8.01" y2="14"></line>
                <line x1="16" y1="14" x2="16.01" y2="14"></line>
                <line x1="12" y1="10" x2="12.01" y2="10"></line>
                <line x1="8" y1="10" x2="8.01" y2="10"></line>
                <line x1="16" y1="10" x2="16.01" y2="10"></line>
                <line x1="8" y1="6" x2="16" y2="6"></line>
            </svg>
        ),
        path: '/sales/simulation'
    },
    {
        id: 'cost-center',
        title: 'Centro de Custo',
        subtitle: 'Gestão de Despesas e Orçamentos',
        category: 'financeiro',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        ),
        path: '/financial/cost-center',
        status: 'coming-soon'
    },
    {
        id: 'order-control',
        title: 'Controle de Pedidos',
        subtitle: 'Gestão de Compras e Status',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
        ),
        path: '/purchases/order-control',
        status: 'coming-soon'
    },
    {
        id: 'purchase-requisitions',
        title: 'Requisições de Compras',
        subtitle: 'Sistema de Requisições',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        ),
        path: 'https://comprasmadville.lovable.app/'
    },
    {
        id: 'branch-transfers',
        title: 'Transferências entre filiais',
        subtitle: 'Gestão de Estoque Interunidades',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="8 21 3 21 3 16"></polyline>
                <line x1="20" y1="4" x2="3" y2="21"></line>
            </svg>
        ),
        path: '/purchases/branch-transfers',
        status: 'coming-soon'
    },
    {
        id: 'uniform-control',
        title: 'Controle de Uniformes',
        subtitle: 'Gestão de Uniformes e EPI',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
            </svg>
        ),
        path: '/purchases/uniform-control',
        status: 'coming-soon'
    },
    {
        id: 'gifts-control',
        title: 'Controle de Brindes',
        subtitle: 'Gestão de Brindes Corporativos',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"></polyline>
                <rect x="2" y="7" width="20" height="5"></rect>
                <line x1="12" y1="22" x2="12" y2="7"></line>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
            </svg>
        ),
        path: '/purchases/gifts-control',
        status: 'coming-soon'
    },
    {
        id: 'delivery-schedule',
        title: 'Agendamento de Entrega',
        subtitle: 'Logística e Roteirização',
        category: 'logistica',
        size: 'large',
        health: 'stable',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
        ),
        path: '/logistics/delivery-schedule'
    },

    {
        id: 'returns',
        title: 'Devoluções',
        subtitle: 'Gestão de Devoluções',
        category: 'sac',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 14 4 9 9 4"></polyline>
                <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
            </svg>
        ),
        path: '/customer-service/returns'
    },
    {
        id: 'rnc',
        title: 'RNC',
        subtitle: 'Relatório de Não Conformidade',
        category: 'sac',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        ),
        path: '/customer-service/rnc',
        status: 'coming-soon'
    },
    // AI & Agents Modules
    {
        id: 'ai-agents',
        title: 'Agentes de IA',
        subtitle: 'Gestão de Assistentes Inteligentes',
        category: 'ia',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M12 12L2.69 7"></path>
                <path d="M12 12l5.66 5.66"></path>
                <path d="M12 12l-1.41 9.9"></path>
            </svg>
        ),
        path: '/processes/management',
        status: 'coming-soon'
    },
    {
        id: 'ai-sales',
        title: 'IA de Vendas',
        subtitle: 'Predição e Insights de Dados',
        category: 'ia',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
        ),
        path: '/customer-service/rnc',
        status: 'coming-soon'
    },
    {
        id: 'fleet-management',
        title: 'Gestão de Frota',
        subtitle: 'Controle de Veículos e Manutenção',
        category: 'logistica',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
        ),
        path: '/logistics/fleet-management',
        status: 'coming-soon'
    },
    {
        id: 'input-management',
        title: 'Gestão de Insumos',
        subtitle: 'Controle de Matéria-Prima e Produção',
        category: 'fabrica',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6h18z"></path>
                <path d="M7 10v4"></path>
                <path d="M11 10v4"></path>
                <path d="M15 10v4"></path>
                <path d="M19 10v4"></path>
                <path d="M3 14v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6H3z"></path>
            </svg>
        ),
        path: '/ai/sales',
        status: 'coming-soon'
    },
    // New Modules Request
    {
        id: 'material-request',
        title: 'Solicitação de Materiais',
        subtitle: 'Requisição Interna',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7h-9"></path>
                <path d="M14 17H5"></path>
                <circle cx="17" cy="17" r="3"></circle>
                <circle cx="7" cy="7" r="3"></circle>
            </svg>
        ),
        path: '/operations/fleet-management',
        status: 'coming-soon'
    },
    {
        id: 'time-tracking',
        title: 'Controle de Ponto',
        subtitle: 'Gestão de Horas e Frequência',
        category: 'rh',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
        ),
        path: '/service-center/input-management',
        status: 'coming-soon'
    },
    {
        id: 'employee-management',
        title: 'Gestão de Colaboradores',
        subtitle: 'Administração de Pessoal',
        category: 'rh',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        ),
        path: '/hr/time-tracking',
        status: 'coming-soon'
    },
    {
        id: 'it-assets',
        title: 'Gerenciamento de Equipamentos',
        subtitle: 'Controle de Hardware/Software',
        category: 'ti',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
        ),
        path: '/hr/employee-management',
        status: 'coming-soon'
    },
    {
        id: 'process-docs',
        title: 'Documentação',
        subtitle: 'Repositório de Processos',
        category: 'processos',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        ),
        path: '/processes/documentation',
        status: 'coming-soon'
    },
    {
        id: 'process-pop',
        title: 'POP',
        subtitle: 'Procedimento Operacional',
        category: 'processos',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M12 13v6"></path>
                <path d="M9 16h6"></path>
            </svg>
        ),
        path: '/processes/pop',
        status: 'coming-soon'
    },
    {
        id: 'process-flowchart',
        title: 'Fluxograma',
        subtitle: 'Mapeamento de Fluxos',
        category: 'processos',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <path d="M10 6.5h4"></path>
                <path d="M6.5 10v4"></path>
                <path d="M17.5 10v4"></path>
                <path d="M10 17.5h4"></path>
            </svg>
        ),
        path: '/processes/flowchart',
        status: 'coming-soon'
    },
    {
        id: 'technical-assistance',
        title: 'Assistência Técnica',
        subtitle: 'Suporte e Manutenção',
        category: 'sac',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
        ),
        path: '/customer-service/technical-assistance',
        status: 'coming-soon'
    },
    {
        id: 'supplier-dealing',
        title: 'Tratativas Fornecedores',
        subtitle: 'Resolução de Conflitos',
        category: 'sac',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        ),
        path: '/customer-service/supplier-dealing',
        status: 'coming-soon'
    },
    {
        id: 'sales-campaigns',
        title: 'Campanhas de Vendas',
        subtitle: 'Incentivos e Promoções',
        category: 'vendas',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
        ),
        path: '/sales/campaigns',
        status: 'coming-soon'
    },
    {
        id: 'supplier-campaigns',
        title: 'Campanhas Fornecedores',
        subtitle: 'Ações Promocionais',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        ),
        path: '/purchases/supplier-campaigns',
        status: 'coming-soon'
    },
    {
        id: 'purchasing-intelligence',
        title: 'Inteligência de Compras',
        subtitle: 'Lead Time e Performance',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
        ),
        path: '/purchases/intelligence'
    },
    {
        id: 'brands-buyers',
        title: 'Marcas e Compradores',
        subtitle: 'Gestão de Marcas',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
        ),
        path: '/purchases/brands-buyers'
    },
    {
        id: 'warehouse-management',
        title: 'Gerenciamento de Armazém',
        subtitle: 'Gestão de Almoxarifado',
        category: 'logistica',
        size: 'large',
        health: 'stable',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                <circle cx="10" cy="10" r="3" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}></circle>
                <line x1="12.5" y1="12.5" x2="14" y2="14" style={{ stroke: 'currentColor', strokeWidth: '2' }}></line>
            </svg>
        ),
        path: 'http://172.25.10.10/home/'
    },
    {
        id: 'warehouse-training',
        title: 'Treinamentos',
        subtitle: 'Capacitação da Equipe',
        category: 'logistica',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
        ),
        path: '/logistics/warehouse-management',
        status: 'coming-soon'
    },
    {
        id: 'central-area',
        title: 'Área Central GMAD',
        subtitle: 'Gestão Corporativa',
        category: 'compras',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
        ),
        path: '/purchases/central-area',
        status: 'coming-soon'
    },
    {
        id: 'serasa-spc',
        title: 'Serasa/SPC',
        subtitle: 'Consulta e Gestão de Crédito',
        category: 'financeiro',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
        ),
        path: '/financial/serasa-spc',
        status: 'coming-soon'
    },
    {
        id: 'financial-intelligence',
        title: 'Inteligência Financeira',
        subtitle: 'Cash Flow e Saúde do Caixa',
        category: 'financeiro',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        ),
        path: '/financial/intelligence'
    },
    {
        id: 'marketing-schedule',
        title: 'Cronograma',
        subtitle: 'Planejamento de Marketing',
        category: 'marketing',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        ),
        path: '/marketing/schedule',
        status: 'coming-soon'
    },
    {
        id: 'marketing-offers',
        title: 'Ofertas',
        subtitle: 'Gestão de Ofertas',
        category: 'marketing',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
        ),
        path: '/marketing/offers',
        status: 'coming-soon'
    },
    {
        id: 'dre',
        title: 'DRE',
        subtitle: 'Demonstração do Resultado',
        category: 'diretoria',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
        ),
        path: '/it/assets',
    },
    {
        id: 'team-portal',
        title: 'Portal da Equipe',
        subtitle: 'Comunicação e Engajamento',
        category: 'equipe',
        size: 'large',
        health: 'stable',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 6.1H3" />
                <path d="M21 12.1H3" />
                <path d="M15.1 18.1H3" />
            </svg>
        ),
        path: '/equipe'
    },
    {
        id: 'admin-audit',
        title: 'Auditoria de Usuários',
        subtitle: 'Logs e Comportamento',
        category: 'ti',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
            </svg>
        ),
        path: '/admin/audit'
    }
];

// Define categories with their properties
export const categories = [
    {
        id: 'vendas',
        name: 'Vendas',
        description: 'Análises e relatórios de vendas',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
        color: '#2e7d32',
        bgColor: '#f1f8f3'
    },
    {
        id: 'logistica',
        name: 'Logística e Operações',
        description: 'Gestão de Armazenagem e Distribuição',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="13" x="2" y="6" rx="2" />
                <path d="M22 14h-4V8l4 1v5Z" />
                <path d="M16 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
                <path d="M6 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
        ),
        color: '#0288d1',
        bgColor: '#e1f5fe'
    },
    {
        id: 'compras',
        name: 'Compras',
        description: 'Gestão de pedidos e fornecedores',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H5.21" />
            </svg>
        ),
        color: '#d84315',
        bgColor: '#fbe9e7'
    },
    {
        id: 'financeiro',
        name: 'Financeiro',
        description: 'Controle de custos e orçamentos',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
        ),
        color: '#00897b',
        bgColor: '#e0f2f1'
    },
    {
        id: 'fabrica',
        name: 'Centro de Serviço',
        description: 'Gestão de insumos e produção',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        ),
        color: '#37474f',
        bgColor: '#f5f5f5'
    },
    {
        id: 'sac',
        name: 'SAC e Logística Reversa',
        description: 'Devoluções e não conformidades',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8Z" />
                <path d="M10 12h.01" />
                <path d="M16 12h.01" />
                <path d="M4 12h.01" />
            </svg>
        ),
        color: '#f57c00',
        bgColor: '#fff3e0'
    },
    {
        id: 'diretoria',
        name: 'Diretoria',
        description: 'Gestão Executiva e DRE',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
            </svg>
        ),
        color: '#1a237e',
        bgColor: '#e8eaf6'
    },
    {
        id: 'ia',
        name: 'IA e Agentes',
        description: 'Inteligência Artificial e Automação',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4" />
                <path d="M3 5h4" />
                <path d="M21 17v4" />
                <path d="M19 19h4" />
            </svg>
        ),
        color: '#0061ff',
        bgColor: '#eef4ff',
        hidden: true // Hidden from main menu/sidebar, moved to Header
    },
    {
        id: 'processos',
        name: 'Processos',
        description: 'Gestão e automação de processos',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" x2="6" y1="3" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
        ),
        color: '#0288d1',
        bgColor: '#e1f5fe'
    },
    {
        id: 'rh',
        name: 'Recursos Humanos',
        description: 'Gestão de Pessoas',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        color: '#d81b60',
        bgColor: '#fce4ec'
    },
    {
        id: 'ti',
        name: 'TI',
        description: 'Tecnologia da Informação',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
        color: '#283593',
        bgColor: '#e8eaf6'
    },
    {
        id: 'marketing',
        name: 'Marketing e Eventos',
        description: 'Gestão de Marketing e Eventos',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 15h2a2 2 0 1 0 0-4h-2v4Z" />
                <path d="m4 16 4.586-4.586a2 2 0 0 1 2.828 0L16 16" />
                <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z" />
            </svg>
        ),
        color: '#673ab7',
        bgColor: '#ede7f6'
    },
    {
        id: 'equipe',
        name: 'Equipe',
        description: 'Comunicação e Colaboração Interna',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M9 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
                <circle cx="17" cy="11" r="3" />
            </svg>
        ),
        color: '#3B82F6',
        bgColor: '#EFF6FF'
    }
];
