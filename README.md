# Central de Distribuição de Lucros

Monorepo da Central de Distribuição de Lucros do Grupo Pomin. O frontend usa React 19.2 + Vite e o backend usa Next.js 16 como BFF/API. As regras permanentes do projeto ficam em [`soul/`](soul/).

## Estrutura

```text
apps/
├── web/   # SPA React 19.2, Vite, TypeScript, Tailwind v3
└── api/   # Next.js App Router usado apenas como API/BFF
docs/
├── adr/   # decisões arquiteturais
└── openapi.yaml
scripts/
└── extract-legacy-data.mjs
```

O protótipo original permanece em `index.html` como fonte local de migração. Ele e o JSON extraído contêm dados pessoais e estão no `.gitignore`.
Como o workspace está sob o diretório público do Wamp, o `.htaccess` também bloqueia o acesso direto do Apache ao protótipo, ao dataset extraído e a arquivos `.env`.

## Requisitos

- Node.js 20.19 ou superior.
- npm 10 ou superior.

## Preparação

```powershell
npm install
npm run env:init
npm run extract:legacy-data
```

`env:init` cria o único `.env` do projeto na raiz quando ele ainda não existe. O comando de extração copia o dataset já existente no protótipo para o backend sem imprimi-lo no terminal. O endpoint de origens funciona apenas em desenvolvimento enquanto autenticação e Supabase não forem definidos.

## Desenvolvimento

```powershell
npm run dev
```

O comando inicia API e frontend no mesmo terminal e encerra os dois processos em conjunto. Os scripts `dev:api` e `dev:web` permanecem disponíveis para diagnóstico isolado.

- Frontend: `http://127.0.0.1:5174`
- API: `http://127.0.0.1:3011`
- Saúde da API: `http://127.0.0.1:3011/api/v1/health`

## Rotas do frontend

- `/` — Central por grupo.
- `/grupos/:groupName` — dossiê do grupo.
- `/empresas` e `/empresas/:originId` — listagem e detalhe de empresa.
- `/socios` e `/socios/:entityId` — listagem e detalhe de sócio.
- `/movimentacoes` — livro de distribuições e estornos.
- `/relatorio` — configuração, prévia, impressão e exportação HTML.

## Persistência e segurança

O dataset legado é disponibilizado por `/api/v1/origins` somente em desenvolvimento. Em produção, a rota falha de forma segura até existir autenticação e integração com Supabase/RLS.

Cadastro, prévia, validação de saldos, estorno e persistência de movimentações são executados pelo backend Next. O frontend usa `localStorage` somente para a preferência visual e para migrar uma única vez o histórico criado pela versão anterior.

Em desenvolvimento, o backend persiste movimentações de forma atômica no arquivo configurado por `PROFIT_MOVEMENTS_FILE`; esse artefato é ignorado pelo Git. O banco real ainda não possui contrato de tabelas, autenticação e RLS neste repositório. Por isso, produção falha de forma segura em vez de inventar um schema. Quando esse contrato for fornecido, a troca fica restrita ao adaptador de repositório: regras de negócio não devem ser implementadas no banco.

Todas as variáveis ficam no `.env` da raiz. `.env.example` documenta somente nomes e valores locais não secretos; variáveis `VITE_*` são públicas no bundle.

Nenhuma chave administrativa ou service role pode ser enviada ao frontend. Dados pessoais e segredos não devem aparecer em logs.

## Qualidade

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run audit:security
```

O pipeline em `.github/workflows/ci.yml` executa essa sequência em PRs e pushes. Falhas bloqueiam entrega.

`npm audit --audit-level=high` passa. O npm ainda sinaliza duas ocorrências moderadas no React Router 6; o módulo não usa hidratação SSR e só navega para destinos internos construídos pela aplicação. A migração para Router 7 fica condicionada à atualização da regra arquitetural que hoje exige Router 6.

## Decisões

- [`docs/adr/0001-next-bff.md`](docs/adr/0001-next-bff.md) documenta a exceção de usar Next.js no backend.
- [`docs/adr/0002-backend-rules-and-root-env.md`](docs/adr/0002-backend-rules-and-root-env.md) documenta a autoridade das regras, o repositório e a configuração única.
- [`docs/openapi.yaml`](docs/openapi.yaml) versiona o contrato HTTP exposto.
