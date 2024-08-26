import { getArgv, type Args } from "../../common/utils";
import { spawnSync } from "child_process";
import { parseBufferContents } from "./utils";
import logColor from "./log-color";

/**
 * Get the hash of the first commit in the repository.
 * @returns The hash of the first commit or null if no commit is found.
 */
export function getFirstCommitHash() {
  const firstCommitBuffer = spawnSync(
    "git",
    ["rev-list", "--max-parents=0", "HEAD"],
    {}
  );

  const firstCommitHash = parseBufferContents(firstCommitBuffer.output);

  if (firstCommitHash.length === 0) {
    console.error(logColor.red("First commit not found"));
    return null;
  }

  return firstCommitHash[0];
}

/**
 * Get the list of tags in the repository.
 * @returns Array of tags.
 */
export function getTags() {
  /**
   * %h is the abbreviated hash of the commit.
   * %ad is the date of the commit.
   * %d is the list of tags associated with the commit.
   */
  const allTagsBuffer = spawnSync(
    "git",
    [
      "log",
      "--tags",
      "--simplify-by-decoration",
      "--date=short",
      "--pretty=format:%h %ad %d",
    ],
    {}
  );

  const tags = parseBufferContents(allTagsBuffer.output);

  // DEBUG: Display tag information
  const processArgs: Args = getArgv();
  if (processArgs.has("debug")) {
    console.log("tags", tags);
  }

  if (tags.length === 0) {
    console.error(logColor.red("No tags found"));
    return [];
  }

  const regex =
    /^([0-9a-f]+)\s+(\d{4}-\d{2}-\d{2})\s+\(.*tag:\s+(dev\d+.\d+.\d+).*\)$/;
  const mapData = tags.map((tag) => {
    const match = tag.match(regex);
    if (match) {
      const [, hash, date, name] = match;
      return { hash, date: new Date(date), name };
    }
    return null;
  });

  // DEBUG: Display tag information
  if (processArgs.has("debug")) {
    console.log("tags result: ", mapData);
  }

  return mapData.filter(Boolean).reverse();
}

/**
 * Get the list of commits in the repository.
 * @param hashStart The hash or tag of the starting commit (optional).
 * @param hashEnd The hash or tag of the ending commit (optional).
 * @returns Array of commits.
 */
export function getCommits(hashStart?: string, hashEnd?: string) {
  const args = ["log", "--pretty=oneline"];
  if (hashStart) {
    if (hashEnd) {
      args.push(`${hashStart}..${hashEnd}`);
    } else {
      args.push(`${hashStart}..HEAD`);
    }
  }

  const listCommitsBuffer = spawnSync("git", args, {});

  const commits = parseBufferContents(listCommitsBuffer.output);

  const processArgs: Args = getArgv();
  // DEBUG: Display commit log information
  if (processArgs.has("debug")) {
    console.log("git", args.join(" "));
    console.log("commits", commits);
  }

  if (commits.length === 0) {
    console.error(logColor.red("No commits found"));
    return [];
  }

  const commitRegex = /^(\b[0-9a-f]{5,40}\b)\s(.*)$/;

  return commits
    .map((commit) => {
      const match = commit.match(commitRegex);

      if (match) {
        const [, hash, message] = match;

        return { hash, message } as Commit;
      }
    })
    .filter(Boolean);
}

export interface Commit {
  hash: string;
  message: string;
}
