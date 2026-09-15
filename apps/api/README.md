# Atas e Lucros API

BFF HTTP em Next.js App Router. O serviço concentra as regras e transições de movimentações; persistência é acessada somente pela interface de repositório.

## Executar

Na raiz do workspace:

```powershell
npm install
npm run env:init
npm run extract:legacy-data
npm run dev
```

O servidor escuta em `http://127.0.0.1:3011`. O mesmo comando inicia o frontend Vite em `http://127.0.0.1:5174`.

## Variáveis de ambiente

Existe somente um `.env`, na raiz do monorepo:

- `API_PORT`: porta do Next.
- `WEB_PORT`: porta do Vite e origem usada no CORS local.
- `API_CORS_ALLOWED_ORIGINS`: origens HTTP(S) separadas por vírgula; não aceita `*`.
- `PROFIT_MOVEMENTS_FILE`: caminho do armazenamento local de desenvolvimento, relativo à raiz.
- `VITE_API_URL`: URL pública opcional; vazia usa o proxy do Vite.

## Endpoints

- `GET /api/v1/health`: health check público.
- `GET /api/v1/origins`: lê o dataset extraído somente em desenvolvimento.
- `GET /api/v1/movements`: lista o histórico persistido.
- `POST /api/v1/movements/preview`: calcula e valida o impacto sem persistir.
- `POST /api/v1/movements`: valida e registra uma distribuição.
- `POST /api/v1/movements/{id}/reversal`: estorna preservando auditoria.
- `DELETE /api/v1/movements`: limpa o armazenamento de desenvolvimento.
- `POST /api/v1/movements/import`: migra, de forma idempotente, o histórico da versão local anterior.

Origens e movimentações retornam `503` em produção até existir Auth, schema de banco e políticas RLS. O dataset local é excluído do trace de produção. Toda resposta inclui `x-request-id`; erros seguem `docs/openapi.yaml`.

## Persistência

`FileMovementRepository` é exclusivo do desenvolvimento. Ele serializa alterações concorrentes e troca o arquivo por rename atômico. O futuro adaptador do banco deve implementar `MovementRepository` sem mover validações ou transições para SQL, triggers ou procedures.

## Verificação

```powershell
npm run lint --workspace @pomin/profit-api
npm run typecheck --workspace @pomin/profit-api
npm test --workspace @pomin/profit-api
npm run build --workspace @pomin/profit-api
```
