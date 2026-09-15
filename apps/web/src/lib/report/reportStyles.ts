export const REPORT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700&display=swap');

@page { size: A4 portrait; margin: 15mm 13mm 16mm; }

:root {
  --rp-background: 205 40% 98%;
  --rp-foreground: 215 25% 14%;
  --rp-card: 0 0% 100%;
  --rp-muted: 210 30% 96%;
  --rp-muted-foreground: 211 17% 38%;
  --rp-border: 210 25% 88%;
  --rp-primary: 207 85% 28%;
  --rp-primary-vivid: 205 83% 39%;
  --rp-primary-soft: 207 80% 94%;
  --rp-success: 155 69% 28%;
  --rp-success-soft: 155 48% 93%;
  --rp-warning: 39 93% 28%;
  --rp-warning-soft: 39 80% 92%;
  --rp-destructive: 4 68% 44%;
  --rp-destructive-soft: 4 70% 94%;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: hsl(var(--rp-background));
  color: hsl(var(--rp-foreground));
  font-family: 'Oxanium', system-ui, sans-serif;
  font-size: 11px;
  line-height: 1.5;
  print-color-adjust: exact;
}
.rp-page { max-width: 200mm; margin: 0 auto; padding: 18px 20px 40px; }
.rp-cover {
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
  padding: 26px 28px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, hsl(var(--rp-primary)), hsl(var(--rp-primary-vivid)));
  color: hsl(0 0% 100%);
  break-inside: avoid;
}
.rp-brand { display: flex; align-items: center; gap: 9px; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; }
.rp-brand i { display: block; width: 9px; height: 9px; border-radius: 2px; background: currentColor; }
.rp-cover h1 { max-width: 88%; margin: 14px 0 0; font-size: 23px; line-height: 1.15; letter-spacing: -.03em; }
.rp-scope { max-width: 88%; margin: 9px 0 0; font-size: 12px; font-weight: 500; }
.rp-cover-meta { position: relative; display: flex; flex-wrap: wrap; gap: 22px; margin-top: 18px; }
.rp-cover-meta span { display: block; font-size: 8.5px; letter-spacing: .13em; text-transform: uppercase; opacity: .78; }
.rp-cover-meta strong { display: block; margin-top: 3px; font-size: 12px; font-variant-numeric: tabular-nums; }
.rp-section { margin-bottom: 13px; padding: 16px 18px 17px; border: 1px solid hsl(var(--rp-border)); border-radius: 8px; background: hsl(var(--rp-card)); }
.rp-solid, .rp-kpis, .rp-kpi, .rp-note, .rp-empty, .rp-bar-wrap, .rp-focus-head { break-inside: avoid; }
.rp-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 12px; break-after: avoid; }
.rp-subhead { margin-top: 18px; }
.rp-head h2 { margin: 0; font-size: 13px; letter-spacing: -.015em; }
.rp-head span { color: hsl(var(--rp-muted-foreground)); font-size: 9.5px; }
.rp-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; }
.rp-kpi { padding: 11px 12px; border: 1px solid hsl(var(--rp-border)); border-radius: 6px; background: hsl(var(--rp-background)); }
.rp-kpi span { display: flex; align-items: center; gap: 5px; color: hsl(var(--rp-muted-foreground)); font-size: 8.5px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
.rp-kpi span::before { width: 6px; height: 6px; border-radius: 50%; background: hsl(var(--rp-primary)); content: ''; }
.rp-kpi.ok span::before { background: hsl(var(--rp-success)); }
.rp-kpi.warn span::before { background: hsl(var(--rp-warning)); }
.rp-kpi.bad span::before { background: hsl(var(--rp-destructive)); }
.rp-kpi strong { display: block; margin-top: 6px; font-size: 16px; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.rp-kpi small { display: block; margin-top: 3px; color: hsl(var(--rp-muted-foreground)); font-size: 9px; }
.rp-bar-wrap { margin-top: 14px; }
.rp-bar { position: relative; height: 9px; border-radius: 999px; background: hsl(var(--rp-muted)); }
.rp-bar i { position: absolute; inset: 0 auto 0 0; border-radius: inherit; background: linear-gradient(90deg, hsl(var(--rp-primary)), hsl(var(--rp-primary-vivid)), hsl(var(--rp-success))); }
.rp-bar b { position: absolute; top: 50%; width: 8px; height: 8px; margin-left: -4px; transform: translateY(-50%); border: 2px solid hsl(var(--rp-primary)); border-radius: 50%; background: hsl(var(--rp-card)); }
.rp-bar-legend { display: flex; justify-content: space-between; gap: 10px; margin-top: 7px; color: hsl(var(--rp-muted-foreground)); font-size: 9px; }
.rp-bar-legend strong { color: hsl(var(--rp-foreground)); }
.rp-table-wrap { margin-top: 4px; overflow: hidden; }
.rp-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
.rp-table thead { display: table-header-group; }
.rp-table tfoot { display: table-row-group; }
.rp-table tr { break-inside: avoid; page-break-inside: avoid; }
.rp-table th { padding: 0 8px 7px; border-bottom: 1px solid hsl(var(--rp-border)); color: hsl(var(--rp-muted-foreground)); font-size: 8px; font-weight: 600; letter-spacing: .1em; text-align: left; text-transform: uppercase; white-space: nowrap; }
.rp-table td { padding: 7px 8px; border-bottom: 1px solid hsl(var(--rp-border) / .55); vertical-align: top; }
.rp-table th:first-child, .rp-table td:first-child { min-width: 120px; }
.rp-table tbody tr:nth-child(even) td { background: hsl(var(--rp-background)); }
.rp-table .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.rp-table .strong, .rp-name { font-weight: 600; }
.rp-table tfoot td { border-top: 1.5px solid hsl(var(--rp-border)); border-bottom: 0; background: hsl(var(--rp-muted)); font-weight: 700; }
.rp-sub { display: block; margin-top: 2px; color: hsl(var(--rp-muted-foreground)); font-size: 8.5px; font-weight: 400; }
.rp-tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.rp-tag.n { background: hsl(var(--rp-muted)); color: hsl(var(--rp-muted-foreground)); }
.rp-tag.b { background: hsl(var(--rp-primary-soft)); color: hsl(var(--rp-primary)); }
.rp-tag.g { background: hsl(var(--rp-success-soft)); color: hsl(var(--rp-success)); }
.rp-tag.r { background: hsl(var(--rp-destructive-soft)); color: hsl(var(--rp-destructive)); }
.rp-tag.a { background: hsl(var(--rp-warning-soft)); color: hsl(var(--rp-warning)); }
.rp-mini { display: inline-flex; align-items: center; gap: 6px; }
.rp-meter { width: 52px; height: 5px; overflow: hidden; border-radius: 999px; background: hsl(var(--rp-muted)); }
.rp-meter i { display: block; height: 100%; border-radius: inherit; background: hsl(var(--rp-primary-vivid)); }
.rp-focus { border-color: hsl(var(--rp-primary) / .25); background: hsl(var(--rp-primary-soft) / .45); }
.rp-focus-head { display: flex; align-items: center; gap: 13px; margin-bottom: 14px; }
.rp-avatar { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 5px; background: hsl(var(--rp-primary)); color: hsl(0 0% 100%); font-size: 14px; font-weight: 700; }
.rp-focus-head h2 { margin: 0; font-size: 15px; letter-spacing: -.02em; }
.rp-focus-head p { margin: 3px 0 0; color: hsl(var(--rp-muted-foreground)); font-size: 10px; }
.rp-note { margin-top: 12px; padding: 10px 12px; border: 1px solid hsl(var(--rp-warning) / .28); border-radius: 6px; background: hsl(var(--rp-warning-soft)); color: hsl(var(--rp-warning)); font-size: 9.5px; }
.rp-note.info { border-color: hsl(var(--rp-primary) / .24); background: hsl(var(--rp-primary-soft)); color: hsl(var(--rp-primary)); }
.rp-note strong { font-weight: 700; }
.rp-empty { padding: 16px; border: 1px dashed hsl(var(--rp-border)); border-radius: 6px; color: hsl(var(--rp-muted-foreground)); text-align: center; }
.rp-footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid hsl(var(--rp-border)); color: hsl(var(--rp-muted-foreground)); font-size: 8.5px; }
.rp-break { break-before: page; }

@media print {
  body { background: hsl(var(--rp-card)); }
  .rp-page { max-width: none; padding: 0; }
  .rp-section { margin-bottom: 10px; }
}
@media (max-width: 640px) {
  .rp-kpis { grid-template-columns: 1fr 1fr; }
  .rp-page { padding: 12px 12px 30px; }
}
`;
