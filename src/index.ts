#! /usr/bin/env node

import { getArgv, readPackageJson } from "./common/utils";
import commit from "./commit";
import changelogs from "./changelogs";

const args = getArgv();
const command = process.argv[2];

const listCommands = ["changelogs", "commit"];

function main() {
  if (["--version", "-v"].includes(command)) {
    const json = readPackageJson();
    console.log("Version:", json?.version);
    return;
  }

  if (
    !command ||
    !listCommands.includes(command) ||
    ["--help", "-h"].includes(command)
  ) {
    const helpContent = `Usage: ld <command> [options]

    Options:
      -v, --version  Output the version number
      -h, --help     Output usage information

    Commands:
      changelogs  Generate changelogs
      commit      Commit format\
    `;
    console.log(helpContent);
    return;
  }

  switch (command) {
    case "commit":
      commit();
      break;
    case "changelogs":
      changelogs(args);
      break;
  }
}

main();
