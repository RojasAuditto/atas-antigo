# ADR 0001 — Next.js como BFF API-only

- Status: aceito
- Data: 2026-09-01

## Contexto

O padrão de `soul/arch.md` usa Supabase PostgREST e Edge Functions. Este projeto exige Vite no frontend e Next.js no backend. A instrução direta define uma exceção arquitetural, sem relaxar as regras de segurança de `soul/constitution.md`.

O projeto ainda não possui banco, autenticação ou persistência. O dataset local contém dados que não podem ser publicados sem autorização e RLS.

## Decisão

Usar Next.js 16 App Router somente como BFF HTTP em `apps/api`, com recursos versionados em `/api/v1`. O workspace usa React 19.2, inclusive como peer do Next, em vez do React 18 indicado na referência original.

Essa exceção de versão é necessária para aplicar as correções de segurança disponíveis: a auditoria do Next 15 encontrou vulnerabilidade alta em sua dependência de PostCSS, cuja correção suportada exige Next 16. Manter uma única versão de React no workspace também evita tipos e runtimes duplicados.

- TypeScript estrito e Zod nas fronteiras de configuração e dados.
- Respostas de sucesso em `{ data, meta: { requestId } }`.
- Erros em `{ error: { code, message, details? }, requestId }`.
- `x-request-id` validado ou gerado por requisição.
- CORS por allowlist exata em `API_CORS_ALLOWED_ORIGINS`; curingas não são aceitos.
- Logs de falhas inesperadas contêm somente metadados técnicos, nunca payload, token, nome, documento ou outro PII.
- `GET /api/v1/health` permanece público.
- `GET /api/v1/origins` lê `src/data/profit-data.json` somente em desenvolvimento.
- Em produção, `/origins` retorna `503 ORIGINS_UNAVAILABLE` antes de carregar ou devolver o dataset.
- `outputFileTracingExcludes` impede que o dataset local seja anexado ao artefato de produção do Next.
- Não criar banco, autenticação, persistência, ORM nem rotas CRUD nesta etapa.

## Consequências

- O frontend pode integrar o contrato HTTP sem acoplar-se ao arquivo HTML legado.
- As origens de desenvolvimento são substituíveis pela extração do dataset atual sem mudar a rota.
- Produção não oferece as origens até existir Supabase Auth, propagação do JWT do usuário e políticas RLS verificadas.
- A introdução futura de Supabase exige novo ADR ou atualização deste, testes de autorização e revisão do contrato OpenAPI.
- O runtime de produção precisa executar Node.js para o BFF, além do container estático do frontend Vite.
- Atualizações de Next/React permanecem condicionadas ao pipeline completo e à análise de segurança de dependências.
