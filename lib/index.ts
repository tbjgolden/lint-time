import { globToRegex } from "./glob";
import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { relative } from "node:path/posix";

type Instruction = [glob: string, ...commands: string[]];

const MAX_ARG_LENGTH = 120_000;

export const lintTime = async (): Promise<boolean> => {
  const json = JSON.parse(await readFile("package.json", "utf8"));

  let instructions: Instruction[];
  if (
    Array.isArray(json["lint-time"]) &&
    json["lint-time"].every((x) => Array.isArray(x) && x.every((y) => typeof y === "string"))
  ) {
    for (const instruction of json["lint-time"]) {
      if (instruction.length < 2) {
        throw new Error(`${JSON.stringify(instruction)} is not a valid instruction`);
      }
    }
    instructions = json["lint-time"];
  } else {
    throw new Error(`"lint-time" key must appear in package.json and must be of type string[][]`);
  }

  const stagedFilePaths = execSync("git diff --diff-filter=ACM --name-only --cached")
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((filePath) => process.cwd() + "/" + filePath);

  const pipelines = instructionsToPipelines(instructions, stagedFilePaths);

  try {
    await Promise.all(
      pipelines.map(async ([commands, entries]) => {
        for (const [i, command] of commands.entries()) {
          const filePaths = entries
            .filter(([, steps]) => steps.has(i))
            .map(([filePath]) => shellEscape(relative(process.cwd(), filePath)));

          const chunks: string[][] = [[]];
          let leftInChunk = MAX_ARG_LENGTH - command.length;
          let activeChunk = chunks[0];

          for (const filePath of filePaths) {
            if (leftInChunk > filePath.length || activeChunk.length === 0) {
              activeChunk.push(filePath);
            } else {
              activeChunk = [filePath];
              chunks.push(activeChunk);
              leftInChunk = MAX_ARG_LENGTH - command.length;
            }
          }

          for (const chunk of chunks) {
            try {
              execSync(`${command} ${chunk.join(" ")}`, { stdio: "inherit" });
            } catch (error) {
              const error_ =
                error && typeof error === "object" && "status" in error && error.status
                  ? error.status
                  : error;
              throw error_;
            }
          }
        }
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    return false;
  }
  return true;
};

type Pipeline = [commands: string[], entries: [filePath: string, steps: Set<number>][]];

const instructionsToPipelines = (instructions: Instruction[], filePaths: string[]): Pipeline[] => {
  const fileCommandsMap = new Map<string, string[]>();

  for (const [glob_, ...commands] of instructions) {
    let glob = glob_;
    if (glob.startsWith("/")) {
      glob = glob.slice(1);
    } else if (!glob.startsWith("**/")) {
      glob = "**/" + glob;
    }

    const regex = globToRegex(glob);
    for (const filePath of filePaths) {
      if (regex.test(filePath)) {
        const maybeFileCommands = fileCommandsMap.get(filePath);
        let fileCommands: string[];
        if (maybeFileCommands) {
          fileCommands = maybeFileCommands;
        } else {
          fileCommands = [];
          fileCommandsMap.set(filePath, fileCommands);
        }
        fileCommands.push(...commands);
      }
    }
  }

  const sortedFileInstructionSets = [...fileCommandsMap.entries()].sort(
    ([, a], [, b]) => b.length - a.length
  );

  const pipelines: [commands: string[], entries: [filePath: string, steps: Set<number>][]][] = [];
  file: for (const [filePath, commands] of sortedFileInstructionSets) {
    for (const pipeline of pipelines) {
      const steps = new Set<number>();
      let j = 0;
      for (let i = 0; i < pipeline[0].length; i++) {
        if (commands[j] === pipeline[0][i]) {
          steps.add(j);
          j += 1;
          if (j === commands.length) break;
        }
      }
      const couldFileUsePipeline = j === commands.length;
      if (couldFileUsePipeline) {
        pipeline[1].push([filePath, steps]);
        continue file;
      }
    }
    pipelines.push([commands, [[filePath, new Set(commands.map((_, i) => i))]]]);
  }

  for (const pipeline of pipelines) {
    const gitAddIndex = pipeline[0].length;
    pipeline[0].push("git add");
    for (const fileData of pipeline[1]) {
      fileData[1].add(gitAddIndex);
    }
  }

  return pipelines;
};

const REQUIRES_ESCAPE_REGEX = /[^\w/:=-]/;
const QUOTE_REGEX = /'/g;
const LEADING_QUOTES_REGEX = /^(?:'')+/g;
const BACKSLASH_QUOTES_REGEX = /\\'''/g;

const shellEscape = (arg: string): string =>
  REQUIRES_ESCAPE_REGEX.test(arg)
    ? `'${arg.replace(QUOTE_REGEX, "'\\''")}'`
        .replace(LEADING_QUOTES_REGEX, "")
        .replace(BACKSLASH_QUOTES_REGEX, "\\'")
    : arg;
