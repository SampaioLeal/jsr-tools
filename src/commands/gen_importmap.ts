import { parse, resolve } from "deno/path/mod.ts";
import { parse as parseJsonc } from "deno/jsonc/mod.ts";
import $ from "dax/mod.ts";

export async function generateImportMap(_options: void, path: string) {
  const resolvedPath = resolve(path);
  const parsedPath = parse(resolvedPath);
  const modulesList: string[] = [];
  const importMap: Map<string, string> = new Map();

  if (parsedPath.ext) {
    throw new Error("Path is not a folder");
  }

  let packageDefinitionPath = "";

  for await (const entry of Deno.readDir(resolvedPath)) {
    if (entry.isDirectory) continue;

    if (
      entry.name === "deno.json" || entry.name === "jsr.json" ||
      entry.name === "deno.jsonc" || entry.name === "jsr.jsonc"
    ) {
      packageDefinitionPath = resolve(resolvedPath, entry.name);
      break;
    }
  }

  if (!packageDefinitionPath) {
    throw new Error(
      "No jsr.json[c] or deno.json[c] found on the specified folder",
    );
  }

  const packageFile = await Deno.readTextFile(packageDefinitionPath);
  const packageDefinition = packageDefinitionPath.endsWith(".jsonc")
    ? parseJsonc(packageFile)
    : JSON.parse(packageFile);

  if (typeof packageDefinition.exports === "string") {
    modulesList.push(resolve(resolvedPath, packageDefinition.exports));
  } else if (typeof packageDefinition.exports === "object") {
    Object.values(packageDefinition.exports).forEach((value) => {
      modulesList.push(resolve(resolvedPath, value as string));
    });
  }

  // map every export and run deno info --json
  for (const modulePath of modulesList) {
    const moduleInfo = await $`deno info --json ${modulePath}`.json();

    Object.entries(moduleInfo.redirects).forEach(([lib, uri]) => {
      importMap.set(lib, uri as string);
    });
  }

  const imports = [...importMap.entries()].map(([lib, uri]) =>
    `"${lib}": "${uri}"`
  ).join(",\n      ");

  console.log(`<script type="importmap">
  {
    "imports": {
      ${imports}
    }
  }
</script>`);
}
