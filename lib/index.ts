import { globToRegex } from "./glob";
import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";

type Instruction = [glob: string, ...commands: string[]];

export const lintTime = async (): Promise<string> => {
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

  // get all files
  instructionsToDirections(instructions, stagedFilePaths);

  return ":)";
};

export const instructionsToDirections = (instructions: Instruction[], filePaths: string[]) => {
  for (let [glob] of instructions) {
    if (glob.startsWith("/")) {
      glob = glob.slice(1);
    } else if (!glob.startsWith("**/")) {
      glob = "**/" + glob;
    }

    const regex = globToRegex(glob);
    // eslint-disable-next-line no-console
    console.log(regex, filePaths);
    const matchingFilePaths = filePaths.filter((filePath) => regex.test(filePath));
    // eslint-disable-next-line no-console
    console.log(matchingFilePaths);
  }
};

lintTime();

// ✔ Preparing lint-staged...
// ❯ Running tasks for staged files...
//   ❯ packages/frontend/.lintstagedrc.json — 1 file
//     ↓ *.js — no files [SKIPPED]
//     ❯ *.{json,md} — 1 file
//       ⠹ prettier --write
//   ↓ packages/backend/.lintstagedrc.json — 2 files
//     ❯ *.js — 2 files
//       ⠼ eslint --fix
//     ↓ *.{json,md} — no files [SKIPPED]
// ◼ Applying modifications from tasks...
// ◼ Cleaning up temporary files...
//
// "glob": ["npx a", "npx b"]
//
// "lint-time": [
//   ["**/*.ts",
//     "eslint -c .eslintrc.cjs --cache --fix --max-warnings=0",
//     "prettier --ignore-path .gitignore --write"
//   ],
//   ["**/*.{js,cjs,mjs,json}",
//     "prettier --ignore-path .gitignore --write"
//   ]
// }

// * order matters for ones that match multiple
// * concurrent where possible...
//   * but prioritise doing something once with a+b files versus parallel once with a + once with b

// const lintStaged = async (
//   {
//     allowEmpty = false,
//     concurrent = true,
//     config: configObject,
//     configPath,
//     cwd,
//     debug = false,
//     diff,
//     diffFilter,
//     maxArgLength = getMaxArgLength() / 2,
//     stash = true,
//     verbose = false,
//   } = {},
//   logger = console
// ) => {
//   await validateOptions({ cwd, shell }, logger)
//   // Unset GIT_LITERAL_PATHSPECS to not mess with path interpretation
//   debugLog('Unset GIT_LITERAL_PATHSPECS (was `%s`)', process.env.GIT_LITERAL_PATHSPECS)
//   delete process.env.GIT_LITERAL_PATHSPECS
//   const options = {
//     allowEmpty,
//     concurrent,
//     configObject,
//     configPath,
//     cwd,
//     debug,
//     diff,
//     diffFilter,
//     maxArgLength,
//     quiet,
//     relative,
//     shell,
//     stash,
//     verbose,
//   }
//   try {
//     debugLog('Tasks were executed successfully!')
//     printTaskOutput(ctx, logger)
//     return true
//   } catch (runAllError) {
//     if (runAllError?.ctx?.errors) {
//       const { ctx } = runAllError
//       if (ctx.errors.has(ConfigNotFoundError)) {
//         logger.error(NO_CONFIGURATION)
//       } else if (ctx.errors.has(ApplyEmptyCommitError)) {
//         logger.warn(PREVENTED_EMPTY_COMMIT)
//       } else if (ctx.errors.has(GitError) && !ctx.errors.has(GetBackupStashError)) {
//         logger.error(GIT_ERROR)
//         if (ctx.shouldBackup) {
//           // No sense to show this if the backup stash itself is missing.
//           logger.error(RESTORE_STASH_EXAMPLE)
//         }
//       }
//       printTaskOutput(ctx, logger)
//       return false
//     }
//     // Probably a compilation error in the config js file. Pass it up to the outer error handler for logging.
//     throw runAllError
//   }
// }
