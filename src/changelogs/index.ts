import { readPackageJsonCwd, type Args } from "../common/utils";
import { inspect } from "util";
import * as git from "./modules/git";
import * as file from "./modules/file";
import { join } from "path";

// Increase max array length to null (unlimited)
inspect.defaultOptions.maxArrayLength = null;

/**
 * @param all all commits
 * @param from starting point (hash, tag)
 * @param to ending point (hash, tag)
 * @param version (v) version
 * @param output (o) CHANGELOG.md file
 * @param help (h) help
 */

export default function main(args: Args) {
  // Show help
  if (args.has("help") || args.has("h")) {
    console.log(`
  Usage: ld changelogs <options>

  Options:
        --all         Changelogs all commits
        --from        Start point (hash, tag). default: first commit or last tag
        --to          End point (hash, tag). default: HEAD
        --debug       Show debug information
    -v, --version     Version log (ex: v1.0.0). default: version in package.json
    -o, --output      Output changelog file. default: CHANGELOG.md
    -h, --help        Show help
`);
    return;
  }

  const fileName =
    args.get("output")?.value || args.get("o")?.value || "CHANGELOG.md";
  const pathFile = join(process.cwd(), fileName);

  const packageJson = readPackageJsonCwd();
  const version: string =
    "v" +
    ((args.get("version")?.value ||
      args.get("v")?.value ||
      packageJson?.version) ??
      "0.0.0");

  const hashStart = args.get("from")?.value;
  const hashEnd = args.get("to")?.value || "HEAD";

  const isAll = args.has("all");

  const tags = git.getTags();

  const firstCommitHash = git.getFirstCommitHash();

  if (!firstCommitHash) {
    return;
  }

  if (isAll) {
    for (let index = 0; index < tags.length; index++) {
      let commits = [];
      if (index === 0) {
        commits = git.getCommits(firstCommitHash, tags[index]?.name);
      } else {
        commits = git.getCommits(tags[index - 1]?.name, tags[index]?.name);
      }

      file.writeChangeLog(
        pathFile,
        commits,
        tags[index]?.name,
        tags[index]?.date
      );
    }

    const commits = git.getCommits(tags[tags?.length - 1]?.name, "HEAD");
    file.writeChangeLog(pathFile, commits, version);
  } else if (hashStart) {
    const commits = git.getCommits(hashStart, hashEnd);

    file.writeChangeLog(pathFile, commits, version);
  } else {
    const hasTags = tags.length > 0

    if (!hasTags) {
      const commits = git.getCommits(firstCommitHash, "HEAD");

      file.writeChangeLog(pathFile, commits, version);
    } else {
      const commits = git.getCommits(tags[tags?.length - 1]?.name, "HEAD");

      file.writeChangeLog(pathFile, commits, version);
    }
  }
}
