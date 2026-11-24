import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire, Module } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const React = require("next/dist/compiled/react");
const { renderToString } = require("next/dist/compiled/react-dom/server.node");
const { transformSync } = require("next/dist/build/swc");

function collectionComponent() {
  const filename = fileURLToPath(new URL("../components/PadelCollectionConcept.jsx", import.meta.url));
  const { code } = transformSync(readFileSync(filename, "utf8"), {
    filename,
    jsc: {
      parser: { syntax: "ecmascript", jsx: true },
      transform: { react: { runtime: "automatic" } },
      target: "es2022",
    },
    module: { type: "commonjs" },
  });
  const component = new Module(filename);
  component.filename = filename;
  component.require = (id) => {
    // Keep this regression focused on React's actual SVG/title serialization.
    if (id === "next/link") return function TestLink({ children, ...props }) { return React.createElement("a", props, children); };
    if (id === "next/image") return function TestImage(props) { return React.createElement("img", props); };
    if (id.endsWith(".module.css")) return { __esModule: true, default: {} };
    if (id === "react" || id.startsWith("react/")) return require(`next/dist/compiled/${id}`);
    throw new Error(`Unexpected collection test import: ${id}`);
  };
  component._compile(code, filename);
  return component.exports.default;
}

test("collection SVGs retain accessible titles in server HTML before hydration", (t) => {
  const warnings = t.mock.method(console, "error", () => {});
  const html = renderToString(React.createElement(collectionComponent()));
  const titles = [...html.matchAll(/<title id="interior-concept-([^"]+)">([^<]*)<\/title>/g)];
  assert.deepEqual(titles.map((match) => match[1]), ["S005", "S004", "S003", "PDB017"]);
  for (const [, sku, text] of titles) {
    assert.ok(text.startsWith(`${sku} proposed interior: `), `${sku} has an empty or incorrect SSR title`);
    assert.ok(text.length > `${sku} proposed interior: `.length, `${sku} is missing its descriptive title`);
    assert.ok(html.includes(`aria-labelledby="interior-concept-${sku}"`));
  }
  assert.equal(warnings.mock.callCount(), 0, "SSR must not warn about invalid title children");
});
