# Histórico do Projeto Z.CORE

Este documento registra a evolução, decisões arquiteturais e marcos importantes do projeto Z.CORE.

## 2026-02-27
- **Consolidação do Histórico**: Criação deste documento para centralizar os marcos de desenvolvimento.
- **Organização de Backups**: Limpeza da raiz do projeto e centralização de backups em `/backups`.

## 2026-02-26
- **Refinamento de Layout (InfoSlide)**: Reestruturação completa do componente `InfoSlide` para uso de Grid CSS puro (2x2), otimizando a exibição em TVs 16:9.
- **Multi-Empresa no Backend**: Refatoração das rotas da API para suportar o parâmetro `:companyId`, permitindo a separação de dados entre Madville e Curitiba.
- **Estratégia de Deploy**: Definição da estratégia de ambientes (Produção vs. Desenvolvimento) no Vercel.

## 2026-02-25
- **Backup e Cleanup**: Remocão do servidor de vendas antigo, atualização de scripts de inicialização (`start_dev.sh`) e atualizações maiores de UI.
- **Multi-Empresa & DB Toggle**: Implementação do sistema de troca global de banco de dados (Oracle Live vs. Cache/Supabase) e suporte a múltiplas empresas.

## 2026-02-21
- **Migração de Workspace**: O projeto foi movido de `/home/ruanf/GMAD/Zeph` para `/home/ruanf/ZEPH/Z.CORE`.
- **Storybook**: Implementação de ambiente Storybook com Vite para documentação de componentes de UI.
- **Design Mobbin**: Aplicação de padrões minimalistas nas páginas de Menu e Dashboard Estratégico.

## 2026-02-20
- **Estabilização de Servidores**: Ajustes no Oracle API, Sales Report Server e Frontend Vite.
- **Backup Visual**: Criação de tag `v-backup-visual-20260219-1335` antes de grandes mudanças visuais.

## 2026-02-19
- **Dashboard de Vendas**: Refinamento do dashboard e remoção de elementos legados.
- **WebOS Optimization**: Ajustes de compatibilidade para reprodução de vídeo em dispositivos WebOS.

## 2026-02-15
- **Mobile Optimization**: Melhorias na interface para dispositivos móveis e implementação de Spotlight UI.

## 2026-02-10
- **Commit Inicial**: Configuração básica do Vercel e implementação do Portal de Transportadoras.

---
*Atualizado em: 2026-02-27T00:08:00-03:00*
