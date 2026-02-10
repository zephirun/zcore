import { supabase } from './supabaseClient';

// --- SALES DATA ---

// Fetch all sales data
export const fetchSalesData = async (unit = 'madville') => {
    try {
        const { data, error } = await supabase
            .from('sales_data')
            .select('data')
            .eq('unit', unit)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data?.data || [];
    } catch (error) {
        console.error("Data Load Error:", error);
        return [];
    }
};

// Save sales data
export const saveSalesData = async (data, unit = 'madville') => {
    try {
        const { error } = await supabase
            .from('sales_data')
            .insert([{ data, unit }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Data Save Error:", error);
        return { success: false };
    }
};

// Clear data
export const clearSalesData = async (unit = 'madville') => {
    try {
        const { error } = await supabase
            .from('sales_data')
            .delete()
            .eq('unit', unit);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Data Clear Error:", error);
        return false;
    }
};

// --- USER MANAGEMENT ---

export const fetchUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) throw error;

        // Map snake_case from DB to camelCase for Frontend
        return data.map(u => ({
            id: u.id,
            username: u.username,
            password: u.password,
            role: u.role,
            name: u.name,
            allowedUnit: u.allowed_unit,
            allowedModules: u.allowed_modules || []
        }));
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return [];
    }
};

export const loginUser = async (username, password) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        return {
            success: true,
            user: {
                id: data.id,
                username: data.username,
                role: data.role,
                name: data.name,
                allowedUnit: data.allowed_unit,
                allowedModules: data.allowed_modules || []
            }
        };
    } catch (error) {
        console.error("Login Error:", error);
        return null;
    }
};

export const registerUserApi = async (userData) => {
    try {
        const { error } = await supabase
            .from('users')
            .insert([{
                name: userData.name,
                username: userData.username,
                password: userData.password,
                role: userData.role,
                allowed_unit: userData.allowedUnit,
                allowed_modules: userData.allowedModules
            }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Register User Error:", error);
        return { error: error.message };
    }
};

export const updateUserApi = async (username, updates) => {
    try {
        // Map camelCase to snake_case
        const supabaseUpdates = {};
        if (updates.name !== undefined) supabaseUpdates.name = updates.name;
        if (updates.role !== undefined) supabaseUpdates.role = updates.role;
        if (updates.allowedUnit !== undefined) supabaseUpdates.allowed_unit = updates.allowedUnit;
        if (updates.allowedModules !== undefined) supabaseUpdates.allowed_modules = updates.allowedModules;
        if (updates.password !== undefined) supabaseUpdates.password = updates.password;

        const { error } = await supabase
            .from('users')
            .update(supabaseUpdates)
            .eq('username', username);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Update User Error:", error);
        return { error: error.message };
    }
};

export const deleteUserApi = async (username) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('username', username);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Delete User Error:", error);
        return { error: error.message };
    }
};

// --- LOGISTICS (DELIVERIES) ---

export const fetchDeliveries = async (unit = 'madville') => {
    try {
        const { data, error } = await supabase
            .from('deliveries')
            .select('*')
            .eq('unit', unit)
            .order('date', { ascending: true });

        if (error) throw error;

        return data.map(d => ({
            id: d.id,
            date: d.date,
            time: d.time,
            carrier: d.carrier,
            supplier: d.supplier,
            invoiceNumber: d.invoice_number,
            quantity: d.quantity,
            volumeType: d.volume_type,
            xml: d.xml,
            observations: d.observations,
            unit: d.unit
        }));
    } catch (error) {
        console.error("Fetch Deliveries Error:", error);
        return [];
    }
};

export const saveDelivery = async (delivery) => {
    try {
        const payload = {
            date: delivery.date,
            time: delivery.time,
            carrier: delivery.carrier,
            supplier: delivery.supplier,
            invoice_number: delivery.invoiceNumber,
            quantity: parseInt(delivery.quantity),
            volume_type: delivery.volumeType,
            xml: delivery.xml,
            observations: delivery.observations,
            unit: delivery.unit || 'madville'
        };

        if (delivery.id && delivery.id.length > 20) { // UUID
            const { error } = await supabase
                .from('deliveries')
                .update(payload)
                .eq('id', delivery.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('deliveries')
                .insert([payload]);
            if (error) throw error;
        }
        return { success: true };
    } catch (error) {
        console.error("Save Delivery Error:", error);
        return { success: false, error: error.message };
    }
};

export const deleteDelivery = async (id) => {
    try {
        const { error } = await supabase
            .from('deliveries')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Delete Delivery Error:", error);
        return { success: false, error: error.message };
    }
};

// --- CUSTOMER SERVICE (RETURNS) ---

export const fetchReturns = async (unit = 'madville') => {
    try {
        const { data, error } = await supabase
            .from('returns')
            .select('*')
            .eq('unit', unit)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(r => ({
            id: r.id,
            idNota: r.id_nota,
            date: r.date,
            issueDate: r.issue_date,
            driverName: r.driver_name,
            customerName: r.customer_name,
            products: r.products,
            observations: r.observations,
            unit: r.unit,
            createdAt: r.created_at
        }));
    } catch (error) {
        console.error("Fetch Returns Error:", error);
        return [];
    }
};

export const saveReturn = async (returnData) => {
    try {
        const payload = {
            id_nota: returnData.idNota,
            date: returnData.date,
            issue_date: returnData.issueDate || null,
            driver_name: returnData.driverName,
            customer_name: returnData.customerName,
            products: returnData.products,
            observations: returnData.observations,
            unit: returnData.unit || 'madville'
        };

        if (returnData.id && returnData.id.length > 20) { // UUID
            const { error } = await supabase
                .from('returns')
                .update(payload)
                .eq('id', returnData.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('returns')
                .insert([payload]);
            if (error) throw error;
        }
        return { success: true };
    } catch (error) {
        console.error("Save Return Error:", error);
        return { success: false, error: error.message };
    }
};

export const deleteReturn = async (id) => {
    try {
        const { error } = await supabase
            .from('returns')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Delete Return Error:", error);
        return { success: false, error: error.message };
    }
};
