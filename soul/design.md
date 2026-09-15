# Reports — Design System Master (Grupo Pomin)

> Arquivo único, oficial, consolidado. Referência visual e técnica para reproduzir fielmente a identidade do sistema **Relatórios Grupo Pomin** em novas páginas e aplicações internas.
>
> **Stack alvo:** React 18 + Vite + TypeScript + Tailwind CSS v3 + shadcn/ui + Radix Primitives + lucide-react. Tema claro/escuro controlado por classe `.dark` no `<html>`. Fonte única **Oxanium** (Google Fonts). Cores 100% em **HSL** via variáveis CSS.
>
> Todas as decisões abaixo foram **extraídas do código real** do projeto. Sempre que houver uma sugestão que não exista hoje, está marcada como `SUGERIDO`. Tudo o mais é `EXTRAÍDO DO SISTEMA`.

---

## 1. Visão geral da identidade visual

A interface do Reports é um **app shell executivo** com:

- **Sensação:** calmo, denso, sério, levemente premium. Não é “flat puro” nem brutalista — é um híbrido de minimalismo corporativo com toques sutis de glow azul.
- **Personalidade:** ferramenta de gestão para C-level e líderes. Cada tela transmite controle, dados, leitura rápida.
- **Sofisticação:** alta. Bordas finas (1px com 6-10% de opacidade), `border-radius` baixo (5px universal, cards maiores em 1rem/1.5rem), sem sombras pesadas, micro-glow azul no estado ativo.
- **Tom corporativo:** sóbrio, sem festa de cores. Cor principal **azul Pomin** (`hsl(209 84% 36%)` no light, `hsl(197 71% 70%)` no dark) usada com parcimônia, principalmente em estados ativos, gradientes e CTAs.
- **Densidade visual:** média-alta. Listagens densas com tipografia compacta (12-13px), dashboards com cards generosos (`p-6`/`p-7`) mas pouca decoração.
- **Estética geral:** “admin dashboard com respiração”, layout em **app shell fixo** (sidebar hover-to-expand à esquerda, header sticky no topo, conteúdo em card branco/preto arredondado dentro do viewport).
- **O que torna a interface reconhecível:**
  1. Sidebar lateral que **expande no hover** (`64px` → `240px` com easing `cubic-bezier(0.32, 0.72, 0, 1)`).
  2. **Item ativo da navegação** com gradiente azul-petróleo `rgba(76,124,149,…)` + borda em mask-composite (efeito “anel sutil”).
  3. Cards com fundo `#F7F9FB` (light) ou `#14161A` (dark), borda 1px com 6-10% de opacidade.
  4. Tipografia **Oxanium** em tudo — inclusive inputs e botões.
  5. Background corporal com radial-gradient azul sutil no canto inferior direito (light).
  6. Status badges em formato pílula/rounded com pares de cor semântica + 15% opacidade de fundo + 30% de borda.
  7. Pílulas de filtro (`FilterPills`) com contagem inline.
  8. Pontinho colorido (`w-1.5 h-1.5 rounded-full`) + label uppercase tracking-wide acima do valor numérico em todo `StatCard`.

---

## 2. Paleta de cores completa

> Todas as cores vivem como variáveis HSL em `src/index.css` e são consumidas via Tailwind (`bg-primary`, `text-foreground`, etc.) ou via `hsl(var(--token))`. **Nunca** se escreve cor literal em componentes (regra do projeto). Exceções controladas: `#F7F9FB`, `#14161A`, `#070707` (background app dark) — esses convivem como literais nas classes utilitárias `hub-card`, `hub-row` e em `body.dark`.

### 2.1 Light mode — Tokens canônicos

| Token | HEX aprox. | HSL exato | Uso | Quando usar | Quando evitar | Classe Tailwind |
|---|---|---|---|---|---|---|
| `--background` | `#F5F8FB` | `205 40% 98%` | Fundo da página | App shell, body | Dentro de cards | `bg-background` |
| `--foreground` | `#1B2433` | `215 25% 14%` | Texto principal | Títulos, body, valores | Textos auxiliares | `text-foreground` |
| `--card` | `#F7F9FB` | `210 25% 98%` | Superfície de card | Todo card/painel | Fundo de página | `bg-card` |
| `--card-foreground` | `#1B2433` | `215 25% 14%` | Texto sobre card | Conteúdo do card | — | `text-card-foreground` |
| `--popover` | `#FFFFFF` | `0 0% 100%` | Popovers/menus | Dropdown, Command, Popover | Cards normais | `bg-popover` |
| `--popover-foreground` | `#1B2433` | `215 25% 14%` | Texto popover | — | — | `text-popover-foreground` |
| `--primary` | `#0F5BA9` | `209 84% 36%` | Azul Pomin principal | CTA primário, links, anéis de foco, item ativo | Texto longo | `bg-primary` / `text-primary` |
| `--primary-foreground` | `#FFFFFF` | `0 0% 100%` | Texto sobre primário | Botão primário | — | `text-primary-foreground` |
| `--primary-glow` | `#84CCE6` | `197 71% 70%` | Azul claro de gradiente | `hub-gradient`, glows | Cor sólida em texto | `bg-primary-glow` |
| `--secondary` | `#EEF2F6` | `210 40% 96%` | Superfície neutra | Botões secundários, chips | Cor de destaque | `bg-secondary` |
| `--secondary-foreground` | `#1B2433` | `215 25% 14%` | — | — | — | `text-secondary-foreground` |
| `--muted` | `#EFF3F6` | `210 30% 96%` | Fundo muted | Skeletons, empty bars | Bloco grande | `bg-muted` |
| `--muted-foreground` | `#677586` | `215 14% 45%` | Texto auxiliar | Labels, helpers, breadcrumbs | Título | `text-muted-foreground` |
| `--accent` | `#DAEAF5` | `207 80% 94%` | Azul muito claro | Hover sutil sobre azul | Texto | `bg-accent` |
| `--accent-foreground` | `#1B2433` | `215 25% 14%` | — | — | — | `text-accent-foreground` |
| `--destructive` | `#DB3838` | `0 75% 55%` | Erro / atrasado | Badge erro, botão de exclusão | Texto longo | `bg-destructive` / `text-destructive` |
| `--destructive-foreground` | `#FFFFFF` | `0 0% 100%` | — | — | — | — |
| `--success` | `#1FA67E` | `160 70% 38%` | Sucesso | Badge concluído, enviado no prazo | — | `bg-success` / `text-success` |
| `--success-foreground` | `#FFFFFF` | `0 0% 100%` | — | — | — | — |
| `--warning` | `#F4A30C` | `38 92% 50%` | Alerta / pendente | Badge pendente, aguardando | Texto longo | `bg-warning` / `text-warning` |
| `--warning-foreground` | `#FFFFFF` | `0 0% 100%` | — | — | — | — |
| `--border` | `#DAE1E8` | `210 25% 90%` | Bordas finas | Cards, inputs, separadores | — | `border-border` |
| `--input` | `#DAE1E8` | `210 25% 90%` | Borda de input | Inputs e selects | — | `border-input` |
| `--ring` | `#0F5BA9` | `209 84% 36%` | Anel de foco | Focus visible | — | `ring-ring` |
| `--radius` | `5px` | — | Radius padrão | Todos os elementos | Cards grandes (usam `rounded-2xl`/`3xl`) | — |
| `--hub-blue` | `#0F5BA9` | `209 84% 36%` | Categoria azul | Dot/categoria de KPI | — | `bg-hub-blue` / `text-hub-blue` |
| `--hub-blue-soft` | `#84CCE6` | `197 71% 70%` | Glow / variação leve | Gradientes | — | `bg-hub-blue-soft` |
| `--hub-amber` | `#F4A30C` | `38 92% 50%` | Categoria âmbar | Ajustes pedidos, atenção | — | `text-hub-amber` |
| `--hub-emerald` | `#1FA67E` | `160 70% 38%` | Categoria verde | Sucesso, concluído | — | `text-hub-emerald` |
| `--hub-indigo` | `#3D72BC` | `215 60% 50%` | Categoria indigo | Misto, neutro positivo | — | `text-hub-indigo` |
| `--hub-rose` | `#D04668` | `346 70% 55%` | Categoria rosa/vermelha | Atrasado, alerta crítico | — | `text-hub-rose` |
| `--sidebar-background` | `#FAFAFA` | `0 0% 98%` | Fundo sidebar | Sidebar shadcn | — | `bg-sidebar` |
| `--sidebar-foreground` | `#1B2433` | `215 25% 14%` | Texto sidebar | — | — | `text-sidebar-foreground` |
| `--sidebar-primary` | `#0F5BA9` | `209 84% 36%` | Ativo sidebar | — | — | — |
| `--sidebar-accent` | `#DAEAF5` | `207 80% 94%` | Hover sidebar | — | — | — |
| `--sidebar-border` | `#DAE1E8` | `210 25% 90%` | Borda sidebar | — | — | — |
| `--sidebar-ring` | `#0F5BA9` | `209 84% 36%` | Foco sidebar | — | — | — |

### 2.2 Dark mode — Tokens canônicos

| Token | HEX aprox. | HSL exato | Notas |
|---|---|---|---|
| `--background` | `#070707` | `0 0% 2.7%` | Quase preto puro. Body usa literal `#070707` |
| `--foreground` | `#E5E9EE` | `210 17% 92%` | Cinza muito claro |
| `--card` | `#14161A` | `220 10% 9%` | Card cinza escuro (literal `#14161A` em `hub-card`) |
| `--card-foreground` | `#E5E9EE` | `210 17% 92%` | — |
| `--popover` | `#0E0F12` | `240 7% 6%` | Mais escuro que card |
| `--popover-foreground` | `#E5E9EE` | `210 17% 92%` | — |
| `--primary` | `#84CCE6` | `197 71% 70%` | **Inverte para azul claro no dark** |
| `--primary-foreground` | `#0A1F2E` | `207 60% 8%` | Texto escuro sobre primário claro |
| `--primary-glow` | `#84CCE6` | `197 71% 70%` | Mesmo do primary |
| `--secondary` | `#1B2A33` | `207 28% 14%` | Cinza-azulado escuro |
| `--muted` | `#1B2A33` | `207 28% 14%` | Igual ao secondary |
| `--muted-foreground` | `#8A95A3` | `215 14% 60%` | Cinza médio claro |
| `--accent` | `#173544` | `197 50% 18%` | Azul petróleo escuro |
| `--destructive` | `#DB3838` | `0 70% 50%` | Praticamente o mesmo |
| `--success` | `#2EBF95` | `160 60% 45%` | Mais luminoso no dark |
| `--warning` | `#F4A618` | `38 92% 55%` | Levemente mais claro |
| `--border` | `#21333E` | `207 22% 17%` | Borda escura sutil |
| `--input` | `#21333E` | `207 22% 17%` | — |
| `--ring` | `#84CCE6` | `197 71% 70%` | Anel azul claro |
| `--sidebar-background` | `#040C13` | `207 50% 5%` | Sidebar quase preto |
| `--sidebar-accent` | `#173544` | `197 50% 18%` | — |

### 2.3 Cores literais permitidas (uso controlado)

São as **únicas** cores hex literais aceitas no projeto, sempre dentro de classes utilitárias específicas:

- `#FFFFFF` — fundo do app shell (light) em `HubLayout` e `HubHeader`/`HubSidebar`.
- `#070707` — fundo do app shell (dark) em `HubLayout`, `HubSidebar`, `body.dark`.
- `#F7F9FB` — fundo de card no light (`.hub-card`).
- `#14161A` — fundo de card no dark (`.hub-card`).
- `hsl(215 15% 11%)` / `hsl(215 15% 19%)` — usado **somente** em `FilterPills` (fundo da pílula e item selecionado no dark).
- `rgba(76,124,149, …)` — usado **somente** no gradiente do item ativo da navegação (sidebar e drawer mobile).

Qualquer outro uso de cor literal é **proibido**.

### 2.4 Gradientes

| Nome | Definição | Uso |
|---|---|---|
| `hub-gradient` | `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)` | Avatar de fallback, botões premium, badges destacados |
| `hub-gradient-subtle` | `linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--secondary)) 100%)` | Áreas decorativas leves |
| Body light | `radial-gradient(circle at 95% 95%, hsl(207 80% 85% / 0.25), transparent 45%), linear-gradient(180deg, hsl(0 0% 100% / 0.5), hsl(205 40% 98% / 0.85))` | Background da página light |
| Nav ativo (light) | `linear-gradient(88.76deg, rgba(76,124,149,0.08) 1.14%, rgba(76,124,149,0.10) 98.42%)` | Fundo do item ativo |
| Nav ativo borda (light) | `linear-gradient(88.76deg, rgba(76,124,149,0.30) 1.14%, rgba(76,124,149,0.35) 98.42%)` | Borda do item ativo via mask-composite |
| Nav ativo (dark) | `linear-gradient(88.76deg, rgba(255,255,255,0.10) 1.14%, rgba(76,124,149,0.10) 98.42%)` | — |

### 2.5 Overlays e sombras

- **Overlay de Dialog (Radix):** `bg-black/80` (extraído de `src/components/ui/dialog.tsx`).
- **Sombras:** o projeto usa `shadow-sm` (botões e itens selecionados), `shadow-md` (popovers) e `shadow-lg` (dialog). **Não há sombras coloridas pesadas** — a única “profundidade colorida” é `hub-btn-primary`: `box-shadow: 0 8px 24px -10px hsl(var(--primary) / 0.45)`.
- **Hover sutil universal:** `bg-black/[0.04]` (light) e `bg-white/[0.04]` (dark).
- **Hover forte:** `bg-black/[0.06]` / `bg-white/[0.06]`.

---

## 3. Tokens de design extraídos

Todos os tokens abaixo são **EXTRAÍDOS DO SISTEMA** salvo indicação contrária. Origem principal: `src/index.css` (`:root` e `.dark`) e `tailwind.config.ts`.

### 3.1 Tokens semânticos (cores)
Listados na seção 2 com valores exatos. Cada um tem `--token` e `--token-foreground` correspondente (quando aplicável).

### 3.2 Tokens utilitários CSS
| Token | Valor | Origem | Uso |
|---|---|---|---|
| `--radius` | `5px` | `:root` | Radius base do app (passa em `lg`, `md`, `xl` no Tailwind) |
| `--sb-open` | `240px` (≥1536px: 280px / ≥1920px: 320px) | `@layer utilities` em `index.css` | Largura da sidebar expandida |
| `--sb-closed` | `64px` (≥1536px: 72px / ≥1920px: 80px) | idem | Largura da sidebar colapsada |

### 3.3 Tokens de chart
**Não existem tokens dedicados de chart** no projeto. Recharts é estilizado por instância — paletas usam `hsl(var(--hub-blue))`, `--hub-emerald`, etc. **SUGERIDO:** criar `--chart-1` … `--chart-6` alinhados ao `hub-*`.

### 3.4 Tokens de tipografia
- Família única: **Oxanium** (variants `300, 400, 500, 600, 700`), carregada via `@import` em `index.css`.
- Aplicada globalmente a `html, body, button, input, select, textarea` via CSS.
- `tailwind.config.ts` expõe `font-sans` e `font-display` ambos resolvendo para Oxanium. **SUGERIDO:** se quiser separar display de body no futuro, manter `font-display` para títulos e `font-sans` para texto.

### 3.5 Tokens de espaçamento
Não há tokens customizados além da escala padrão Tailwind. O projeto adota uma **escala de fato** descrita na seção 8.

### 3.6 Tokens de motion
- Easing oficial: `cubic-bezier(0.32, 0.72, 0, 1)` (iOS-style). Usado em sidebar, header, busca, navegação ativa.
- Durations padrão: `300ms` (opacidade), `500ms` (largura/padding/layout shift), `200ms` (acordeão Radix).
- Keyframes definidos: `fade-in`, `accordion-down`, `accordion-up`, `thinkingDot` (loading dot do chat).

---

## 4. CSS consolidado de tokens

Copie este bloco para `src/index.css` de uma nova aplicação para herdar o tema do Reports. Já inclui radius, fonte, gradientes, classes utilitárias e dark mode.

```css
/* =========================================================
   Reports Design System — index.css (copie integralmente)
   ========================================================= */

@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ── Superfícies ── */
    --background: 205 40% 98%;
    --foreground: 215 25% 14%;
    --card: 210 25% 98%;          /* #F7F9FB */
    --card-foreground: 215 25% 14%;
    --popover: 0 0% 100%;
    --popover-foreground: 215 25% 14%;

    /* ── Marca ── */
    --primary: 209 84% 36%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 197 71% 70%;

    /* ── Neutras ── */
    --secondary: 210 40% 96%;
    --secondary-foreground: 215 25% 14%;
    --muted: 210 30% 96%;
    --muted-foreground: 215 14% 45%;
    --accent: 207 80% 94%;
    --accent-foreground: 215 25% 14%;

    /* ── Estados ── */
    --destructive: 0 75% 55%;
    --destructive-foreground: 0 0% 100%;
    --success: 160 70% 38%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;

    /* ── Forms / focus ── */
    --border: 210 25% 90%;
    --input: 210 25% 90%;
    --ring: 209 84% 36%;

    /* ── Radius global ── */
    --radius: 5px;

    /* ── Paleta categórica (KPIs / charts) ── */
    --hub-blue: 209 84% 36%;
    --hub-blue-soft: 197 71% 70%;
    --hub-amber: 38 92% 50%;
    --hub-emerald: 160 70% 38%;
    --hub-indigo: 215 60% 50%;
    --hub-rose: 346 70% 55%;

    /* ── Sidebar ── */
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 215 25% 14%;
    --sidebar-primary: 209 84% 36%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 207 80% 94%;
    --sidebar-accent-foreground: 215 25% 14%;
    --sidebar-border: 210 25% 90%;
    --sidebar-ring: 209 84% 36%;
  }

  .dark {
    --background: 0 0% 2.7%;        /* #070707 */
    --foreground: 210 17% 92%;
    --card: 220 10% 9%;             /* #14161A */
    --card-foreground: 210 17% 92%;
    --popover: 240 7% 6%;
    --popover-foreground: 210 17% 92%;

    --primary: 197 71% 70%;         /* azul claro no dark */
    --primary-foreground: 207 60% 8%;
    --primary-glow: 197 71% 70%;

    --secondary: 207 28% 14%;
    --secondary-foreground: 210 17% 92%;
    --muted: 207 28% 14%;
    --muted-foreground: 215 14% 60%;
    --accent: 197 50% 18%;
    --accent-foreground: 210 17% 92%;

    --destructive: 0 70% 50%;
    --destructive-foreground: 0 0% 100%;
    --success: 160 60% 45%;
    --warning: 38 92% 55%;

    --border: 207 22% 17%;
    --input: 207 22% 17%;
    --ring: 197 71% 70%;

    --sidebar-background: 207 50% 5%;
    --sidebar-foreground: 210 17% 92%;
    --sidebar-primary: 197 71% 70%;
    --sidebar-primary-foreground: 207 60% 8%;
    --sidebar-accent: 197 50% 18%;
    --sidebar-accent-foreground: 210 17% 92%;
    --sidebar-border: 207 22% 17%;
    --sidebar-ring: 197 71% 70%;
  }
}

@layer base {
  * { @apply border-border; }

  html, body, button, input, select, textarea {
    font-family: 'Oxanium', system-ui, -apple-system, sans-serif;
    letter-spacing: 0;
  }

  body {
    @apply text-foreground;
    background:
      radial-gradient(circle at 95% 95%, hsl(207 80% 85% / 0.25), transparent 45%),
      linear-gradient(180deg, hsl(0 0% 100% / 0.5), hsl(205 40% 98% / 0.85));
    background-attachment: fixed;
    min-height: 100vh;
  }
  .dark body { background: #070707; background-attachment: fixed; }
}

@layer components {
  /* Gradiente principal — avatares, botões premium, glows */
  .hub-gradient {
    background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%);
  }
  .hub-gradient-subtle {
    background: linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--secondary)) 100%);
  }

  /* Card universal (sem precisar usar shadcn <Card>) */
  .hub-card {
    background-color: #F7F9FB;
    border: 1px solid hsl(0 0% 0% / 0.08);
  }
  .dark .hub-card {
    background-color: #14161A;
    border: 1px solid hsl(0 0% 100% / 0.10);
  }

  /* Linha de tabela / item de lista “zebra” */
  .hub-row {
    background-color: hsl(0 0% 0% / 0.025);
    border: 1px solid hsl(0 0% 0% / 0.06);
  }
  .dark .hub-row {
    background-color: hsl(0 0% 100% / 0.025);
    border: 1px solid hsl(0 0% 100% / 0.10);
  }

  /* Botão primário com glow azul */
  .hub-btn-primary {
    background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%);
    color: hsl(var(--primary-foreground));
    box-shadow: 0 8px 24px -10px hsl(var(--primary) / 0.45);
  }
  .hub-btn-primary:hover { filter: brightness(1.05); }

  /* Scroll fino corporativo */
  .hub-scroll { scrollbar-width: thin; scrollbar-color: hsl(0 0% 0% / 0.12) transparent; }
  .dark .hub-scroll { scrollbar-color: hsl(0 0% 100% / 0.10) transparent; }
  .hub-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .hub-scroll::-webkit-scrollbar-track { background: transparent; }
  .hub-scroll::-webkit-scrollbar-thumb {
    background: hsl(0 0% 0% / 0.12);
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  .dark .hub-scroll::-webkit-scrollbar-thumb { background: hsl(0 0% 100% / 0.12); background-clip: padding-box; }
}

@layer utilities {
  .animate-fade-in { animation: fade-in 0.3s ease-out; }

  /* Largura da sidebar app-shell */
  :root { --sb-open: 240px; --sb-closed: 64px; }
  @media (min-width: 1536px) { :root { --sb-open: 280px; --sb-closed: 72px; } }
  @media (min-width: 1920px) { :root { --sb-open: 320px; --sb-closed: 80px; } }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes thinkingDot {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.1); }
}
```

---

## 5. Preset Tailwind consolidado

Salve como `reports-tailwind-preset.ts` e use em `tailwind.config.ts`: `presets: [reportsPreset]`.

```ts
// reports-tailwind-preset.ts
import type { Config } from "tailwindcss";

const reportsPreset: Partial<Config> = {
  darkMode: ["class"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
    },
    extend: {
      fontFamily: {
        sans:    ["Oxanium", "system-ui", "-apple-system", "sans-serif"],
        display: ["Oxanium", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary:   { DEFAULT: "hsl(var(--secondary))",   foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success:     { DEFAULT: "hsl(var(--success))",     foreground: "hsl(var(--success-foreground))" },
        warning:     { DEFAULT: "hsl(var(--warning))",     foreground: "hsl(var(--warning-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))",       foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))",      foreground: "hsl(var(--accent-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))",     foreground: "hsl(var(--popover-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))",        foreground: "hsl(var(--card-foreground))" },
        hub: {
          blue:        "hsl(var(--hub-blue))",
          "blue-soft": "hsl(var(--hub-blue-soft))",
          amber:       "hsl(var(--hub-amber))",
          emerald:     "hsl(var(--hub-emerald))",
          indigo:      "hsl(var(--hub-indigo))",
          rose:        "hsl(var(--hub-rose))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "5px", md: "5px", sm: "4px",
        xl: "5px", "2xl": "6px", "3xl": "8px",
      },
      boxShadow: {
        // SUGERIDO — capturar a sombra real do hub-btn-primary
        "hub-primary": "0 8px 24px -10px hsl(var(--primary) / 0.45)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in":        { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "thinking-dot":   { "0%,80%,100%": { opacity: "0.3", transform: "scale(0.8)" }, "40%": { opacity: "1", transform: "scale(1.1)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.3s ease-out",
        "thinking-dot":   "thinking-dot 1.2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        // SUGERIDO — expor o easing oficial do shell
        "hub-ease": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default reportsPreset;
```

---

## 6. Tipografia

Fonte única **Oxanium** (display sans serif geométrica, levemente futurista). Aplicada globalmente — inclusive em inputs e botões. Pesos usados na prática: `300`, `400` (default body), `500` (medium, ativo de nav, labels de filtro), `600` (semibold, títulos, valores grandes), `700` (bold em `h1` raros).

### 6.1 Escala tipográfica de referência

| Uso | Tamanho | Peso | Line-height | Tracking | Classe recomendada | Exemplo |
|---|---|---|---|---|---|---|
| H1 página detalhe | `20px` (`text-xl`) | 700 | `leading-tight` | `tracking-tight` | `font-display font-bold text-xl tracking-tight` | Nome do gestor em perfil |
| H1 página padrão | `24-28px` (`text-2xl`/`text-3xl`) | 600 | tight | tight | `font-display font-semibold text-2xl tracking-tight` | Título de página administrativa |
| Valor de KPI (MD) | `34px` (`text-[34px] 2xl:text-4xl`) | 600 | `leading-none` | tight | `font-display font-semibold tracking-tight leading-none` | `StatCard size="md"` |
| Valor de KPI (LG) | `36-48px` | 600 | none | tight | `text-4xl 2xl:text-5xl` | `StatCard size="lg"` |
| Valor de KPI (XL) | `48-60px` | 600 | none | tight | `text-5xl 2xl:text-6xl` | Hero de dashboard |
| Label de KPI | `11px` | 500 | normal | `tracking-[0.08em]` UPPERCASE | `text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium` | Label sobre o valor |
| Body padrão | `14px` (`text-sm`) | 400 | normal | 0 | `text-sm` | Texto geral |
| Body denso | `13px` (`text-[13px]`) | 400 | `leading-relaxed` | 0 | `text-[13px] text-muted-foreground leading-relaxed` | Descrição em card |
| Helper / subtítulo | `12.5-13px` | 400 | normal | 0 | `text-[12.5px] text-muted-foreground` | Subtítulo de nav |
| Caption / metadados | `11px` | 400 | normal | 0 | `text-[11px] text-muted-foreground` | Data, slug, contador |
| Label de formulário | `14px` | 500 | none | 0 | `<Label>` shadcn (`text-sm font-medium leading-none`) | Acima de input |
| Botão | `14px` (`text-sm`) | 500 | normal | 0 | `text-sm font-medium` (default do `Button`) | — |
| Botão small | `13.5px` aprox | 500 | — | — | `size="sm"` (`h-9 px-3 text-sm`) | — |
| Kbd / atalho | `10px` | 500 | — | — | `text-[10px] px-1.5 py-0.5 rounded-[5px] font-medium` | `Ctrl+Q` no search |
| Breadcrumb | `12-13px` mono | 600 | — | — | `text-[12px] sm:text-[13px] font-mono` (sim, Header usa `font-mono` para crumbs — única exceção) | — |
| Status badge | `11px` | 500 | — | `uppercase tracking-wide` | `text-[11px] font-medium uppercase tracking-wide` | `<StatusBadge>` |
| Texto de tabela | `13-14px` | 400 | normal | 0 | `text-sm` | Linha de tabela |
| Número em tabela | `13-14px` | 600 | — | tight | `text-sm font-semibold tabular-nums` (SUGERIDO `tabular-nums`) | Coluna numérica |

### 6.2 Regras de hierarquia
- Todo card de KPI segue o padrão **dot + label uppercase + valor display**.
- Nunca usar `font-bold` em texto corrido — `font-semibold` é o teto.
- Tracking apertado (`tracking-tight`) **apenas** em títulos/valores grandes. Em texto pequeno (`< 13px`) usa tracking normal ou `tracking-wide` quando uppercase.
- Em texto descritivo dentro de card, sempre `text-muted-foreground` para não competir com o valor.

---

## 7. Layout, grid e responsividade

### 7.1 App shell
Layout fixo em `src/layouts/HubLayout.tsx`:

```
┌────────────────────────────────────────────────────────────┐
│ HubSidebar (fixed left, 64px ↔ 240px no hover)             │
│ ├─ Logo + nome                                             │
│ ├─ Search button (Ctrl+Q)                                  │
│ ├─ Nav links (manager ou admin)                            │
│ └─ User pill (footer)                                      │
├────────────────────────────────────────────────────────────┤
│ HubHeader (fixed top, h-16)                                │
│ ├─ Mobile menu (Sheet)                                     │
│ ├─ Breadcrumbs (font-mono)                                 │
│ ├─ Toggle CEO/Gestor (se isDualMode)                       │
│ ├─ User dropdown                                           │
│ ├─ Toggle tema                                             │
│ └─ NotificationHub                                         │
├────────────────────────────────────────────────────────────┤
│ Outlet (em <div> branco arredondado com margin 2-3 do edge)│
│ └─ <main className="p-3 sm:p-6 animate-fade-in">           │
└────────────────────────────────────────────────────────────┘
```

Detalhes técnicos:
- `top-16 right-2 sm:right-3 bottom-2 sm:bottom-3 left-2 sm:left-3` para o card interno.
- `left` é animado via JS para `var(--sb-open|sb-closed)` com easing `cubic-bezier(0.32, 0.72, 0, 1)` e `transition: left 500ms`.
- O card interno tem `rounded-[5px] bg-white dark:bg-[#070707] border border-black/[0.06] dark:border-white/[0.10]`.

### 7.2 Breakpoints
| Nome | Min-width | Uso típico |
|---|---|---|
| `sm` | 640px | Padding interno cresce de `p-3` para `p-6`; mostra crumbs |
| `md` | 768px | Labels de botão tornam-se visíveis |
| `lg` | 1024px | Sidebar desktop ativa (oculta no mobile) |
| `xl` | 1280px | — |
| `2xl` | 1536px | Sidebar 280px; KPIs aumentam de `text-[34px]` para `text-4xl` |
| `3xl` | 1920px | Sidebar 320px; ícones/textos crescem mais um degrau |

### 7.3 Containers
- Páginas administrativas usam `space-y-6` no root, sem `max-w` (preenchem o card do shell).
- Telas de detalhe (perfil, perfil de gestor) usam `max-w-6xl space-y-6`.
- Telas de erro/login centralizadas: `min-h-screen w-full flex items-center justify-center px-4`.
- Diálogos: `max-w-lg` (default Radix) ou `max-w-2xl`/`max-w-4xl` quando precisar.

### 7.4 Grids canônicos
| Contexto | Classe | Notas |
|---|---|---|
| KPIs principais (4 cards) | `grid grid-cols-2 sm:grid-cols-4 gap-3` | Stats de perfil |
| KPIs ricos (cards de Insights) | `grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start` | `MetricCard` largos para texto longo |
| Listagem de gestores | `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3` | Cards-pessoa |
| Formulário | `grid grid-cols-1 md:grid-cols-2 gap-4` | Pares de campos |

### 7.5 Padrões de responsividade
- Esconder texto, manter ícone: `<span className="hidden sm:inline">…</span>` em botões do header.
- Padding interno cresce em breakpoints: `p-3 sm:p-6`.
- Selects de filtro: `flex-1 sm:flex-none` para preencher no mobile e ficarem compactos no desktop.
- Sidebar lateral só aparece em `lg+`. No mobile vira `<Sheet>` lateral controlado pelo botão menu no header.

---

## 8. Espaçamento

Escala recomendada (alinhada ao Tailwind, sem tokens custom):

| Token | Valor | Uso |
|---|---|---|
| `gap-1` / `space-y-1` | 4px | Itens de lista compacta (nav) |
| `gap-2` | 8px | Ícone + texto, chips |
| `gap-3` | 12px | Cards lado a lado, KPIs compactos |
| `gap-4` | 16px | Cards de seção, MetricCards |
| `space-y-6` | 24px | Padrão entre seções de uma página |
| `space-y-8` | 32px | Separação entre blocos hero/detalhe |
| `p-1` (1×) | 4px | Container de pílulas (`FilterPills` usa `p-0.5`) |
| `p-3` | 12px | Padding mobile do main |
| `p-5` | 20px | `StatCard size="sm"`; perfil compacto |
| `p-6` | 24px | Padding desktop do main, `StatCard md`, cards de seção |
| `p-7` | 28px | `StatCard size="lg"` |
| `p-8` | 32px | `StatCard size="xl"`, tela de erro centralizada |
| `pl-2.5 pr-3.5 h-10` | 10/14/40 | Item de nav (sidebar) |
| `h-8 px-4` | 32/16 | Pílula de filtro |
| `h-10 px-4` | 40/16 | Botão default |
| `h-11 px-8` | 44/32 | Botão `size="lg"` |
| `h-16` | 64px | Altura fixa do header |

Regras:
- Entre **título de seção** e conteúdo: `mb-4`.
- Entre **dot+label** e valor do KPI: `mt-5`.
- Entre **valor** e subtítulo do KPI: `mt-2`.
- Entre **valor/subtítulo** e descrição/contexto longo do KPI: `mt-4`.
- Entre **botões** no mesmo grupo: `gap-2`.

---

## 9. Bordas, radius e sombras

### 9.1 Radius
- **Base global:** `5px` (vem de `--radius` e dos overrides `lg/md/xl = 5px` no Tailwind).
- **`rounded-sm` = 4px**, **`rounded-2xl` = 6px**, **`rounded-3xl` = 8px** — usados em **cards grandes de dashboard** (`StatCard` usa `rounded-3xl`).
- **`rounded-full`** apenas em: dots de categoria (1.5×1.5), badges pill (no shadcn), avatares circulares (raro — o padrão é `rounded-[3px]` no `UserAvatar`).
- **Avatar:** `rounded-[3px]` (UserAvatar) ou `rounded-[5px]` (logo).
- **Status badge:** `rounded` (5px) — não usa pill.
- **Dialog/modal:** `sm:rounded-lg` (5px).

### 9.2 Bordas
| Estilo | Classe | Uso |
|---|---|---|
| Sutil (cards/selects) | `border border-border/50` | Padrão dos cards de KPI |
| Padrão | `border border-border` | Inputs, separadores |
| Custom sutil claro | `border border-black/[0.06]` (light) `border-white/[0.10]` (dark) | Sidebar, pílulas neutras |
| Hover sutil | `hover:border-black/[0.10]` | Botões secundários |
| Destaque ativo | Borda via `before:` com gradient + `mask-composite: exclude` | Item ativo de nav |
| Erro/Sucesso/Warning | `border border-{destructive,success,warning}/30` | StatusBadge |

### 9.3 Sombras
- `shadow-sm` — pílula selecionada (`FilterPills`), botão default no hover.
- `shadow-md` — `<PopoverContent>`, `<DropdownMenuContent>`.
- `shadow-lg` — `<DialogContent>`.
- `box-shadow: 0 8px 24px -10px hsl(var(--primary) / 0.45)` — apenas em `.hub-btn-primary`.
- **Não usar:** sombras de “elevation” pesadas (`shadow-2xl`, `drop-shadow-2xl`), sombras coloridas em cards comuns.

### 9.4 Divisores e separadores
- `<Separator>` (Radix) ou `border-t border-border` para divisor horizontal.
- Em footers/headers de Sheet: `border-b border-border`.
- Slash entre crumbs: `<span className="text-muted-foreground/50">/</span>`.

---

## 10. Backgrounds e superfícies

| Superfície | Light | Dark | Como aplicar |
|---|---|---|---|
| Body (fora do shell) | radial-gradient azul + linear | `#070707` literal | Em `body` do CSS global |
| App shell (sidebar/header/canvas) | `#FFFFFF` | `#070707` | `bg-white dark:bg-[#070707]` |
| Card de página (área de conteúdo) | `#FFFFFF` | `#070707` | Em `HubLayout` (o `<div>` arredondado interno) |
| Card semântico | `hsl(var(--card))` | `hsl(var(--card))` | `bg-card` |
| Card literal hub | `#F7F9FB` | `#14161A` | `.hub-card` |
| Linha/superfície sutil | `bg-black/[0.025]` | `bg-white/[0.025]` | `.hub-row` |
| Botão neutro/seletor | `bg-black/[0.04]` | `bg-white/[0.04]` | Sidebar buttons |
| Filtro pill container | `bg-muted/60` | `bg-[hsl(215_15%_11%)]` | `FilterPills` |
| Filtro pill ativo | `bg-card` + `shadow-sm` | `bg-[hsl(215_15%_19%)]` | `FilterPills` |
| Input | `bg-background` | `bg-background` | `<Input>` shadcn |
| Popover/Dropdown | `bg-popover` | `bg-popover` | shadcn primitives |
| Dialog | `bg-background` | `bg-background` | shadcn `<DialogContent>` |
| Overlay (modal) | `bg-black/80` | `bg-black/80` | `<DialogOverlay>` |
| Sidebar/Header (shell) | `bg-white` | `bg-[#070707]` | Literal — único caso autorizado fora de `body` |

### 10.1 Gradientes especiais
- Avatar de fallback / botão premium: `.hub-gradient` (135deg primary → primary-glow).
- Item ativo de nav: gradiente azul-petróleo `rgba(76,124,149,…)` (light) ou `rgba(255,255,255,…)` (dark).

---

## 11. Componentes principais

> Todos os componentes shadcn (`src/components/ui/*`) ficam à disposição. Abaixo, os **realmente usados pelo Reports** com aparência, função e exemplo.

### 11.1 Button (`src/components/ui/button.tsx`)
- **Variantes (cva):** `default | destructive | outline | secondary | ghost | link`.
- **Sizes:** `default (h-10 px-4) | sm (h-9 px-3) | lg (h-11 px-8) | icon (h-10 w-10)`.
- **Classes base:** `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`.
- **Padrão de uso:** ações principais ⇒ `default` (primary). Filtros, “Voltar”, “Exportar” ⇒ `outline`. Ações em headers ⇒ `ghost` ou `outline size="sm"`. Toggles de tema/notificações ⇒ `ghost size="icon"`.
- **Quando NÃO usar:** para CTA principal premium use `.hub-btn-primary` (com glow). Para links inline, `variant="link"`.

```tsx
<Button>Salvar</Button>
<Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4"/>Filtros</Button>
<Button variant="ghost" size="icon" aria-label="Tema"><Moon className="w-5 h-5"/></Button>
```

### 11.2 Card (shadcn) e **`.hub-card`** (utilitário)
- shadcn `<Card>` traz `rounded-lg border bg-card text-card-foreground shadow-sm`. **No Reports praticamente não é usado puro**.
- O padrão real é `rounded-2xl bg-card border border-border/50 p-6` ou `.hub-card` para o estilo literal `#F7F9FB`/`#14161A`.

```tsx
<div className="rounded-2xl bg-card border border-border/50 p-6">
  <h3 className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-4">Metas</h3>
  {/* conteúdo */}
</div>
```

### 11.3 StatCard (`src/components/hub/StatCard.tsx`)
Componente próprio. Padrão obrigatório para KPIs.
- Props: `label`, `value`, `subtitle`, `description`, `tone`, `delta`, `size (sm|md|lg|xl)`, `icon`, `topRight`, `children`.
- Estrutura visual: **dot colorido + label uppercase + valor display** + opcional `delta` ou `icon` à direita + subtítulo + área `children` (gráficos/sparkline) + `description`.
- **Quando usar:** todo dashboard, total de relatórios, contadores, métricas executivas.
- **Quando NÃO usar:** texto livre sem número (use card comum).

```tsx
<StatCard
  label="Total de Relatórios"
  value={kpi.totalReports}
  tone="blue"
  delta={{ value: "+12%", direction: "up" }}
  size="md"
  description="Comparado à semana anterior"
/>
```

### 11.4 StatusBadge (`src/components/hub/StatusBadge.tsx`)
Mapa fixo de status → cor/label. Use **sempre** para qualquer status semântico (relatório, meta, feedback).

```tsx
<StatusBadge status="completed_on_time" /> // "Enviado no prazo" verde
<StatusBadge status="late" />              // "Atrasado" vermelho
<StatusBadge status="adjustment_requested"/>// "Ajuste solicitado" âmbar
```

Status suportados: `pending | late | in_progress | completed_on_time | delivered_late | not_sent | overdue_not_sent | approved | pending_approval | adjustment_requested | rejected | not_started | completed | delayed | cancelled | praise | improvement | guidance | alert | mixed`.

### 11.5 FilterPills (`src/components/hub/FilterPills.tsx`)
Pílula de filtro com contagem. Substitui `Tabs` para filtros simples.

```tsx
<FilterPills
  value={statusFilter}
  onChange={setStatusFilter}
  options={[
    { key: "todos", label: "Todos", count: 124 },
    { key: "enviados", label: "Enviados", count: 88 },
    { key: "atrasados", label: "Atrasados", count: 12 },
  ]}
  fullWidth
/>
```

### 11.6 UserAvatar (`src/components/UserAvatar.tsx`)
Avatar com URL assinada do B2 OU fallback `hub-gradient` com iniciais. **Sempre** preferir este componente ao `<Avatar>` puro.
- Tamanhos: `size={28|32|40|56}` (em pixels).
- Radius: `rounded-[3px]` por padrão. Pode ser sobrescrito.

```tsx
<UserAvatar name={user.name} avatarPath={user.avatar_path} size={32} />
```

### 11.7 Sidebar / HubSidebar
Não use o `<Sidebar>` shadcn nas novas telas internas — o Reports tem `HubSidebar` próprio (hover-to-expand, com lista de rotas e Command Palette `Ctrl+Q`). Reaproveite o componente ou siga este padrão visual:
- Largura `var(--sb-closed)` → `var(--sb-open)` no hover (500ms easing iOS).
- Item: `h-10 pl-2.5 rounded-[5px]`, ícone 17×17 `strokeWidth={1.75}`.
- Item ativo: gradient + borda em `mask-composite` (ver seção 19 para o trecho exato).

### 11.8 HubHeader
Header `h-16` fixed-top. Padding-left animado em sincronia com a sidebar. Contém: menu mobile, breadcrumbs (`font-mono`), toggle CEO/Gestor (se `isDualMode`), dropdown do usuário, toggle tema, `NotificationHub`.

### 11.9 Input / Label / Select / Textarea (shadcn)
- `Input`: `h-10 rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring`.
- `Label`: `text-sm font-medium leading-none` (sempre acompanha o input).
- `Select`/`Textarea`/`Checkbox`/`RadioGroup`/`Switch` — usar **sem modificações** dos arquivos em `src/components/ui/*`.

### 11.10 Badge (shadcn)
Variantes `default | secondary | destructive | outline`. Para status semântico, **prefira `StatusBadge`**.

### 11.11 Dialog / Sheet / Drawer
- Dialog: overlay `bg-black/80`, content `max-w-lg p-6 shadow-lg sm:rounded-lg`. Botão fechar no canto sup. direito (`X`).
- Sheet: usado para menu mobile (`side="left" className="w-[280px] p-0 bg-white dark:bg-[#070707] flex flex-col"`).
- Drawer: vaultjs — disponível mas pouco usado.

### 11.12 DropdownMenu / Popover / Tooltip / HoverCard
Todos shadcn padrão. Popover de filtros usa `align="end"` e largura `w-72` ou `w-80`. Tooltip — `<TooltipProvider>` no root (já configurado em `App.tsx`).

### 11.13 Tabs / Accordion / Collapsible
Tabs raramente são usados no Reports (preferimos `FilterPills`). Accordion segue shadcn (keyframes já no preset).

### 11.14 Table
Use shadcn `<Table>` para listagens estruturadas. Para listagens com cartões por linha (o padrão do Reports), use `.hub-row` (ver seção 18).

### 11.15 Toast / Sonner
`<Toaster>` (shadcn) e `<Sonner>` (sonner.tsx) ambos montados em `App.tsx`. Mensagens curtas usam `import { toast } from "@/hooks/use-toast"`.

### 11.16 Alert
shadcn `<Alert>` com variantes `default | destructive`. Use para mensagens persistentes dentro do conteúdo (não para popups).

### 11.17 Progress
Para barra de progresso de metas, o Reports usa `<div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-hub-blue rounded-full transition-all" style={{ width: pct+"%"}}/></div>` — **prefira esse padrão** para coerência (em vez de `<Progress>` shadcn).

### 11.18 Skeleton
shadcn padrão. Use `<Skeleton className="h-4 w-32" />` etc. **SUGERIDO:** criar `<CardSkeleton>` padronizando alturas.

### 11.19 EmptyState (SUGERIDO componentizar)
Padrão atual (inline): centralizado, ícone 12×12 em `rounded-full bg-muted`, título 18-20px semibold, descrição muted, botão `outline` opcional. Ver tela `Unavailable.tsx`.

### 11.20 LoadingState
Padrão: `Loader2` do lucide com `animate-spin`. Em pleno-tela: `<div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/></div>`.

### 11.21 Sparkline / StadiumBars (`src/components/hub/Sparkline.tsx`)
SVG inline, sem dependência. Use dentro de `StatCard` (área `children`).

```tsx
<StatCard label="Aderência" value="92%" tone="emerald">
  <Sparkline data={[78,80,85,90,92]} />
</StatCard>
```

### 11.22 NotificationHub / InsightsScopePicker / GoalTasksChecklist
Componentes específicos do produto. Reaproveite tal-qual quando o domínio for o mesmo (gestão de relatórios). Em apps novos, sirvam de modelo de padrão visual.

### 11.23 Ai Prompt Box (`src/components/ui/ai-prompt-box.tsx`)
Caixa de prompt para assistente IA, com botão de envio e estado “pensando” (usa keyframe `thinkingDot`).

---

## 12. Guia prático de componentes (snippets prontos)

```tsx
// Botão primário
<Button>Salvar</Button>

// Botão primário com glow (premium)
<button className="hub-btn-primary px-4 h-10 rounded-md text-sm font-medium">
  Gerar Insight
</button>

// Botão secundário
<Button variant="outline" size="sm" className="gap-2">
  <Filter className="w-4 h-4" /> Filtros
</Button>

// Card padrão
<div className="rounded-2xl bg-card border border-border/50 p-6">
  <h3 className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-4">
    Metas da semana
  </h3>
  {/* conteúdo */}
</div>

// Card de métrica (preferir <StatCard>)
<StatCard label="Total de Relatórios" value={124} tone="blue"
          delta={{ value: "+12%", direction: "up" }} size="md" />

// Header de página
<div className="flex items-center justify-between gap-4 mb-6">
  <div className="min-w-0">
    <h1 className="font-display font-semibold text-2xl tracking-tight truncate">
      Insights Automáticos
    </h1>
    <p className="text-sm text-muted-foreground">Semana 11/05 – 17/05/2026</p>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm">Exportar</Button>
    <Button size="sm">Gerar agora</Button>
  </div>
</div>

// Sidebar item (gradiente ativo)
<NavLink to="/admin" className={({isActive}) => cn(
  "relative flex items-center gap-3 rounded-[5px] h-10 pl-2.5 text-[13.5px]",
  isActive
    ? "text-foreground font-medium bg-[linear-gradient(88.76deg,rgba(76,124,149,0.08)_1.14%,rgba(76,124,149,0.10)_98.42%)] dark:bg-[linear-gradient(88.76deg,rgba(255,255,255,0.10)_1.14%,rgba(76,124,149,0.10)_98.42%)] before:content-[''] before:absolute before:inset-0 before:rounded-[5px] before:p-px before:bg-[linear-gradient(88.76deg,rgba(76,124,149,0.30)_1.14%,rgba(76,124,149,0.35)_98.42%)] dark:before:bg-[linear-gradient(88.76deg,rgba(255,255,255,0.35)_1.14%,rgba(76,124,149,0.35)_98.42%)] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:pointer-events-none"
    : "font-normal text-foreground/70 hover:text-foreground hover:bg-[hsl(0_0%_0%/0.04)] dark:text-white/55 dark:hover:text-white dark:hover:bg-[hsl(0_0%_100%/0.04)]"
)}>
  <LayoutDashboard className="w-[17px] h-[17px] shrink-0" strokeWidth={1.75}/>
  <span className="truncate">Dashboard</span>
</NavLink>

// Input com label
<div className="space-y-1.5">
  <Label htmlFor="name">Nome completo</Label>
  <Input id="name" placeholder="Ex: Maria Silva" />
</div>

// Select shadcn
<div className="space-y-1.5">
  <Label>Empresa</Label>
  <Select>
    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="vila">Vila das Frutas</SelectItem>
      <SelectItem value="club">Club</SelectItem>
    </SelectContent>
  </Select>
</div>

// Badge de status
<StatusBadge status="completed_on_time" />

// Tabela densa (padrão Reports)
<div className="space-y-1.5">
  <div className="grid grid-cols-[1fr_120px_120px_80px] gap-3 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
    <span>Gestor</span><span>Status</span><span>Enviado em</span><span></span>
  </div>
  {rows.map(r => (
    <div key={r.id} className="hub-row grid grid-cols-[1fr_120px_120px_80px] gap-3 items-center px-3 py-2.5 rounded-[5px]">
      <div className="flex items-center gap-2.5 min-w-0">
        <UserAvatar name={r.name} avatarPath={r.avatar_path} size={28}/>
        <span className="text-sm truncate">{r.name}</span>
      </div>
      <StatusBadge status={r.status}/>
      <span className="text-[13px] text-muted-foreground">{r.sent_at}</span>
      <Button variant="ghost" size="sm">Abrir</Button>
    </div>
  ))}
</div>

// Modal
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Editar gestor</DialogTitle>
      <DialogDescription>Atualize os dados básicos.</DialogDescription>
    </DialogHeader>
    {/* form */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
      <Button onClick={save}>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Empty state
<div className="rounded-2xl bg-card border border-border/50 p-10 text-center">
  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
    <Inbox className="w-6 h-6 text-muted-foreground"/>
  </div>
  <h3 className="text-base font-semibold mb-1">Nenhum relatório encontrado</h3>
  <p className="text-sm text-muted-foreground mb-4">Ajuste os filtros para visualizar outros períodos.</p>
  <Button variant="outline" size="sm">Limpar filtros</Button>
</div>

// Loading state
<div className="min-h-[40vh] flex items-center justify-center">
  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/>
</div>

// Filter bar (linha de filtros)
<div className="flex flex-wrap items-center gap-2 mb-4">
  <FilterPills value={f} onChange={setF} options={opts}/>
  <div className="relative flex-1 min-w-[200px]">
    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
    <Input className="pl-8 h-9" placeholder="Buscar..." />
  </div>
  <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4"/>Mais filtros</Button>
</div>

// Search bar isolada
<div className="relative">
  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
  <Input className="pl-8 h-9" placeholder="Buscar..." />
</div>

// Form section
<section className="rounded-2xl bg-card border border-border/50 p-6 space-y-4">
  <header>
    <h3 className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">Dados básicos</h3>
  </header>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* inputs */}
  </div>
</section>
```

---

## 13. Ícones

- **Biblioteca:** `lucide-react` exclusivamente. Não misturar com heroicons/feather.
- **Tamanho padrão:**
  - Em texto/inline: `w-4 h-4` (16px).
  - Em botão `size="default"`: `w-4 h-4` (vem do `[&_svg]:size-4` no buttonVariants).
  - Em botão `size="icon"`: `w-5 h-5` (20px).
  - Em itens de nav: `w-[17px] h-[17px]` desktop / `w-[19px]` ≥2xl / `w-[21px]` ≥3xl.
  - Header de página: `w-5 h-5`.
  - Card hero/empty state: `w-6 h-6` (24px) dentro de `rounded-full bg-muted w-12 h-12`.
- **`strokeWidth`:** `1.75` (padrão do Reports — mais leve que o default 2). Em ícones de “delta arrow” usa `2.25` para ficar legível em 12px.
- **Cores:**
  - Texto auxiliar: `text-muted-foreground`.
  - Sobre fundo escuro: herdam `text-foreground`.
  - Em `StatCard`, ícone topo-direita usa `text-foreground/40`.
  - Em status: usar cor semântica do badge (`text-success`, `text-destructive`).
- **Alinhamento:** sempre `shrink-0` quando dentro de flex, sempre `gap-2` entre ícone e label.
- **Top 15 ícones em uso:** `LayoutDashboard, FileText, Inbox, Users, MessageSquare, MessageCircle, Target, Sparkles, Lightbulb, CheckCheck, Search, Filter, Calendar, Moon, Sun, LogOut, ChevronRight, ArrowUpRight, ArrowDownRight, AlertTriangle`.
- **Como escolher novos ícones:** preferir traços simples, sem fills, alinhados visualmente aos existentes. Manter `strokeWidth={1.75}`.

---

## 14. Dark mode e light mode

### 14.1 Como o tema é controlado
- `src/contexts/ThemeContext.tsx`: estado `theme` persistido em `localStorage` (`rsl-theme`), efeito que faz `document.documentElement.classList.toggle("dark", theme === "dark")`.
- Default: `light`. Toggle pelo `Moon`/`Sun` no header.

### 14.2 Tokens que mudam (resumo)
Praticamente **todos** os tokens de cor mudam. Os únicos que **não** mudam são: `--primary-foreground` (segue inverso lógico do primary, então também muda na prática), `--success-foreground`, `--warning-foreground`, `--destructive-foreground` — todos brancos.

A diferença mais importante: **`--primary` inverte** — escuro azul-Pomin no light, claro azul-céu no dark. Isso garante contraste sobre o fundo `#070707`.

### 14.3 Diferenças visuais
- Light: levemente amigável, com radial-gradient azul tênue ao fundo.
- Dark: quase preto puro (`#070707`), cards `#14161A`, primary luminoso. Ar “OLED-friendly”.

### 14.4 Regras para componentes compatíveis
1. **Nunca** escrever cor literal (exceto as listadas em 2.3). Sempre `bg-card`, `text-foreground`, etc.
2. Para fundos sutis derivados, use `bg-black/[0.04] dark:bg-white/[0.04]` (e variações `0.025/0.06/0.10`).
3. Para bordas sutis derivadas, `border-black/[0.06] dark:border-white/[0.10]`.
4. Estados ativos com gradient devem ter par light/dark explícito (sidebar é o exemplo canônico).
5. Sempre testar contraste no dark — especialmente texto em `text-primary` (claro) vs fundo claro: prefira `text-primary-foreground` quando estiver sobre `bg-primary`.

### 14.5 Erros que quebram o dark mode
- Usar `text-white` ou `bg-black` literais.
- Esquecer o par `dark:` em fundos custom (`bg-white` sem `dark:bg-[#070707]`).
- Usar `text-gray-*` da paleta Tailwind padrão (não respeita tokens).
- Sombras `shadow-xl` que ficam imperceptíveis no dark — preferir bordas sutis.

---

## 15. Estados visuais

| Estado | Padrão |
|---|---|
| Hover (botão neutro) | `hover:bg-black/[0.04] dark:hover:bg-white/[0.04]` |
| Hover (botão outline) | `hover:bg-accent hover:text-accent-foreground` |
| Hover (linha de tabela) | `hover:bg-black/[0.025] dark:hover:bg-white/[0.025]` |
| Active (button primário) | `hover:bg-primary/90` (escurece) |
| Focus | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (padrão do Button) |
| Disabled | `disabled:pointer-events-none disabled:opacity-50` |
| Loading | `Loader2` com `animate-spin` + texto opcional muted |
| Selected (lista) | Mesmo padrão do nav ativo (gradient + borda mask) |
| Expanded (accordion/sidebar) | width/height animado via Radix + classes `data-[state=open]` |
| Collapsed | `data-[state=closed]:…` |
| Error (input) | `border-destructive focus-visible:ring-destructive/30` (SUGERIDO consolidar) + mensagem abaixo `text-[12px] text-destructive` |
| Success | `text-success`, badge `bg-success/15 text-success border-success/30` |
| Warning | `text-warning`, badge `bg-warning/15 text-warning border-warning/30` |
| Info | usar `text-primary` ou `bg-primary/15 text-primary border-primary/30` |
| Empty | Card centralizado com ícone em círculo muted (ver 11.19) |
| Skeleton | `<Skeleton className="h-4 w-32" />` — fundo `bg-muted animate-pulse` |

---

## 16. Dashboards

### 16.1 Anatomia padrão
```
<page>
  <PageHeader>                                  (título + ações)
  <FilterBar>                                   (FilterPills + selects + search)
  <KPI grid (cols-2 sm:cols-4 gap-3)>           (StatCards)
  <Charts grid (cols-1 lg:cols-2 gap-4)>        (Recharts em cards)
  <Listings (cols-1 md:cols-2 xl:cols-3 gap-3)> (pessoa/relatório/meta)
</page>
```

Use `space-y-6` para separar essas faixas.

### 16.2 Princípios
- KPIs sempre via `<StatCard>` com tone semântico (`blue` total, `emerald` sucesso, `amber` atenção, `rose` crítico).
- Gráficos Recharts dentro de `rounded-2xl bg-card border border-border/50 p-6`. Eixos com `tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}`. Linhas/áreas em `hsl(var(--hub-blue))`.
- Filtros sempre **acima** dos KPIs.
- Mostrar “período selecionado” claramente (label em `text-sm text-muted-foreground`).
- Hierarquia executiva: 1 KPI hero (`size="xl"`) + 4 KPIs apoio (`size="md"`) + gráfico de tendência + lista de itens críticos.
- Evitar mais que 6 cores categóricas — use a paleta `hub-*` em rotação.

### 16.3 Exemplo estrutural
```tsx
<div className="space-y-6">
  <PageHeader title="Dashboard Executivo" subtitle={periodLabel} actions={<Button>Exportar</Button>} />

  <FilterPills value={status} onChange={setStatus} options={…} fullWidth />

  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <StatCard label="Total" value={124} tone="blue" />
    <StatCard label="No prazo" value={88} tone="emerald" />
    <StatCard label="Atrasados" value={12} tone="rose" />
    <StatCard label="Aderência" value="92%" tone="amber" />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="rounded-2xl bg-card border border-border/50 p-6">
      {/* Recharts AreaChart */}
    </div>
    <div className="rounded-2xl bg-card border border-border/50 p-6">
      {/* Recharts BarChart */}
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
    {/* cards de gestor */}
  </div>
</div>
```

---

## 17. Formulários

### 17.1 Princípios
- Sempre `<Label>` + `<Input>` (não usar placeholder como label).
- Espaço entre label e input: `space-y-1.5`.
- Espaço entre campos: `gap-4`.
- Layout 1 coluna por padrão (mobile-first); 2 colunas em `md+` quando os campos forem curtos.
- Mensagens de erro: `text-[12px] text-destructive mt-1`.
- Helpers: `text-[12px] text-muted-foreground mt-1`.
- Botões de ação no rodapé do form, alinhados à direita: `<div className="flex justify-end gap-2"><Button variant="outline">Cancelar</Button><Button type="submit">Salvar</Button></div>`.
- Agrupar em seções (`<section className="rounded-2xl bg-card border border-border/50 p-6 space-y-4">`) com cabeçalho uppercase muted.

### 17.2 Exemplo completo
```tsx
<form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
  <section className="rounded-2xl bg-card border border-border/50 p-6 space-y-4">
    <h3 className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">Dados básicos</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome*</Label>
        <Input id="name" value={name} onChange={e=>setName(e.target.value)} />
        {errors.name && <p className="text-[12px] text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail*</Label>
        <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
    </div>
  </section>

  <section className="rounded-2xl bg-card border border-border/50 p-6 space-y-4">
    <h3 className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">Permissões</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="block">Usuário ativo</Label>
          <p className="text-[12px] text-muted-foreground">Quando desligado, não entrega relatórios</p>
        </div>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>
    </div>
  </section>

  <div className="flex justify-end gap-2">
    <Button variant="outline" type="button">Cancelar</Button>
    <Button type="submit">Salvar</Button>
  </div>
</form>
```

---

## 18. Tabelas e listagens

O padrão do Reports é **listagem em cards densos** (não `<table>` tradicional). Use `hub-row` ou um `grid` com colunas explícitas.

### 18.1 Princípios
- Cabeçalho: linha com `text-[11px] uppercase tracking-wide text-muted-foreground font-medium`.
- Linhas: `rounded-[5px] hub-row px-3 py-2.5` ou `bg-card border border-border/50`.
- Hover de linha: `hover:bg-black/[0.025] dark:hover:bg-white/[0.025]`.
- Ações: `Button variant="ghost" size="sm"` na última coluna.
- Status sempre via `<StatusBadge>`.
- Avatar via `<UserAvatar size={28}>`.
- Empty state: card centralizado (seção 11.19).
- Loading: `Loader2 animate-spin` centralizado.
- Mobile: esconder colunas secundárias (`hidden md:block`) ou colapsar em mini-card.

### 18.2 Exemplo
```tsx
<div className="space-y-1.5">
  <div className="grid grid-cols-[1fr_160px_120px_80px] gap-3 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
    <span>Gestor</span><span className="hidden md:block">Área</span><span>Status</span><span></span>
  </div>
  {rows.map(r => (
    <div key={r.id} className="hub-row grid grid-cols-[1fr_160px_120px_80px] gap-3 items-center px-3 py-2.5 rounded-[5px] hover:bg-black/[0.025] dark:hover:bg-white/[0.025] transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <UserAvatar name={r.name} avatarPath={r.avatar_path} size={28}/>
        <div className="min-w-0">
          <p className="text-sm truncate">{r.name}</p>
          <p className="text-[11px] text-muted-foreground truncate md:hidden">{r.area}</p>
        </div>
      </div>
      <span className="text-[13px] text-muted-foreground hidden md:block truncate">{r.area}</span>
      <StatusBadge status={r.status}/>
      <Button variant="ghost" size="sm">Abrir</Button>
    </div>
  ))}
</div>
```

---

## 19. Navegação

### 19.1 Sidebar (desktop)
- Largura: `var(--sb-closed)` (64px) → `var(--sb-open)` (240px) no `onMouseEnter`.
- Transição: `width 500ms cubic-bezier(0.32, 0.72, 0, 1)`.
- Posição: `fixed top-0 left-0 bottom-0 z-40 hidden lg:flex`.
- Cor de fundo: `bg-white dark:bg-[#070707]` (literal).
- 3 áreas: Logo (top) / Search (Ctrl+Q) / Nav (scroll) / User pill (footer).
- Cada item: ver código exato em `HubSidebar.tsx`. O gradiente do estado ativo é **a assinatura visual do app**.

### 19.2 Header
- Altura `h-16 fixed top-0 right-0 left-0 z-30`.
- `padding-left` dinâmico: `calc(var(--sb-open|sb-closed) + 16px)`.
- Conteúdo: menu mobile + breadcrumbs (font-mono) + ações da direita.
- Breadcrumb separator: `/` em `text-muted-foreground/50`.
- No mobile: breadcrumbs colapsam (`hidden sm:inline`), só o último crumb fica visível.

### 19.3 Mobile (Sheet)
Sheet lateral `w-[280px] p-0 bg-white dark:bg-[#070707] flex flex-col`. Reproduz a mesma lista de rotas e o mesmo estilo de item ativo.

### 19.4 Hierarquia de itens
- Admin nav tem **2 ordens lógicas**: visão executiva → gestão → IA → operacional → mídia → configuração.
- Manager nav tem **5 itens**: Dashboard, Criar Relatório, Relatórios, Mural, Metas.
- Ícone primeiro, label depois, sem badges numéricos no item (notificações vão para `NotificationHub` no header).

---

## 20. Motion e microinterações

| Comportamento | Duração | Easing | Onde |
|---|---|---|---|
| Sidebar expand/collapse | 500ms | `cubic-bezier(0.32, 0.72, 0, 1)` | width, padding, opacity |
| Header padding-left | 500ms | `cubic-bezier(0.32, 0.72, 0, 1)` | sincronizado com sidebar |
| Fade-in de página | 300ms | `ease-out` | `animate-fade-in` no `<main>` |
| Hover/active de cor | 150-200ms | default Tailwind `transition-colors` | botões, links |
| Accordion | 200ms | `ease-out` | shadcn |
| Loader spin | infinito | linear | `Loader2 animate-spin` |
| Thinking dot (chat) | 1.2s | ease-in-out infinite | `@keyframes thinkingDot` |
| Dialog/Sheet entry | 200ms | tailwindcss-animate defaults | `data-[state=open]:animate-in` |

### 20.1 O que deve ser sutil
- Hovers, opacidade, color shifts.
- Reveal de label quando sidebar abre (`transition-opacity duration-300 delay-150`).

### 20.2 O que evitar
- Spring animations dramáticas.
- Parallax, scroll-jacking.
- Animações `> 600ms` em interações comuns.
- Transições aplicadas a `all` (sempre listar propriedades: `transition-[background-color,color,width]`).

---

## 21. Padrões completos de páginas

### 21.1 Dashboard executivo
Ver seção 16.3 e arquivo real `src/pages/admin/AdminDashboard.tsx`.

### 21.2 Dashboard operacional (manager)
- Mesma estrutura, KPIs menores (`size="sm"`), grid 2 colunas.
- Foco em “o que eu preciso fazer essa semana”.

### 21.3 Listagem com filtros
- `PageHeader` + `FilterPills` (status) + linha de selects (área, empresa, ano, mês, semana) + `Search` + grid de cards.
- Padrão do `AdminUserManagement` e `AdminReports`.

### 21.4 Criação/edição (form full-page)
- Header com botão Voltar (`<button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4 rotate-180"/> Voltar</button>`).
- `max-w-2xl space-y-6` com `<section>` de cada bloco (seção 17.2).
- Botões no rodapé alinhados à direita.

### 21.5 Detalhe
- Header de perfil em card `flex items-center gap-5 p-6` com avatar 56px + título + subtítulo.
- 4 KPIs em grid 2/4.
- Seções subsequentes (metas, relatórios, feedbacks) cada uma em card próprio.
- Padrão visível em `AdminDashboard` quando `selectedPerson` está setado.

### 21.6 Tela de relatório (chat)
- Layout full-height com mensagens à esquerda, input fixo na base.
- `ai-prompt-box` para entrada.
- Loading com `thinkingDot`.

### 21.7 Tela administrativa
Listagem com filtros + ações de massa + modais de edição. Padrão `AdminUserManagement`.

### 21.8 Permissões
- Acesso bloqueado: rota redireciona para `/indisponivel` que renderiza `Unavailable.tsx`.
- Para roles, usar **tabela separada** `user_roles` + função `has_role` (Supabase). Nunca client-side flags.

### 21.9 Configurações
- Single-column `max-w-2xl`, seções colapsáveis ou agrupadas em cards.
- Cada switch numa linha `flex items-center justify-between`.

### 21.10 Login / SSO
- Single-column centralizada. Card `max-w-md p-8 rounded-xl border border-border bg-card text-center space-y-5`. Logo, título, descrição, botão primário “Entrar com Microsoft”.

### 21.11 Erro (404)
- `flex min-h-screen items-center justify-center bg-muted`. Texto `text-4xl font-bold` + descrição muted + link `text-primary underline`.

### 21.12 Vazio (sem dados)
- Ver 11.19.

### 21.13 Wireframe textual genérico (qualquer página)
```
[Header — h-16 fixed]
[Card-canvas — radius 5, margin 8/12px]
  [Title row — h1 semibold + actions à direita]
  [Optional subtitle muted]
  ─ space-y-6 ─
  [FilterPills + filtros adicionais]
  ─ space-y-6 ─
  [KPI grid]
  ─ space-y-6 ─
  [Conteúdo principal (chart/list/form)]
```

---

## 22. Regras de composição de tela

1. **Ordem visual**: Header de página → filtros → KPIs → conteúdo → ações secundárias.
2. **Header de página**: sempre `flex items-center justify-between gap-4 mb-6`, título à esquerda, ações à direita.
3. **Cards**: jamais cards aninhados profundamente (max 2 níveis). Use `<section>` semântico.
4. **Hierarquia**: número grande = `font-display font-semibold tracking-tight`; label = `uppercase tracking-[0.08em] muted`. Esse contraste é a hierarquia.
5. **Botões**: 1 primário por tela (CTA principal). Demais são `outline` ou `ghost`.
6. **Filtros**: pílulas para enum curto, selects para listas longas, search à direita das pílulas.
7. **Densidade**: quando precisar de tela densa, reduza padding para `p-3 sm:p-5` e tipografia para `text-[13px]`, mantenha `gap-3`.
8. **Telas simples**: aumente padding para `p-8`, use `max-w-2xl`, adicione hero card centralizado.
9. **Consistência cross-página**: SEMPRE reaproveitar `StatCard`, `StatusBadge`, `FilterPills`, `UserAvatar`, `.hub-row`, e o app shell.

---

## 23. Do and Don’t

### Faça
- ✅ Use **tokens semânticos** (`bg-card`, `text-foreground`) em 100% dos componentes.
- ✅ Use `<StatCard>` para qualquer KPI.
- ✅ Use `<StatusBadge>` para qualquer status semântico do produto.
- ✅ Use `<FilterPills>` para filtros enum curtos.
- ✅ Use `<UserAvatar>` para qualquer avatar de usuário.
- ✅ Use Oxanium em tudo (não importar outras fontes).
- ✅ Use easing `cubic-bezier(0.32, 0.72, 0, 1)` em transições do shell.
- ✅ Mantenha `border-radius` de 5px como base (`rounded-md`, `rounded-lg`).
- ✅ Mantenha bordas finas (`border-border/50`) em cards.
- ✅ Garanta par light/dark em qualquer cor custom.
- ✅ Use `strokeWidth={1.75}` em lucide icons.

### Não faça
- ❌ Cores hex literais fora das 6 permitidas (seção 2.3).
- ❌ `text-white`, `bg-black`, `text-gray-*`, `bg-slate-*` (paleta Tailwind crua).
- ❌ Sombras dramáticas (`shadow-2xl`, glow colorido fora de `hub-btn-primary`).
- ❌ Border-radius alto (`rounded-3xl` em botões, `rounded-full` em cards).
- ❌ Misturar bibliotecas de ícones.
- ❌ Importar fontes adicionais (Inter, Roboto, etc.).
- ❌ Excesso de gradientes — apenas `hub-gradient` em avatar/CTA premium e o gradiente do nav ativo.
- ❌ Usar `<Card>` shadcn puro para KPIs — use `<StatCard>`.
- ❌ Esquecer hover/focus em itens clicáveis.
- ❌ Quebrar o app shell — sempre renderize páginas dentro de `HubLayout`.
- ❌ Sidebar/Header escritos do zero por página — reaproveite `HubSidebar`/`HubHeader`.

---

## 24. Inconsistências encontradas (sistema atual)

| Onde | Problema | Como padronizar | Criticidade |
|---|---|---|---|
| `tailwind.config.ts` → `borderRadius` | `lg/md/xl = 5px`, mas `2xl=6px` e `3xl=8px`. Quase todos cards usam `rounded-2xl` (6px) ou `rounded-3xl` (8px), divergindo do `--radius=5px`. | Documentar: 5px para inputs/botões/badges; 6-8px para cards de painel. Ou unificar tudo em 5px. | Melhoria |
| Hardcoded `#FFFFFF`, `#070707`, `#F7F9FB`, `#14161A`, `#14161A` | Cores literais em `HubLayout`, `HubSidebar`, `HubHeader`, `hub-card`, `hub-row`. | Aceito como “tokens literais de shell”. Documentado em 2.3. **SUGERIDO** mover para variáveis: `--shell-bg`, `--shell-card`. | Melhoria |
| `FilterPills` | Usa `hsl(215_15%_11%)` e `hsl(215_15%_19%)` direto. | **SUGERIDO** criar `--surface-strong` e `--surface-stronger` tokens. | Melhoria |
| Nav ativo | Cor `rgba(76,124,149,…)` aparece em 4 lugares (sidebar desktop e mobile). | **SUGERIDO** mover gradientes para classes utilitárias `nav-active-bg` e `nav-active-border` em `@layer components`. | Melhoria |
| `HubHeader` breadcrumbs | Usa `font-mono`, única ocorrência de mono no app. | Mantém — é decisão estética intencional para crumbs. Documentar. | Não crítico |
| `text-foreground/70`, `text-white/55` | Sidebar usa esses tons fracionários direto. | Funcional, mas **SUGERIDO** criar tokens `--text-muted-strong` e `--text-muted-soft`. | Melhoria |
| `Progress` shadcn vs barra inline | Convivem — Reports usa barra inline `bg-muted/bg-hub-blue` em vez do `<Progress>`. | Criar componente `<HubProgress>` que padroniza. | Melhoria |
| `Card` shadcn vs `rounded-2xl bg-card border border-border/50` | Quase ninguém usa `<Card>`. | **SUGERIDO** criar `<HubCard>` (e variantes `Section`, `KPI`). | Melhoria |
| Não há `<HubPageHeader>` | Cada página repete header inline. | **SUGERIDO** criar componente. | Melhoria |
| Sem token de sombra `hub-primary` | Glow do botão primário fica inline. | Incluído como SUGERIDO no preset (seção 5). | Melhoria |
| Sem token de chart | Charts repetem `hsl(var(--hub-blue))`. | **SUGERIDO** `--chart-1..6` mapeando `hub-*`. | Melhoria |
| `App.css` legado | Contém regras de logo girando do template Vite. Não usado. | Remover. | Limpeza |

---

## 25. Recomendações para padronização

1. **Criar componentes wrapper** (todos opcionais — o sistema atual funciona, mas centralizar reduz drift):
   - `<HubCard variant="section|kpi|hero">`
   - `<HubPageHeader title subtitle actions />`
   - `<HubFilterBar>` agrupando `FilterPills`+search+selects
   - `<HubEmptyState icon title description action />`
   - `<HubLoading />`
   - `<HubProgress value max tone />`
2. **Tokens novos sugeridos** (`SUGERIDO`):
   - `--shell-bg`, `--shell-card` (substituem literais brancos/pretos)
   - `--surface-strong`, `--surface-stronger` (FilterPills)
   - `--text-muted-strong` (≈ `text-foreground/70`)
   - `--chart-1..6` alinhados a `hub-*`
   - `--shadow-hub-primary` (já no preset)
   - `--ease-hub` (`cubic-bezier(0.32, 0.72, 0, 1)`) já como `transitionTimingFunction.hub-ease`
3. **Classes utilitárias novas em `@layer components`**:
   - `.nav-active-bg` + `.nav-active-border` (substituem o gradient inline)
   - `.kpi-label` (`text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium`)
   - `.kpi-value` (`font-display font-semibold tracking-tight leading-none`)
4. **Acessibilidade**: adicionar `tabular-nums` em colunas numéricas, garantir `aria-label` em todos `Button variant="icon"`, revisar contraste do `text-foreground/70` no light (limite WCAG AA).
5. **Responsividade**: padronizar breakpoints para esconder/mostrar colunas; criar `useResponsiveColumns()` helper.
6. **Limpeza**: remover `src/App.css` (legado Vite). Remover imports não usados nos arquivos.

---

## 26. Prompt mestre para criar novas telas com a identidade do Reports

> Copie integralmente em qualquer IA (Lovable, Claude, Cursor, ChatGPT) ao iniciar uma nova aplicação ou tela.

```text
Você vai construir telas em React + Vite + TypeScript + Tailwind CSS + shadcn/ui seguindo FIELMENTE o design system do app "Relatórios Grupo Pomin". Aja como um engenheiro front-end sênior obcecado por consistência.

IDENTIDADE VISUAL OBRIGATÓRIA
- Stack: React 18, Vite, TS, Tailwind v3, shadcn/ui (Radix), lucide-react. Charts em Recharts. Tema controlado por classe `.dark` no <html>.
- Fonte única: Oxanium (Google Fonts), pesos 300-700, aplicada globalmente em html, body, button, input, select, textarea.
- Identidade: app shell executivo, denso, sério, levemente premium. Sidebar lateral que expande no hover (64px → 240px). Header sticky h-16. Conteúdo em card branco/preto arredondado.

TOKENS OBRIGATÓRIOS (HSL em :root e .dark, ver bloco CSS fornecido)
- Use SOMENTE: bg-background, bg-card, bg-popover, bg-muted, bg-secondary, bg-accent, bg-primary, bg-destructive, bg-success, bg-warning, text-foreground, text-muted-foreground, text-primary, text-success, text-warning, text-destructive, border-border, border-input, ring-ring, e a paleta categórica hub-blue, hub-blue-soft, hub-amber, hub-emerald, hub-indigo, hub-rose.
- PROIBIDO: text-white, bg-black, text-gray-*, bg-slate-*, qualquer hex literal fora destas exceções autorizadas: #FFFFFF e #070707 (shell), #F7F9FB e #14161A (hub-card), hsl(215 15% 11%) e hsl(215 15% 19%) (FilterPills), rgba(76,124,149,…) (gradient do nav ativo).
- Radius base: 5px (rounded-md/lg/xl). Cards de painel podem usar rounded-2xl (6px) ou rounded-3xl (8px). Avatares: rounded-[3px]. Badges de status: rounded (5px).

COMPONENTES OBRIGATÓRIOS
- KPIs: SEMPRE via componente StatCard (dot+label uppercase+valor display, tones blue/emerald/amber/rose/indigo/neutral).
- Status semântico: SEMPRE via StatusBadge (suporta pending, late, completed_on_time, delivered_late, approved, pending_approval, adjustment_requested, rejected, not_started, completed, delayed, cancelled, praise, improvement, guidance, alert, mixed).
- Filtros enum: SEMPRE via FilterPills (p-0.5 bg-muted/60 dark:bg-[hsl(215_15%_11%)], item ativo bg-card shadow-sm).
- Avatar de usuário: SEMPRE via UserAvatar (fallback hub-gradient + iniciais).
- Cards: rounded-2xl bg-card border border-border/50 p-6 (ou .hub-card para o literal #F7F9FB/#14161A).
- Linhas de listagem densa: .hub-row + grid de colunas.
- Botões: shadcn Button (variants default/outline/ghost/secondary/destructive/link, sizes default/sm/lg/icon). CTA premium opcional: .hub-btn-primary (glow azul).
- Ícones: lucide-react SOMENTE, strokeWidth=1.75, w-4 h-4 inline, w-5 h-5 em botões icon, w-[17px] em nav.

LAYOUT / SHELL
- App em HubLayout: sidebar fixa esquerda 64↔240px (var(--sb-open|sb-closed)), header h-16 fixed top, main em card interno rounded-[5px] com margin 8-12px do viewport.
- Easing oficial: cubic-bezier(0.32, 0.72, 0, 1) para sidebar/header. Duração 500ms para layout shift, 300ms para opacidade.
- Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536, 3xl 1920.
- Sidebar desktop só em lg+. Mobile usa Sheet lateral 280px.

DARK / LIGHT
- Tema controlado por classList toggle('dark') em document.documentElement.
- TODOS os componentes devem responder a .dark sem ajustes manuais. Quando precisar de cor literal sutil, use bg-black/[0.04] dark:bg-white/[0.04] e border-black/[0.06] dark:border-white/[0.10].
- O --primary inverte: escuro (azul Pomin) no light, claro no dark. Garanta contraste.

RESPONSIVIDADE
- Mobile-first. Padding p-3 sm:p-6. Ações ocultam label (hidden sm:inline). Tabelas escondem colunas secundárias (hidden md:block).
- KPI grid padrão: grid-cols-2 sm:grid-cols-4 gap-3. KPI ricos com texto longo: grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start.

UX / HIERARQUIA VISUAL
- 1 CTA primário por tela. Demais ações em outline/ghost.
- Tipografia: títulos font-display semibold tracking-tight; valores leading-none; labels uppercase tracking-[0.08em] muted; body text-sm; helper text-[12px] muted.
- Cores categóricas: blue=total/info, emerald=sucesso, amber=atenção/pendente, rose=erro/atrasado, indigo=misto, neutral=desligado.
- Espaçamento: space-y-6 entre seções, gap-3/4 dentro de grids, p-6 nos cards de painel.

PROIBIÇÕES
- Não usar Inter/Roboto/qualquer outra fonte.
- Não usar Material/Ant Design/Chakra.
- Não usar cores hex literais fora das exceções listadas.
- Não criar sombras coloridas (exceto hub-btn-primary).
- Não criar Card/PageHeader/Sidebar do zero — reaproveite os existentes.
- Não usar emojis em componentes funcionais.

CHECKLIST FINAL DE VALIDAÇÃO (rode antes de entregar)
1. Cores: somente tokens semânticos + 6 literais autorizadas.
2. Fonte Oxanium aplicada em html/body/inputs/botões.
3. Radius 5px base, 6-8px em cards de painel.
4. KPIs em StatCard, status em StatusBadge, filtros em FilterPills, avatar em UserAvatar.
5. Sidebar e header reaproveitados ou seguindo o gradient ativo + easing iOS.
6. Dark mode verificado (todos os pares dark: presentes).
7. Foco visível em todos os interativos (ring-ring ring-offset-2).
8. Mobile responsivo (Sheet menu funcionando, padding p-3 mobile/p-6 desktop).
9. lucide-react com strokeWidth=1.75.
10. Espaçamento space-y-6 entre seções, gap-3/4 dentro.

[Anexar o bloco CSS da seção 4 e o preset Tailwind da seção 5 do design system master ao prompt.]
```

---

## 27. Checklist visual de validação

- [ ] Apenas tokens semânticos + 6 literais autorizadas (seção 2.3).
- [ ] Fonte Oxanium em html/body/inputs/botões.
- [ ] Pesos 400/500/600 (sem font-bold em texto corrido).
- [ ] Radius 5px nos elementos comuns; 6-8px em cards de painel.
- [ ] Cards usam `rounded-2xl bg-card border border-border/50 p-6` (ou `.hub-card`).
- [ ] KPIs implementados via `<StatCard>` com `tone` correto.
- [ ] Status implementados via `<StatusBadge>`.
- [ ] Filtros enum via `<FilterPills>` com contagem inline.
- [ ] Avatares via `<UserAvatar>`.
- [ ] Botões shadcn com variantes oficiais (sem custom de cor).
- [ ] Apenas lucide-react para ícones, `strokeWidth={1.75}`, tamanho coerente.
- [ ] Sidebar + Header reaproveitados (ou recriados com gradient ativo exato).
- [ ] Sidebar lateral fixa com largura `var(--sb-open|sb-closed)` e easing `cubic-bezier(0.32, 0.72, 0, 1)`.
- [ ] Header `h-16 fixed top-0`, padding-left animado em sincronia com sidebar.
- [ ] Mobile: Sheet `w-[280px]`, padding `p-3 sm:p-6`, colunas secundárias escondidas.
- [ ] Dark mode: todos componentes têm par `dark:` para cores custom; sem `text-white`/`bg-black` literais.
- [ ] Light mode: contraste WCAG AA em textos auxiliares.
- [ ] Focus visível com `ring-ring ring-offset-2` em interativos.
- [ ] Hover/active sutis (`bg-black/[0.04] dark:bg-white/[0.04]`).
- [ ] Sem sombras pesadas (apenas `shadow-sm/md/lg` e `.hub-btn-primary`).
- [ ] Sem gradientes além de `hub-gradient`, `hub-gradient-subtle` e o gradient do nav ativo.
- [ ] Tipografia hierárquica: títulos `font-display semibold tracking-tight`; valores `leading-none`; labels uppercase muted.
- [ ] Espaçamento: `space-y-6` entre seções, `gap-3`/`gap-4` em grids.
- [ ] 1 CTA primário por tela.
- [ ] Empty/Loading/Error states implementados (seção 11.19-11.20).
- [ ] Sem cores ou tokens inventados sem justificativa.
- [ ] Sem classes inconsistentes ou duplicadas — usar `cn()` para compor.

---

## 28. Como usar este arquivo em outras aplicações

1. **Inicialize o projeto** com Vite + React + TS + Tailwind + shadcn/ui. Instale `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `recharts`.
2. **Copie o bloco CSS da seção 4** para o `src/index.css` da nova aplicação (substitui o `:root` e `.dark` padrões).
3. **Copie o preset da seção 5** como `reports-tailwind-preset.ts` e use em `tailwind.config.ts`:
   ```ts
   import reportsPreset from "./reports-tailwind-preset";
   export default { presets: [reportsPreset], content: [...] };
   ```
4. **Crie o `ThemeContext`** (idêntico ao de `src/contexts/ThemeContext.tsx`).
5. **Implemente o app shell** seguindo `HubLayout`/`HubSidebar`/`HubHeader` (seções 7.1 e 19).
6. **Cole os componentes-chave**: `StatCard`, `StatusBadge`, `FilterPills`, `UserAvatar`, `Sparkline`. Ajuste imports.
7. **Aplique o prompt mestre da seção 26** em qualquer IA ao gerar novas telas. Sempre anexe os blocos CSS e preset.
8. **Valide cada tela** com o checklist da seção 27 antes do merge.
9. **Em Lovable**: cole o prompt mestre na primeira mensagem do projeto. A IA herdará a identidade.
10. **Em Cursor/Claude Code**: salve este arquivo em `docs/design-system.md` da nova aplicação e referencie em `.cursorrules` ou system prompt.

---

## 29. Resumo executivo final

### Principais tokens encontrados
- **Cor de marca:** `--primary 209 84% 36%` (light) / `197 71% 70%` (dark).
- **Glow/secundária:** `--primary-glow 197 71% 70%`.
- **Superfícies:** `--card 210 25% 98%` / `220 10% 9%`. Literais `#F7F9FB`/`#14161A` em `.hub-card`.
- **Paleta categórica:** `hub-blue, hub-blue-soft, hub-amber, hub-emerald, hub-indigo, hub-rose`.
- **Estados:** `--success 160 70% 38%`, `--warning 38 92% 50%`, `--destructive 0 75% 55%`.
- **Radius base:** 5px (`--radius`). Cards 6-8px.
- **Fonte única:** Oxanium 300-700.
- **Easing oficial:** `cubic-bezier(0.32, 0.72, 0, 1)`.
- **Sidebar widths:** `--sb-open 240/280/320px`, `--sb-closed 64/72/80px`.

### Principais padrões visuais
1. App shell com sidebar hover-to-expand e header sticky.
2. Cards com radius 6-8px, borda 1px com opacidade 6-10%, fundo `bg-card`/`#F7F9FB`/`#14161A`.
3. KPIs com **dot + label uppercase + valor display** (`StatCard`).
4. Status pill com par cor/borda 15%/30% (`StatusBadge`).
5. Filtros em pílulas com contagem (`FilterPills`).
6. Item de nav ativo com gradient `rgba(76,124,149,…)` + borda em `mask-composite`.
7. Botão premium com glow azul (`.hub-btn-primary`).
8. Hovers sutis `bg-black/[0.04] dark:bg-white/[0.04]`.
9. Tipografia hierárquica Oxanium semibold + tracking-tight para valores.
10. Dark mode “OLED-friendly” com fundo `#070707`.

### Componentes mais importantes (top 10)
1. `HubLayout` / `HubSidebar` / `HubHeader`
2. `StatCard`
3. `StatusBadge`
4. `FilterPills`
5. `UserAvatar`
6. `Sparkline` / `StadiumBars`
7. shadcn `Button`, `Input`, `Label`, `Dialog`, `Sheet`, `DropdownMenu`, `Popover`, `Command`, `Tooltip`, `Sonner`
8. `NotificationHub`
9. `InsightsScopePicker`
10. `.hub-card` / `.hub-row` / `.hub-btn-primary` (classes utilitárias)

### Pontos críticos para manter fidelidade
- Não introduzir nova fonte.
- Não introduzir nova paleta de cores.
- Manter o gradient exato do nav ativo (assinatura do app).
- Manter easing e durações do shell (sidebar 500ms iOS curve).
- Manter `strokeWidth=1.75` nos ícones.
- Manter o app shell — não criar página fora do `HubLayout`.

### Inconsistências encontradas (resumo)
- Cards literais (`#F7F9FB`, `#14161A`) deveriam virar tokens `--shell-card`.
- `FilterPills` usa HSL literais que poderiam ser `--surface-strong`.
- Gradient do nav ativo repetido 4x — virar classe utilitária.
- Falta `<HubCard>`, `<HubPageHeader>`, `<HubEmptyState>` centralizados.
- Falta tokens de chart (`--chart-1..6`).
- `App.css` legado pode ser removido.

### Recomendações para usar este arquivo em futuras aplicações
1. Cole o **bloco CSS** (seção 4) e o **preset Tailwind** (seção 5) **antes de qualquer componente** novo.
2. Replique o **app shell** (`HubLayout`) — ele é a base da identidade.
3. Use o **prompt mestre da seção 26** para guiar qualquer IA.
4. Rode o **checklist da seção 27** em cada PR.
5. Quando precisar de um componente que não existe, prefira **estender StatCard/StatusBadge/FilterPills** em vez de criar do zero.
6. Para apps fora do domínio Reports, mantenha tokens e shell, mas troque apenas o **logo** e a **lista de rotas da sidebar**.

---

**Fim do documento.** Este arquivo é a fonte oficial de verdade visual do sistema **Relatórios Grupo Pomin**. Qualquer divergência entre código e este documento deve ser tratada com PR de alinhamento.
