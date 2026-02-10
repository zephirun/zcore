import fs from 'fs';
import path from 'path';

const modulesConfig = {
    purchases: [
        { name: 'OrderControl', title: 'Controle de Pedidos', subtitle: 'Gestão de Compras e Status', color: '#d84315' },
        { name: 'PurchaseRequisitions', title: 'Requisições de Compras', subtitle: 'Sistema de Requisições', color: '#d84315' },
        { name: 'BranchTransfers', title: 'Transferências entre Filiais', subtitle: 'Gestão de Estoque Interunidades', color: '#d84315' },
        { name: 'UniformControl', title: 'Controle de Uniformes', subtitle: 'Gestão de Uniformes e EPI', color: '#d84315' },
        { name: 'GiftsControl', title: 'Controle de Brindes', subtitle: 'Gestão de Brindes Corporativos', color: '#d84315' },
        { name: 'CentralArea', title: 'Área Central GMAD', subtitle: 'Gestão Corporativa', color: '#d84315' },
        { name: 'SupplierCampaigns', title: 'Campanhas Fornecedores', subtitle: 'Ações Promocionais', color: '#d84315' }
    ],
    logistics: [
        { name: 'WarehouseManagement', title: 'FindLog', subtitle: 'Gestão de Logística', color: '#0288d1' },
        { name: 'WarehouseTraining', title: 'Treinamentos', subtitle: 'Capacitação da Equipe', color: '#0288d1' }
    ],
    financial: [
        { name: 'CostCenter', title: 'Centro de Custo', subtitle: 'Gestão de Despesas e Orçamentos', color: '#00897b' },
        { name: 'SerasaSPC', title: 'Serasa/SPC', subtitle: 'Consultas de Crédito', color: '#00897b' },
        { name: 'CreditAuth', title: 'Autorização de Crédito', subtitle: 'Análise e Aprovação', color: '#00897b' }
    ],
    processes: [
        { name: 'ProcessManagement', title: 'Processos', subtitle: 'Gestão e Automação', color: '#7b1fa2' },
        { name: 'Documentation', title: 'Documentação', subtitle: 'Repositório de Processos', color: '#7b1fa2' },
        { name: 'POP', title: 'POP', subtitle: 'Procedimento Operacional', color: '#7b1fa2' },
        { name: 'Flowchart', title: 'Fluxograma', subtitle: 'Mapeamento de Fluxos', color: '#7b1fa2' }
    ],
    'customer-service': [
        { name: 'RNC', title: 'RNC', subtitle: 'Relatório de Não Conformidade', color: '#f57c00' },
        { name: 'TechnicalAssistance', title: 'Assistência Técnica', subtitle: 'Suporte e Manutenção', color: '#f57c00' },
        { name: 'SupplierDealing', title: 'Tratativas Fornecedores', subtitle: 'Resolução de Conflitos', color: '#f57c00' }
    ],
    ai: [
        { name: 'AIAgents', title: 'Agentes de IA', subtitle: 'Gestão de Assistentes Inteligentes', color: '#0061ff' },
        { name: 'AISales', title: 'IA de Vendas', subtitle: 'Predição e Insights de Dados', color: '#0061ff' }
    ],
    operations: [
        { name: 'FleetManagement', title: 'Gestão de Frota', subtitle: 'Controle de Veículos e Manutenção', color: '#455a64' }
    ],
    'service-center': [
        { name: 'InputManagement', title: 'Gestão de Insumos', subtitle: 'Controle de Matéria-Prima e Produção', color: '#37474f' }
    ],
    hr: [
        { name: 'TimeTracking', title: 'Controle de Ponto', subtitle: 'Gestão de Horas e Frequência', color: '#d81b60' },
        { name: 'EmployeeManagement', title: 'Gestão de Colaboradores', subtitle: 'Administração de Pessoal', color: '#d81b60' }
    ],
    it: [
        { name: 'ITAssets', title: 'Ger. Equipamentos', subtitle: 'Controle de Hardware/Software', color: '#283593' }
    ],
    marketing: [
        { name: 'Offers', title: 'Ofertas', subtitle: 'Gestão de Ofertas', color: '#673ab7' }
    ],
    board: [
        { name: 'DRE', title: 'DRE', subtitle: 'Demonstração do Resultado', color: '#1a237e' }
    ]
};

const template = (name, title, subtitle, color) => `import React from 'react';
import Header from '../../components/Header';
import { useData } from '../../context/DataContext';

const ${name} = () => {
    const { activeUnit } = useData();

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: '"Segoe UI", sans-serif' }}>
            <Header />
            <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid ${color}', paddingBottom: '10px', display: 'inline-block' }}>
                    ${title}
                </h2>

                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{
                        padding: '10px 15px',
                        background: activeUnit === 'madville' ? '#e3f2fd' : '#e8f5e9',
                        color: activeUnit === 'madville' ? '#1565c0' : '#2e7d32',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        fontWeight: '600',
                        display: 'inline-block'
                    }}>
                        UNIDADE ATIVA: {activeUnit === 'madville' ? 'Madville' : 'Curitiba'}
                    </div>

                    <p style={{ color: '#666' }}>
                        Módulo de ${title} em desenvolvimento.
                        ${subtitle} para a unidade <strong>{activeUnit === 'madville' ? 'Madville' : 'Curitiba'}</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ${name};`;

const baseDir = 'src/pages';

Object.entries(modulesConfig).forEach(([folder, modules]) => {
    const folderPath = path.join(baseDir, folder);

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Create each module file
    modules.forEach(({ name, title, subtitle, color }) => {
        const filePath = path.join(folderPath, `${name}.jsx`);
        const content = template(name, title, subtitle, color);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Created: ${filePath}`);
    });
});

console.log('\n🎉 All module files created successfully!');
