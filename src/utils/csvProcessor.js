// Helper to parse BRL strings "1.234,56" or "1.234,56%" -> Float
const parseBRL = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = val.replace(/[R$\s%]/g, '').replaceAll('.', '').replace(',', '.');
    return parseFloat(cleaned) || 0;
};

// Helper to clean strings: remove extra spaces, trim, normalize
const cleanStr = (str) => {
    if (!str) return '';
    return str.toString().replace(/\s+/g, ' ').trim();
};

export const processCSVData = (uploadObj) => {
    const { type, data } = uploadObj;

    // -- STRATEGY 1: USER EXPORT FORMAT (WIDE) --
    if (type === 'wide') {
        const rows = data;
        const processedRows = [];

        // Detect number of months based on column count
        // 3 months: 3 (ID, Vendor, Client) + 3*3 (metrics) = 12 columns
        // 12 months: 3 (ID, Vendor, Client) + 12*3 (metrics) = 39 columns
        const firstDataRow = rows.find(r => r[0] && cleanStr(r[0]) !== '');
        const numMonths = firstDataRow ? Math.floor((firstDataRow.length - 3) / 3) : 3;

        rows.forEach((row) => {
            // [0] ID, [1] Vendor, [2] Client
            if (!row[0] || cleanStr(row[0]) === '') return;

            const client = {
                id: cleanStr(row[0]),
                name: cleanStr(row[2]),
                vendor: cleanStr(row[1])
            };

            const createMonth = (amtIdx, margIdx, deadIdx) => {
                const amount = parseBRL(row[amtIdx]);
                const margin_percent = parseBRL(row[margIdx]);
                const deadline = parseBRL(row[deadIdx]);
                return { amount, margin_percent, deadline };
            };

            // Process all available months (3 or 12)
            const months = [];
            for (let m = 0; m < numMonths; m++) {
                const baseIdx = 3 + (m * 3);
                months.push(createMonth(baseIdx, baseIdx + 1, baseIdx + 2));
            }

            // Calculate totals for all months
            const totalAmount = months.reduce((sum, m) => sum + m.amount, 0);
            const totalMarginRev = months.reduce((sum, m) => sum + (m.margin_percent * m.amount), 0);
            const avgMargin = totalAmount ? totalMarginRev / totalAmount : 0;

            // Fix: Only count months with sales for deadline average
            const monthsWithSales = months.filter(m => m.amount > 0);
            const avgDeadline = monthsWithSales.length > 0
                ? monthsWithSales.reduce((sum, m) => sum + m.deadline, 0) / monthsWithSales.length
                : 0;

            processedRows.push({
                client,
                months, // Can be 3 or 12 months
                numMonths, // Store for reference
                total: {
                    amount: totalAmount,
                    margin_percent: avgMargin,
                    deadline: avgDeadline
                }
            });

        });

        return processedRows;
    }

    // -- STRATEGY 2: FLAT TEMPLATE --
    const clientsMap = {};
    const rows = data;

    rows.forEach((row, idx) => {
        if (idx === 0) return;
        if (!row[0]) return;
        if (row[0].toString().toUpperCase() === 'ID') return;

        const clientId = cleanStr(row[0]);
        if (!clientsMap[clientId]) {
            clientsMap[clientId] = {
                client: {
                    id: clientId,
                    name: cleanStr(row[1]),
                    vendor: cleanStr(row[2])
                },
                rawSales: []
            };
        }

        clientsMap[clientId].rawSales.push({
            date: row[3],
            amount: parseBRL(row[4]),
            margin: parseBRL(row[5]),
            deadline: parseBRL(row[6])
        });
    });

    // ... Repetitive logic for bucket aggregation (could be refactored) ...
    const reportData = Object.values(clientsMap).map(clientGroup => {
        const sales = clientGroup.rawSales;
        const months = [
            { amount: 0, margin_sum: 0, deadline_sum: 0, count: 0 },
            { amount: 0, margin_sum: 0, deadline_sum: 0, count: 0 },
            { amount: 0, margin_sum: 0, deadline_sum: 0, count: 0 }
        ];

        sales.forEach(sale => {
            const d = new Date(sale.date);
            if (isNaN(d)) return;
            const mIndex = d.getMonth() % 3;
            if (months[mIndex]) {
                months[mIndex].amount += sale.amount;
                const margVal = sale.margin < 1 ? sale.margin * 100 : sale.margin;
                months[mIndex].margin_sum += (margVal * sale.amount);
                months[mIndex].deadline_sum += sale.deadline;
                months[mIndex].count++;
            }
        });

        const finalizedMonths = months.map(m => ({
            amount: m.amount,
            margin_percent: m.amount ? (m.margin_sum / m.amount) : 0,
            deadline: m.count ? (m.deadline_sum / m.count) : 0
        }));

        const totalAmount = finalizedMonths.reduce((acc, m) => acc + m.amount, 0);
        const totalMarginRev = finalizedMonths.reduce((acc, m) => acc + (m.margin_percent * m.amount), 0);

        // Fix: Only count months with sales for deadline average
        const monthsWithSales = finalizedMonths.filter(m => m.amount > 0);
        const avgDeadline = monthsWithSales.length > 0
            ? monthsWithSales.reduce((acc, m) => acc + m.deadline, 0) / monthsWithSales.length
            : 0;

        return {
            client: clientGroup.client,
            months: finalizedMonths,
            total: {
                amount: totalAmount,
                margin_percent: totalAmount ? totalMarginRev / totalAmount : 0,
                deadline: avgDeadline
            }
        };
    });

    return reportData;
};
