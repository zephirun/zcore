/**
 * Insights Engine - Automated Data Analysis
 * Analyzes sales data to detect patterns, trends, and anomalies
 */

/**
 * Generate all insights from sales data
 * @param {Array} currentData - Current period sales data
 * @param {Array} previousData - Previous period sales data (for comparison)
 * @returns {Object} Categorized insights
 */
export const generateInsights = (currentData, previousData = []) => {
    const insights = {
        critical: [],
        warning: [],
        positive: [],
        informational: []
    };

    if (!currentData || currentData.length === 0) {
        return insights;
    }

    // Customer-level insights
    const customerInsights = analyzeCustomers(currentData, previousData);
    const salespersonInsights = analyzeSalespeople(currentData, previousData);

    // Categorize insights by severity
    [...customerInsights, ...salespersonInsights].forEach(insight => {
        insights[insight.severity].push(insight);
    });

    return insights;
};

/**
 * Analyze customer-level patterns
 */
const analyzeCustomers = (currentData, previousData) => {
    const insights = [];
    const customerMap = new Map();
    const previousCustomerMap = new Map();

    // Build current period customer map
    currentData.forEach(row => {
        const clientName = row.client?.name || 'Desconhecido';
        if (!customerMap.has(clientName)) {
            customerMap.set(clientName, {
                name: clientName,
                vendor: row.client?.vendor || '',
                revenue: 0,
                margin: 0,
                term: 0,
                count: 0
            });
        }
        const customer = customerMap.get(clientName);
        customer.revenue += row.total?.amount || 0;
        customer.margin += (row.total?.margin_percent || 0) * (row.total?.amount || 0);
        customer.term += row.total?.deadline || 0;
        customer.count += 1;
    });

    // Build previous period customer map
    previousData.forEach(row => {
        const clientName = row.client?.name || 'Desconhecido';
        if (!previousCustomerMap.has(clientName)) {
            previousCustomerMap.set(clientName, {
                revenue: 0,
                margin: 0,
                term: 0,
                count: 0
            });
        }
        const customer = previousCustomerMap.get(clientName);
        customer.revenue += row.total?.amount || 0;
        customer.margin += (row.total?.margin_percent || 0) * (row.total?.amount || 0);
        customer.term += row.total?.deadline || 0;
        customer.count += 1;
    });

    // Detect churn (customers who stopped buying)
    if (previousData.length > 0) {
        previousCustomerMap.forEach((prevCustomer, clientName) => {
            if (!customerMap.has(clientName) && prevCustomer.revenue > 0) {
                insights.push({
                    id: `churn_${clientName}`,
                    type: 'customer_churn',
                    severity: 'critical',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Cliente parou de comprar`,
                    description: `${clientName} comprou R$ ${formatNumber(prevCustomer.revenue)} no período anterior mas não comprou nada no período atual.`,
                    metrics: {
                        previous: prevCustomer.revenue,
                        current: 0,
                        change: -100,
                        trend: 'down'
                    },
                    timestamp: new Date()
                });
            }
        });
    }

    // Analyze revenue changes, margin, and term for existing customers
    customerMap.forEach((customer, clientName) => {
        const avgMargin = customer.revenue > 0 ? (customer.margin / customer.revenue) : 0;
        const avgTerm = customer.count > 0 ? (customer.term / customer.count) : 0;

        const prevCustomer = previousCustomerMap.get(clientName);

        if (prevCustomer) {
            const prevAvgMargin = prevCustomer.revenue > 0 ? (prevCustomer.margin / prevCustomer.revenue) : 0;
            const prevAvgTerm = prevCustomer.count > 0 ? (prevCustomer.term / prevCustomer.count) : 0;

            // Revenue change analysis
            const revenueChange = prevCustomer.revenue > 0
                ? ((customer.revenue - prevCustomer.revenue) / prevCustomer.revenue) * 100
                : 0;

            if (revenueChange < -30) {
                insights.push({
                    id: `revenue_drop_${clientName}`,
                    type: 'revenue_change',
                    severity: 'critical',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Queda significativa de faturamento`,
                    description: `${clientName} teve queda de ${Math.abs(revenueChange).toFixed(1)}% no faturamento (de R$ ${formatNumber(prevCustomer.revenue)} para R$ ${formatNumber(customer.revenue)}).`,
                    metrics: {
                        previous: prevCustomer.revenue,
                        current: customer.revenue,
                        change: revenueChange,
                        trend: 'down'
                    },
                    timestamp: new Date()
                });
            } else if (revenueChange > 20) {
                insights.push({
                    id: `revenue_increase_${clientName}`,
                    type: 'revenue_change',
                    severity: 'positive',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Aumento de faturamento`,
                    description: `${clientName} aumentou ${revenueChange.toFixed(1)}% no faturamento (de R$ ${formatNumber(prevCustomer.revenue)} para R$ ${formatNumber(customer.revenue)}).`,
                    metrics: {
                        previous: prevCustomer.revenue,
                        current: customer.revenue,
                        change: revenueChange,
                        trend: 'up'
                    },
                    timestamp: new Date()
                });
            }

            // Margin change analysis
            const marginChange = prevAvgMargin > 0
                ? ((avgMargin - prevAvgMargin) / prevAvgMargin) * 100
                : 0;

            if (avgMargin < 5 || marginChange < -20) {
                insights.push({
                    id: `margin_drop_${clientName}`,
                    type: 'margin_change',
                    severity: 'critical',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Margem crítica`,
                    description: `${clientName} está com margem de ${avgMargin.toFixed(1)}%${marginChange < 0 ? ` (queda de ${Math.abs(marginChange).toFixed(1)}%)` : ''}.`,
                    metrics: {
                        previous: prevAvgMargin,
                        current: avgMargin,
                        change: marginChange,
                        trend: marginChange < 0 ? 'down' : 'stable'
                    },
                    timestamp: new Date()
                });
            } else if (marginChange < -15) {
                insights.push({
                    id: `margin_warning_${clientName}`,
                    type: 'margin_change',
                    severity: 'warning',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Queda de margem`,
                    description: `${clientName} teve queda de ${Math.abs(marginChange).toFixed(1)}% na margem (de ${prevAvgMargin.toFixed(1)}% para ${avgMargin.toFixed(1)}%).`,
                    metrics: {
                        previous: prevAvgMargin,
                        current: avgMargin,
                        change: marginChange,
                        trend: 'down'
                    },
                    timestamp: new Date()
                });
            } else if (marginChange > 15) {
                insights.push({
                    id: `margin_increase_${clientName}`,
                    type: 'margin_change',
                    severity: 'positive',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Melhoria de margem`,
                    description: `${clientName} melhorou a margem em ${marginChange.toFixed(1)}% (de ${prevAvgMargin.toFixed(1)}% para ${avgMargin.toFixed(1)}%).`,
                    metrics: {
                        previous: prevAvgMargin,
                        current: avgMargin,
                        change: marginChange,
                        trend: 'up'
                    },
                    timestamp: new Date()
                });
            }

            // Payment term change analysis
            const termChange = Math.abs(avgTerm - prevAvgTerm);

            if (termChange > 15) {
                insights.push({
                    id: `term_change_${clientName}`,
                    type: 'term_change',
                    severity: avgTerm > prevAvgTerm ? 'warning' : 'informational',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Mudança no prazo médio`,
                    description: `${clientName} ${avgTerm > prevAvgTerm ? 'aumentou' : 'reduziu'} o prazo médio em ${termChange.toFixed(0)} dias (de ${prevAvgTerm.toFixed(0)} para ${avgTerm.toFixed(0)} dias).`,
                    metrics: {
                        previous: prevAvgTerm,
                        current: avgTerm,
                        change: avgTerm - prevAvgTerm,
                        trend: avgTerm > prevAvgTerm ? 'up' : 'down'
                    },
                    timestamp: new Date()
                });
            }
        } else {
            // No previous data - analyze current state only
            // Check for low margins
            if (avgMargin < 5) {
                insights.push({
                    id: `margin_low_${clientName}`,
                    type: 'margin_change',
                    severity: 'critical',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Margem crítica`,
                    description: `${clientName} está operando com margem de apenas ${avgMargin.toFixed(1)}%.`,
                    metrics: {
                        current: avgMargin,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            } else if (avgMargin < 10) {
                insights.push({
                    id: `margin_warning_${clientName}`,
                    type: 'margin_change',
                    severity: 'warning',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Margem baixa`,
                    description: `${clientName} está com margem de ${avgMargin.toFixed(1)}%.`,
                    metrics: {
                        current: avgMargin,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            } else if (avgMargin > 25) {
                insights.push({
                    id: `margin_high_${clientName}`,
                    type: 'margin_change',
                    severity: 'positive',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Excelente margem`,
                    description: `${clientName} está com margem de ${avgMargin.toFixed(1)}%.`,
                    metrics: {
                        current: avgMargin,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            }

            // Check for high revenue
            if (customer.revenue > 100000) {
                insights.push({
                    id: `revenue_high_${clientName}`,
                    type: 'revenue_change',
                    severity: 'informational',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Cliente de alto valor`,
                    description: `${clientName} gerou R$ ${formatNumber(customer.revenue)} em faturamento.`,
                    metrics: {
                        current: customer.revenue,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            }

            // Check for long payment terms
            if (avgTerm > 60) {
                insights.push({
                    id: `term_long_${clientName}`,
                    type: 'term_change',
                    severity: 'warning',
                    entity: 'customer',
                    entityName: clientName,
                    title: `Prazo de pagamento longo`,
                    description: `${clientName} está com prazo médio de ${avgTerm.toFixed(0)} dias.`,
                    metrics: {
                        current: avgTerm,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            }
        }
    });

    return insights;
};

/**
 * Analyze salesperson-level patterns
 */
const analyzeSalespeople = (currentData, previousData) => {
    const insights = [];
    const vendorMap = new Map();
    const previousVendorMap = new Map();

    // Build current period vendor map
    currentData.forEach(row => {
        const vendorName = row.client?.vendor || 'Desconhecido';
        if (!vendorMap.has(vendorName)) {
            vendorMap.set(vendorName, {
                name: vendorName,
                revenue: 0,
                margin: 0,
                term: 0,
                customers: new Set(),
                count: 0
            });
        }
        const vendor = vendorMap.get(vendorName);
        vendor.revenue += row.total?.amount || 0;
        vendor.margin += (row.total?.margin_percent || 0) * (row.total?.amount || 0);
        vendor.term += row.total?.deadline || 0;
        vendor.customers.add(row.client?.name || '');
        vendor.count += 1;
    });

    // Build previous period vendor map
    previousData.forEach(row => {
        const vendorName = row.client?.vendor || 'Desconhecido';
        if (!previousVendorMap.has(vendorName)) {
            previousVendorMap.set(vendorName, {
                revenue: 0,
                margin: 0,
                term: 0,
                customers: new Set(),
                count: 0
            });
        }
        const vendor = previousVendorMap.get(vendorName);
        vendor.revenue += row.total?.amount || 0;
        vendor.margin += (row.total?.margin_percent || 0) * (row.total?.amount || 0);
        vendor.term += row.total?.deadline || 0;
        vendor.customers.add(row.client?.name || '');
        vendor.count += 1;
    });

    // Analyze vendor performance
    vendorMap.forEach((vendor, vendorName) => {
        const avgMargin = vendor.revenue > 0 ? (vendor.margin / vendor.revenue) : 0;
        const prevVendor = previousVendorMap.get(vendorName);

        if (prevVendor) {
            const prevAvgMargin = prevVendor.revenue > 0 ? (prevVendor.margin / prevVendor.revenue) : 0;

            // Revenue change
            const revenueChange = prevVendor.revenue > 0
                ? ((vendor.revenue - prevVendor.revenue) / prevVendor.revenue) * 100
                : 0;

            if (revenueChange < -25) {
                insights.push({
                    id: `vendor_revenue_drop_${vendorName}`,
                    type: 'revenue_change',
                    severity: 'warning',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Queda de performance`,
                    description: `Vendedor ${vendorName} teve queda de ${Math.abs(revenueChange).toFixed(1)}% no faturamento.`,
                    metrics: {
                        previous: prevVendor.revenue,
                        current: vendor.revenue,
                        change: revenueChange,
                        trend: 'down'
                    },
                    timestamp: new Date()
                });
            } else if (revenueChange > 25) {
                insights.push({
                    id: `vendor_revenue_increase_${vendorName}`,
                    type: 'revenue_change',
                    severity: 'positive',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Excelente performance`,
                    description: `Vendedor ${vendorName} aumentou ${revenueChange.toFixed(1)}% no faturamento.`,
                    metrics: {
                        previous: prevVendor.revenue,
                        current: vendor.revenue,
                        change: revenueChange,
                        trend: 'up'
                    },
                    timestamp: new Date()
                });
            }

            // Customer retention
            const customersLost = [...prevVendor.customers].filter(c => !vendor.customers.has(c)).length;
            const customersGained = [...vendor.customers].filter(c => !prevVendor.customers.has(c)).length;

            if (customersLost > 2) {
                insights.push({
                    id: `vendor_churn_${vendorName}`,
                    type: 'customer_churn',
                    severity: 'warning',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Perda de clientes`,
                    description: `Vendedor ${vendorName} perdeu ${customersLost} cliente(s) neste período.`,
                    metrics: {
                        previous: prevVendor.customers.size,
                        current: vendor.customers.size,
                        change: customersLost,
                        trend: 'down'
                    },
                    timestamp: new Date()
                });
            }

            if (customersGained > 2) {
                insights.push({
                    id: `vendor_growth_${vendorName}`,
                    type: 'customer_growth',
                    severity: 'positive',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Novos clientes`,
                    description: `Vendedor ${vendorName} conquistou ${customersGained} novo(s) cliente(s).`,
                    metrics: {
                        previous: prevVendor.customers.size,
                        current: vendor.customers.size,
                        change: customersGained,
                        trend: 'up'
                    },
                    timestamp: new Date()
                });
            }

            // Margin management
            const marginChange = prevAvgMargin > 0
                ? ((avgMargin - prevAvgMargin) / prevAvgMargin) * 100
                : 0;

            if (marginChange < -15) {
                insights.push({
                    id: `vendor_margin_drop_${vendorName}`,
                    type: 'margin_change',
                    severity: 'warning',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Queda na margem`,
                    description: `Vendedor ${vendorName} teve queda de ${Math.abs(marginChange).toFixed(1)}% na margem média.`,
                    metrics: {
                        previous: prevAvgMargin,
                        current: avgMargin,
                        change: marginChange,
                        trend: 'down'
                    },
                    timestamp: new Date()
                });
            }
        } else {
            // No previous data - analyze current state only
            // Check for low margins
            if (avgMargin < 10) {
                insights.push({
                    id: `vendor_margin_low_${vendorName}`,
                    type: 'margin_change',
                    severity: 'warning',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Margem baixa`,
                    description: `Vendedor ${vendorName} está com margem média de ${avgMargin.toFixed(1)}%.`,
                    metrics: {
                        current: avgMargin,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            } else if (avgMargin > 25) {
                insights.push({
                    id: `vendor_margin_high_${vendorName}`,
                    type: 'margin_change',
                    severity: 'positive',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Excelente margem`,
                    description: `Vendedor ${vendorName} está mantendo margem média de ${avgMargin.toFixed(1)}%.`,
                    metrics: {
                        current: avgMargin,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            }

            // Check for high revenue
            if (vendor.revenue > 200000) {
                insights.push({
                    id: `vendor_revenue_high_${vendorName}`,
                    type: 'revenue_change',
                    severity: 'positive',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Alto faturamento`,
                    description: `Vendedor ${vendorName} gerou R$ ${formatNumber(vendor.revenue)} em faturamento.`,
                    metrics: {
                        current: vendor.revenue,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            }

            // Check for customer base
            if (vendor.customers.size > 10) {
                insights.push({
                    id: `vendor_customers_many_${vendorName}`,
                    type: 'customer_growth',
                    severity: 'informational',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Base ampla de clientes`,
                    description: `Vendedor ${vendorName} atende ${vendor.customers.size} clientes.`,
                    metrics: {
                        current: vendor.customers.size,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            } else if (vendor.customers.size <= 3) {
                insights.push({
                    id: `vendor_customers_few_${vendorName}`,
                    type: 'customer_growth',
                    severity: 'warning',
                    entity: 'salesperson',
                    entityName: vendorName,
                    title: `Base limitada de clientes`,
                    description: `Vendedor ${vendorName} atende apenas ${vendor.customers.size} cliente(s).`,
                    metrics: {
                        current: vendor.customers.size,
                        trend: 'stable'
                    },
                    timestamp: new Date()
                });
            }
        }
    });

    return insights;
};

/**
 * Helper: Format number to Brazilian currency
 */
const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

/**
 * Get insight icon based on severity
 */
export const getInsightIcon = (severity) => {
    switch (severity) {
        case 'critical': return '🔴';
        case 'warning': return '🟡';
        case 'positive': return '🟢';
        case 'informational': return 'ℹ️';
        default: return '📊';
    }
};

/**
 * Get insight color based on severity
 */
export const getInsightColor = (severity) => {
    switch (severity) {
        case 'critical': return '#EF4444';
        case 'warning': return '#F59E0B';
        case 'positive': return '#10B981';
        case 'informational': return '#3B82F6';
        default: return '#6B7280';
    }
};
