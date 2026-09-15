# ADR 0002 — Regras no backend e configuração única

- Status: aceito
- Data: 2026-09-14

## Contexto

A primeira versão mantinha validação, criação, estorno e persistência de movimentações no frontend. Também exigia dois processos iniciados manualmente e distribuía exemplos de ambiente entre os workspaces. Esse desenho tornava o navegador uma fonte de verdade e aumentava o risco de divergência entre clientes.

O contrato do banco de produção — tabelas, autenticação, papéis e políticas RLS — ainda não foi fornecido. Inventar esse contrato violaria as regras permanentes do projeto.

## Decisão

- Vite permanece responsável apenas pela SPA e pelo estado de interface.
- Next.js permanece API-only e passa a ser a autoridade para prévia, validação de limites, criação, estorno e reset das movimentações.
- Persistência implementa a interface `MovementRepository`; regras de negócio não dependem do mecanismo de armazenamento.
- Desenvolvimento usa um repositório de arquivo local com escrita atômica e operações serializadas.
- Produção retorna `503` para movimentações até existir um adaptador autenticado para o banco com RLS.
- O histórico do `localStorage` da versão anterior é importado uma única vez pelo backend, validado e removido do navegador somente após sucesso.
- Vite e Next carregam um único `.env` localizado na raiz do monorepo.
- `npm run dev` coordena os dois servidores e encerra o conjunto se um processo falhar.

## Consequências

- Nenhuma mutação confiável depende de regra executada no navegador.
- O banco futuro funciona como armazenamento; validações e transições permanecem no serviço de domínio do Next.
- A troca do arquivo local pelo banco não exige reimplementar regras nem alterar os componentes React.
- A API de movimentações continua bloqueada em produção até o contrato de segurança estar definido.
- Projeções, filtros, paginação e formatação usados somente para apresentação podem continuar no frontend; o backend sempre recalcula e valida valores antes de persistir.

