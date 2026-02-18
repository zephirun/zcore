
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Falha ao carregar variáveis de ambiente. Verifique o arquivo .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('🔒 Iniciando migração de senhas para hash...');

    // 1. Buscar todos os usuários
    const { data: users, error } = await supabase
        .from('users')
        .select('id, username, password');

    if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        return;
    }

    console.log(`📋 Encontrados ${users.length} usuários.`);

    let updatedCount = 0;

    for (const user of users) {
        // Verificar se a senha já parece ser um hash (começa com $2a$, $2b$ ou $2y$ e tem 60 caracteres)
        if (user.password && user.password.length === 60 && user.password.startsWith('$2')) {
            console.log(`⏭️ Usuário ${user.username} já possui senha hash. Pulando.`);
            continue;
        }

        if (!user.password) {
            console.log(`⚠️ Usuário ${user.username} não possui senha. Pulando.`);
            continue;
        }

        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Atualizar no banco
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', user.id);

        if (updateError) {
            console.error(`❌ Erro ao atualizar usuário ${user.username}:`, updateError);
        } else {
            console.log(`✅ Usuário ${user.username} atualizado com sucesso.`);
            updatedCount++;
        }
    }

    console.log(`\n🏁 Migração concluída! ${updatedCount} usuários atualizados.`);
}

migrate();
