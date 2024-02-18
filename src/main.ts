import {
  Command,
  CompletionsCommand,
  // DenoLandProvider,
  HelpCommand,
  // UpgradeCommand,
} from "cliffy/command/mod.ts";
import { generateImportMap } from "./commands/gen_importmap.ts";

const cmd = new Command()
  .name("jsr")
  .version("0.0.1")
  .description(
    "JavaScript Registry Tools",
  )
  .meta("deno", Deno.version.deno)
  .meta("v8", Deno.version.v8)
  .meta("typescript", Deno.version.typescript)
  /**
   * Generate Importmap Command
   */
  .command(
    "gen-importmap",
    "Generates an importmap to make your package browser-compatible",
  )
  .arguments("<project-folder:file>")
  .action(generateImportMap)
  /** Default commands */
  .command("help", new HelpCommand().global())
  .command("completions", new CompletionsCommand());
// Watching https://github.com/c4spar/deno-cliffy/issues/302
// .command(
//   "upgrade",
//   new UpgradeCommand({
//     main: "src/main.ts",
//     args: ["--allow-net"],
//     provider: new DenoLandProvider(),
//   }),
// )

await cmd.parse(Deno.args);
