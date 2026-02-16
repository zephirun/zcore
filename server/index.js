import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database initialization
let db;
(async () => {
    db = await open({
        filename: path.join(__dirname, 'data', 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Create Tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            name TEXT,
            allowedUnit TEXT,
            allowedModules TEXT
        );

        CREATE TABLE IF NOT EXISTS sales_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unit TEXT,
            data JSON,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Insert default admin if not exists
    const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
    if (!adminExists) {
        await db.run(
            'INSERT INTO users (username, password, role, name, allowedUnit, allowedModules) VALUES (?, ?, ?, ?, ?, ?)',
            ['admin', '123', 'admin', 'Administrador', null, JSON.stringify(['sales-analysis'])]
        );
    }

    console.log('✅ SQLite Database & Tables Ready');
})();

// --- USER API ---

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.all('SELECT * FROM users');
        const formattedUsers = users.map(u => ({
            ...u,
            allowedModules: JSON.parse(u.allowedModules || '[]'),
            allowedUnit: u.allowedUnit === 'null' ? null : u.allowedUnit
        }));
        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create user
app.post('/api/users', async (req, res) => {
    const { name, username, password, role, allowedUnit, allowedModules } = req.body;
    try {
        await db.run(
            'INSERT INTO users (name, username, password, role, allowedUnit, allowedModules) VALUES (?, ?, ?, ?, ?, ?)',
            [name, username, password, role, allowedUnit, JSON.stringify(allowedModules || [])]
        );
        res.json({ success: true });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Usuário já existe' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Update user
app.put('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    const { name, role, allowedUnit, allowedModules, password } = req.body;
    try {
        if (password) {
            await db.run(
                'UPDATE users SET name = ?, role = ?, allowedUnit = ?, allowedModules = ?, password = ? WHERE username = ?',
                [name, role, allowedUnit, JSON.stringify(allowedModules), password, username]
            );
        } else {
            await db.run(
                'UPDATE users SET name = ?, role = ?, allowedUnit = ?, allowedModules = ? WHERE username = ?',
                [name, role, allowedUnit, JSON.stringify(allowedModules), username]
            );
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user
app.delete('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    try {
        await db.run('DELETE FROM users WHERE username = ?', [username]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login check
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (user) {
            res.json({
                success: true,
                user: {
                    ...user,
                    allowedModules: JSON.parse(user.allowedModules || '[]'),
                    allowedUnit: user.allowedUnit === 'null' ? null : user.allowedUnit
                }
            });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SALES DATA API ---

// Get Sales Data
app.get('/api/sales-data', async (req, res) => {
    const unit = req.query.unit || 'madville';
    try {
        const row = await db.get('SELECT data FROM sales_data WHERE unit = ? ORDER BY updated_at DESC LIMIT 1', [unit]);
        res.json(row ? JSON.parse(row.data) : []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save Sales Data
app.post('/api/sales-data', async (req, res) => {
    const { data, unit } = req.body;
    const targetUnit = unit || 'madville';

    try {
        // Upsert logic: delete old, insert new (or just insert new if we want history)
        // For now, let's keep only the latest per unit to save space, or just always insert.
        // The user said "register all", so maybe history is good.
        await db.run('INSERT INTO sales_data (unit, data) VALUES (?, ?)', [targetUnit, JSON.stringify(data)]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear Data
app.post('/api/clear-data', async (req, res) => {
    const { unit } = req.body;
    try {
        await db.run('DELETE FROM sales_data WHERE unit = ?', [unit]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- STATIC FILES (React Build) ---

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '../dist')));

// SPA Catch-all: Send index.html for any request that doesn't match an API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Unified Production Server running on port ${PORT}`);
});

