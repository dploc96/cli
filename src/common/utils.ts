import { join } from "path";
import * as fs from "node:fs";
import packageJson from "../../package.json";

/**
 * Get command-line arguments.
 * @returns An Args object containing the formatted arguments.
 */
export function getArgv() {
  const args = process.argv.slice(3);
  const regex = /^--?(\w+)(?:=(.+))?$/;

  const _args = args
    .map((arg) => {
      const match = arg.match(regex);

      if (match) {
        const [, key, value] = match;

        return { key, value };
      } else {
        return null;
      }
    })
    .filter(Boolean);

  return new Args(_args);
}

interface IArg {
  key: string;
  value: string;
}

export class Args {
  data: IArg[];

  constructor(args: IArg[]) {
    this.data = args;
  }

  /**
   * Get the value of a command-line argument based on the key.
   * @param key - The key of the argument to retrieve the value for.
   * @returns The value of the argument, or undefined if not found.
   */
  get(key: string) {
    return this.data.find((arg) => arg.key === key);
  }

  /**
   * Check if a command-line argument exists based on the key.
   * @param key - The key of the argument to check.
   * @returns True if the argument exists, false if not.
   */
  has(key: string) {
    return this.data.some((arg) => arg.key === key);
  }
}

/**
 * Read the content of the package.json file.
 * @returns The content of the package.json file.
 */
export function readPackageJson() {
  return packageJson;
}

/**
 * Read the content of the package.json file in the current directory.
 * @returns The content of the package.json file.
 */
export function readPackageJsonCwd() {
  const path = join(process.cwd(), "package.json");
  if (!fs.existsSync(path)) {
    return null;
  }
  const content = fs.readFileSync(path, "utf8");
  return JSON.parse(content) as { version: string };
}
