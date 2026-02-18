# Guia de Integração: n8n + Oracle API + Supabase

Este guia explica como configurar o fluxo de automação para sincronizar dados do Banco Oracle com o sistema Zeph (Supabase).

## Passo 1: Importar o Workflow
1. Abra seu n8n.
2. Clique em **Workflows** -> **Import from File**.
3. Selecione o arquivo `n8n_oracle_supabase_workflow.json` localizado na raiz deste projeto.

## Passo 2: Configurar Credenciais
### Supabase
No nó "Sincronizar Supabase", você precisará criar uma nova credencial:
- **Host**: `https://vxnmgyrnzsvrdlbgmjnq.supabase.co`
- **API Key**: Use a chave SERVICE_ROLE ou ANON_KEY encontrada no seu arquivo `.env.local`.

### Oracle Gateway
O nó "Buscar Dados Oracle" já aponta para `http://localhost:3000/api/query`. Certifique-se de que o servidor `oracle-api` esteja rodando (use `npm run dev` dentro da pasta `oracle-api`).

## Passo 3: Ajustar a Query SQL
No nó "Buscar Dados Oracle", você pode ajustar a query SQL para buscar exatamente o que precisa:
```sql
SELECT * FROM VENDAS WHERE DATA_VENDA >= TRUNC(SYSDATE, 'YEAR')
```

## Passo 4: Ativar o Workflow
Clique no botão **Execute Workflow** para testar manualmente. Se tudo estiver correto, ative o botão **Active** para sincronização automática horária.
