import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

for (const file of ["mvp-v1.html", "mvp-v2.html"]) {
  const html = await readFile(new URL(file, import.meta.url), "utf8");
  const info = await stat(new URL(file, import.meta.url));
  assert.match(html, /<style>[\s\S]*--background:/, `${file} deve conter o design system.`);
  assert.match(html, /<script type="module">[\s\S]+<\/script>/, `${file} deve conter o JavaScript.`);
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"[^>]+href="\.\.?\//, `${file} não pode depender de CSS local.`);
  assert.doesNotMatch(html, /<script[^>]+src="\.\.?\//, `${file} não pode depender de JavaScript local.`);
  assert.ok(info.size > 50000, `${file} parece incompleto.`);
}

process.stdout.write("Single HTML checks: passed (CSS and JavaScript embedded, no local dependencies)\n");
