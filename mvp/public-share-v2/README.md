# MVP V2 · visão anual por sócio

Alternativa isolada ao MVP original. A tela começa pelo sócio, apresenta janeiro a dezembro sem rolagem horizontal e abre o detalhamento de cada mês por empresa.

## Executar

```powershell
npm.cmd exec vite -- --host 127.0.0.1 --port 4179 --strictPort
```

## Validar

```powershell
node check.mjs
npm.cmd exec vite -- build
```

Os dados e cálculos são importados do MVP V1, sem alterar seus arquivos. O V2 é somente leitura e não substitui o fluxo de criação de link público do V1.
