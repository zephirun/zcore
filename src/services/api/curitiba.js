import { fetchData } from './index';
import { COMPANIES } from '../../config/companies';

const c = COMPANIES.curitiba;

export const curitibaApi = {
    faturamentoTrimestral: (dbMode) =>
        fetchData({ companyId: c.id, apiBase: c.apiBase, endpoint: 'faturamento/trimestral', dbMode }),

    faturamentoRealtime: (dbMode) =>
        fetchData({ companyId: c.id, apiBase: c.apiBase, endpoint: 'faturamento/realtime', dbMode }),

    fichaClientes: (id, dbMode) =>
        fetchData({ companyId: c.id, apiBase: c.apiBase, endpoint: `clientes/${id}`, dbMode }),

    resumoVendas: (dbMode) =>
        fetchData({ companyId: c.id, apiBase: c.apiBase, endpoint: 'vendas/resumo', dbMode }),

    fichaEquipe: (id, dbMode) =>
        fetchData({ companyId: c.id, apiBase: c.apiBase, endpoint: `equipe/${id}`, dbMode }),
};
