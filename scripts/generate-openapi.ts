import fs from "node:fs";
import path from "node:path";

import { OpenApiGeneratorV3 } from
  "@asteasolutions/zod-to-openapi";

import { registry } from "../src/lib/openapi/registry";

// Importamos las definiciones de todos los endpoints
import "../src/lib/openapi/routes";

const generator = new OpenApiGeneratorV3(
  registry.definitions
);

const document = generator.generateDocument({
  openapi: "3.0.0",

  info: {
    title: "InventCatag API",
    version: "1.0.0",
    description:
      "Documentación técnica de los servicios API de InventCatag.",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local de desarrollo",
    },
  ],
});

const outputPath = path.join(
  process.cwd(),
  "docs",
  "openapi.json"
);

fs.mkdirSync(path.dirname(outputPath), {
  recursive: true,
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(document, null, 2),
  "utf-8"
);

console.log("Documentación OpenAPI generada correctamente.");