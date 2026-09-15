import { build } from "esbuild";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(outputDir, "../..");

const variants = [
  {
    file: "mvp-v1.html",
    title: "MVP V1 · Visão compartilhada",
    description: "MVP V1 completo em um único arquivo HTML.",
    entry: 'import "./mvp/public-share/styles.css"; import "./mvp/public-share/ledger.css"; import "./mvp/public-share/bootstrap.js";',
    body: '<div id="app"></div><div id="modal-root"></div><div id="toast-root" class="toast-root" aria-live="polite"></div>',
  },
  {
    file: "mvp-v2.html",
    title: "MVP V2 · Visão anual por sócio",
    description: "MVP V2 completo em um único arquivo HTML.",
    entry: 'import "./mvp/public-share-v2/bootstrap.js";',
    body: '<div id="app"></div>',
  },
];

for (const variant of variants) {
  const result = await build({
    absWorkingDir: root,
    stdin: { contents: variant.entry, resolveDir: root, sourcefile: `${variant.file}.js` },
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    charset: "utf8",
    write: false,
    outfile: path.join(outputDir, `${variant.file}.js`),
    logLevel: "silent",
  });
  const script = result.outputFiles.find((file) => file.path.endsWith(".js"))?.text;
  const style = result.outputFiles.find((file) => file.path.endsWith(".css"))?.text;
  if (!script || !style) throw new Error(`Bundle incompleto para ${variant.file}`);
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="description" content="${variant.description}">
  <title>${variant.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${style.replace(/<\/style/gi, "<\\/style")}</style>
</head>
<body>
  ${variant.body}
  <noscript><main class="noscript-card">Este MVP precisa de JavaScript habilitado.</main></noscript>
  <script type="module">${script.replace(/<\/script/gi, "<\\/script")}</script>
</body>
</html>
`;
  await writeFile(path.join(outputDir, variant.file), html, "utf8");
}

process.stdout.write(`Arquivos únicos gerados em ${outputDir}\n`);
