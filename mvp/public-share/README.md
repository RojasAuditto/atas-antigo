# MVP de compartilhamento público

Protótipo isolado para validar a experiência antes de alterar o frontend React.

## Abrir

Entre no diretório do MVP e inicie o Vite:

```powershell
Set-Location mvp/public-share
npm.cmd exec vite -- --host 127.0.0.1 --port 4178 --strictPort
```

Abra `http://127.0.0.1:4178/`.

Senha da demonstração: `cliente2026`.

## Verificar

```powershell
node mvp/public-share/check.mjs
```

O check confirma totais, nomes por empresa, saldos mensais, IRRF, prévia de novos lançamentos e o payload isolado da visualização “Somente sócios”.

## Fluxos demonstrados

- Seletor anual sem rolagem horizontal, com leitura mensal por empresa e sócio.
- Cada sócio mostra nome, direito em reais, percentual disponível em ata, bruto, base tributável, IRRF, líquido e saldo.
- Setembro contém exemplos sintéticos de saldo negativo sem retenção e saldo negativo com IRRF.
- Novo lançamento com prévia do impacto na empresa, no sócio e na competência tributária.
- Edição como nova versão e estorno com motivo, preservando o histórico.
- Regra mensal: mesma empresa + mesma pessoa física; acima de R$ 50 mil, retenção estimada de 10% sobre o total tributável do mês.

## Limites

- Todos os dados são sintéticos.
- Os cálculos tributários são demonstrativos e não substituem validação fiscal.
- O token, o hash da senha, a expiração e a revogação são simulações no `localStorage`.
- O link demonstrativo funciona somente no mesmo navegador e origem em que foi criado.
- A rota “Somente sócios” carrega um arquivo de dados separado, sem empresas.
- O MVP não implementa autenticação, persistência, API pública ou autorização real.
- A versão final precisa aplicar o escopo no backend, com token opaco, senha protegida, expiração, revogação, limite de tentativas e auditoria sem PII.
