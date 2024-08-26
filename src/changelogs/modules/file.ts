import type { Commit } from "./git";

import * as fs from "node:fs";
import { basename } from "path";
import logColor from "./log-color";
import { getChangeLogFromCommit, sortChangeLogs } from "./utils";
import dayjs from "dayjs"

/**
 * Read the content of a file by its path.
 * @param path - The path to the file to be read.
 * @returns The content of the file.
 */
export function readFile(path: string) {
  if (!fs.existsSync(path)) {
    return "";
  }
  const content = fs.readFileSync(path, "utf8");
  return content;
}

/**
 * Write content to a file, prepending the new content to the beginning of the file.
 * @param path - The path to the file to be written.
 * @param commits - Commit list.
 * @param version - Version show in changelog file.
 * @param versionDate - Gen changelog date.
 */
export function writeChangeLog(
  path: string,
  commits: Commit[],
  version: string,
  versionDate?: Date
) {
  const currentContent = readFile(path);

  const dateFormat = 'DD/MM/YYYY';

  const dayNow = dayjs(versionDate || undefined).format(dateFormat);

  let changelogs: string[] | string = commits
    .map((commit, index) => getChangeLogFromCommit(
      commit.message, 
      index > 0 ? commits[index - 1].message : undefined
    ))
    .filter(Boolean)
    .map((message) => `- ${message}`)

  changelogs = sortChangeLogs(changelogs).join("\n");
    
  fs.writeFileSync(
    path,
    `### ${version.replace(
      "dev",
      "v"
    )} (${dayNow})\n\n${changelogs}\n\n${currentContent}`,
    "utf8"
  );

  const fileName = basename(path);

  console.log(
    logColor.green(`${fileName} updated (${version.replace("dev", "v")})🔥`)
  );
}
