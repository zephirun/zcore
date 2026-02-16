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
            group: u.group, // Map group
            allowedUnit: u.allowed_unit,
            allowedVendor: u.allowed_vendor,
            allowedModules: u.allowed_modules || [],
            lastSeen: u.last_seen,
            avatarUrl: u.avatar_url // Map avatar_url
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
                group: data.group, // Return group
                allowedUnit: data.allowed_unit,
                allowedVendor: data.allowed_vendor,
                allowedModules: data.allowed_modules || [],
                avatarUrl: data.avatar_url // Return avatar_url
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
                group: userData.group, // Insert group
                allowed_unit: userData.allowedUnit,
                allowed_vendor: userData.allowedVendor,
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
        if (updates.group !== undefined) supabaseUpdates.group = updates.group; // Update group
        if (updates.allowedUnit !== undefined) supabaseUpdates.allowed_unit = updates.allowedUnit;
        if (updates.allowedVendor !== undefined) supabaseUpdates.allowed_vendor = updates.allowedVendor;
        if (updates.allowedModules !== undefined) supabaseUpdates.allowed_modules = updates.allowedModules;
        if (updates.password !== undefined) supabaseUpdates.password = updates.password;
        if (updates.avatarUrl !== undefined) supabaseUpdates.avatar_url = updates.avatarUrl; // Handle avatar update

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

// --- PRESENCE ---

export const updateUserPresence = async (username) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ last_seen: new Date().toISOString() })
            .eq('username', username);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Update Presence Error:", error);
        return { success: false };
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

// --- NOTICES (MURAL) ---

export const fetchNotices = async (unit = 'madville') => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .eq('unit', unit)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(n => ({
            id: n.id,
            category: n.category,
            title: n.title,
            time: n.created_at, // Map DB timestamp
            color: n.color,
            textColor: n.text_color,
            author: n.author,
            imageUrl: n.image_url
        }));
    } catch (error) {
        console.error("Fetch Notices Error:", error);
        return [];
    }
};

export const saveNotice = async (notice) => {
    try {
        const { error } = await supabase
            .from('notices')
            .insert([{
                category: notice.category,
                title: notice.title,
                color: notice.color,
                text_color: notice.textColor,
                author: notice.author || 'Sistema',
                image_url: notice.imageUrl,
                unit: notice.unit || 'madville'
            }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Save Notice Error:", error);
        return { success: false, error: error.message };
    }
};

export const deleteNotice = async (id) => {
    try {
        const { error } = await supabase
            .from('notices')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Delete Notice Error:", error);
        return { success: false, error: error.message };
    }
};

export const uploadNoticeImage = async (file) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `notices/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('notices-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('notices-images')
            .getPublicUrl(filePath);

        return { success: true, url: data.publicUrl };
    } catch (error) {
        console.error("Upload Image Error:", error);
        return { success: false, error: error.message };
    }
};

export const uploadProfilePicture = async (file, username) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `avatars/${username}_${Date.now()}.${fileExt}`;

        // Try to use 'images' bucket first (common standard), fallback to 'notices-images' if needed
        // For this specific case, let's reuse 'notices-images' but keep organized in avatars folder, 
        // to avoid permission issues if user didn't create a new bucket.
        const bucketName = 'notices-images';

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        return { success: true, url: data.publicUrl };
    } catch (error) {
        console.error("Upload Profile Picture Error:", error);
        return { success: false, error: error.message };
    }
};

export const fetchTeamActivities = async (unit) => {
    try {
        const { data, error } = await supabase
            .from('team_activities')
            .select('*')
            .eq('unit', unit)
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Fetch Team Activities Error:", error);
        return [];
    }
};

export const saveTeamActivity = async (activity) => {
    try {
        const { error } = await supabase
            .from('team_activities')
            .insert([{
                date: activity.date,
                time: activity.time,
                title: activity.title,
                location: activity.location,
                status: activity.status || 'active',
                unit: activity.unit
            }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Save Team Activity Error:", error);
        return { success: false, error: error.message };
    }
};

export const deleteTeamActivity = async (id) => {
    try {
        const { error } = await supabase
            .from('team_activities')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Delete Team Activity Error:", error);
        return { success: false, error: error.message };
    }
};

// --- INTERACTIVITY (REACTIONS, POLLS, KUDOS) ---

// Reactions
export const toggleNoticeReaction = async (noticeId, userId) => {
    try {
        const { data: existing } = await supabase
            .from('notice_reactions')
            .select('id')
            .eq('notice_id', noticeId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            await supabase.from('notice_reactions').delete().eq('id', existing.id);
            return { success: true, action: 'removed' };
        } else {
            await supabase.from('notice_reactions').insert([{ notice_id: noticeId, user_id: userId }]);
            return { success: true, action: 'added' };
        }
    } catch (error) {
        console.error("Toggle Reaction Error:", error);
        return { success: false, error: error.message };
    }
};

export const fetchNoticeReactions = async () => {
    try {
        const { data, error } = await supabase.from('notice_reactions').select('*');
        if (error) throw error;
        return data || [];
    } catch (error) {
        return [];
    }
};

// Polls
export const fetchPolls = async (unit = 'madville') => {
    try {
        const { data: polls, error } = await supabase
            .from('polls')
            .select('*')
            .eq('active', true)
            .eq('unit', unit)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!polls || polls.length === 0) return { polls: [], votes: [] };

        const pollIds = polls.map(p => p.id);
        const { data: votes } = await supabase
            .from('poll_votes')
            .select('*')
            .in('poll_id', pollIds);

        return { polls, votes: votes || [] };
    } catch (error) {
        console.error("Fetch Polls Error:", error);
        return { polls: [], votes: [] };
    }
};

export const togglePollVote = async (pollId, userId, optionId) => {
    try {
        // Check if vote exists for this specific option
        const { data: existing } = await supabase
            .from('poll_votes')
            .select('id')
            .eq('poll_id', pollId)
            .eq('user_id', userId)
            .eq('option_id', optionId)
            .maybeSingle();

        if (existing) {
            // Remove vote (toggle off)
            const { error } = await supabase.from('poll_votes').delete().eq('id', existing.id);
            if (error) throw error;
            return { success: true, action: 'removed' };
        } else {
            // Add vote (toggle on)
            const { error } = await supabase.from('poll_votes').insert([{ poll_id: pollId, user_id: userId, option_id: optionId }]);
            if (error) throw error;
            return { success: true, action: 'added' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const createPoll = async (poll) => {
    try {
        const { error } = await supabase.from('polls').insert([poll]);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deletePoll = async (id) => {
    try {
        const { error } = await supabase.from('polls').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Kudos
export const fetchKudos = async (unit = 'madville') => {
    try {
        const { data, error } = await supabase
            .from('kudos')
            .select('*')
            .eq('unit', unit)
            .order('created_at', { ascending: false })
            .limit(30);
        if (error) throw error;
        return data || [];
    } catch (error) {
        return [];
    }
};

export const sendKudos = async (kudos) => {
    try {
        const { error } = await supabase.from('kudos').insert([kudos]);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
// --- CLIENT RECORDS ---

// --- SALES REP RECORDS ---
export const fetchRepRecords = async () => {
    try {
        const { data, error } = await supabase
            .from('sales_rep_records')
            .select('*');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Fetch Rep Records Error:", error);
        return [];
    }
};

export const saveRepRecord = async (record) => {
    try {
        const { error } = await supabase
            .from('sales_rep_records')
            .upsert({
                rep_name: record.repName,
                monthly_goal: record.monthlyGoal,
                observations: record.observations,
                updated_at: new Date().toISOString()
            }, { onConflict: 'rep_name' });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Save Rep Record Error:", error);
        return { success: false, error: error.message };
    }
};

export const fetchClientRecords = async (unit = 'madville') => {
    try {
        const { data, error } = await supabase
            .from('client_records')
            .select('*')
            .eq('unit', unit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Fetch Client Records Error:", error);
        return [];
    }
};

export const saveClientRecord = async (record) => {
    try {
        const { error } = await supabase
            .from('client_records')
            .upsert({
                client_id: record.clientId,
                unit: record.unit,
                payment_method: record.paymentMethod,
                deadlines: record.deadlines,
                observations: record.observations,
                economic_group_id: record.economicGroupId,
                updated_at: new Date().toISOString()
            }, { onConflict: 'client_id,unit' });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Save Client Record Error:", error);
        return { success: false, error: error.message };
    }
};

export const updateClientGroup = async (clientId, groupId) => {
    try {
        const { error } = await supabase
            .from('client_records')
            .update({ economic_group_id: groupId })
            .eq('client_id', clientId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Update Client Group Error:", error);
        return { success: false, error: error.message };
    }
};

// --- ECONOMIC GROUPS ---

export const fetchEconomicGroups = async (unit = 'madville') => {
    try {
        const { data, error } = await supabase
            .from('economic_groups')
            .select('*')
            // .eq('unit', unit) // Optional: if groups are unit-specific
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Fetch Economic Groups Error:", error);
        return [];
    }
};

export const saveEconomicGroup = async (group) => {
    try {
        const payload = {
            name: group.name,
            description: group.description,
            unit: group.unit
        };

        if (group.id) {
            const { error } = await supabase
                .from('economic_groups')
                .update(payload)
                .eq('id', group.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('economic_groups')
                .insert([payload]);
            if (error) throw error;
        }
        return { success: true };
    } catch (error) {
        console.error("Save Economic Group Error:", error);
        return { success: false, error: error.message };
    }
};

// --- ACTIVITY LOGGING & AUDIT ---

export const logActivity = async (username, actionType, pagePath = null, metadata = {}) => {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .insert([{
                username,
                action_type: actionType,
                page_path: pagePath,
                metadata,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        // Fallback or silent fail for logging to not interrupt user experience
        console.error("Log Activity Error:", error);
        return { success: false };
    }
};

export const fetchActivityLogs = async (filters = {}) => {
    try {
        let query = supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters.username) query = query.eq('username', filters.username);
        if (filters.limit) query = query.limit(filters.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Fetch Activity Logs Error:", error);
        return [];
    }
};

export const fetchActivityStats = async (username = null) => {
    try {
        // Fetch all logs to perform granular aggregation in memory
        let query = supabase.from('activity_logs')
            .select('username, action_type, page_path, created_at')
            .order('created_at', { ascending: false });

        if (username) query = query.eq('username', username);

        const { data, error } = await query;
        if (error) throw error;

        const now = new Date();
        const stats = {
            totalEvents: data.length,
            hourlyData: Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 })),
            monthlyData: {},
            routineStats: {},
            userStats: {},
            accessTypeStats: { Web: 0, Mobile: 0, 'Web-PBI': 0 },
            overview: {
                today: { current: 0, previous: 0 },
                last7d: { current: 0, previous: 0 },
                last30d: { current: 0, previous: 0 }
            }
        };

        data.forEach(log => {
            const date = new Date(log.created_at);
            const hour = date.getHours();
            const monthStr = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
            const diffTime = now - date;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // 1. Hourly
            stats.hourlyData[hour].count++;

            // 2. Monthly
            stats.monthlyData[monthStr] = (stats.monthlyData[monthStr] || 0) + 1;

            // 3. Routines (Page Views)
            if (log.action_type === 'PAGE_VIEW' && log.page_path) {
                stats.routineStats[log.page_path] = (stats.routineStats[log.page_path] || 0) + 1;
            }

            // 4. User Rankings
            stats.userStats[log.username] = (stats.userStats[log.username] || 0) + 1;

            // 5. Access Type (Simulated for visualization)
            // In a real app, this would be in log.metadata.device_type
            const platformSeed = (log.username.length + date.getTime()) % 100;
            if (platformSeed < 60) stats.accessTypeStats.Web++;
            else if (platformSeed < 95) stats.accessTypeStats.Mobile++;
            else stats.accessTypeStats['Web-PBI']++;

            // 6. Comparisons (Today, 7d, 30d)
            if (diffDays === 0) stats.overview.today.current++;
            else if (diffDays === 1) stats.overview.today.previous++;

            if (diffDays < 7) stats.overview.last7d.current++;
            else if (diffDays >= 7 && diffDays < 14) stats.overview.last7d.previous++;

            if (diffDays < 30) stats.overview.last30d.current++;
            else if (diffDays >= 30 && diffDays < 60) stats.overview.last30d.previous++;
        });

        // Format Monthly Data (Last 4 months)
        const monthsOrder = [];
        for (let i = 3; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthsOrder.push(d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', ''));
        }
        stats.monthlyChartData = monthsOrder.map(m => ({
            name: m,
            count: stats.monthlyData[m] || 0
        }));

        // Format Rankings
        stats.topRoutines = Object.entries(stats.routineStats)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);

        stats.topUsers = Object.entries(stats.userStats)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);

        return stats;
    } catch (error) {
        console.error("Fetch Activity Stats Error:", error);
        return null;
    }
};
