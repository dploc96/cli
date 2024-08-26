/**
 * Retrieves the changelog information from the commit message.
 * @param commitMsg - The commit message string.
 * @param beforeCommit - The commit message string preceding this commit.
 * @returns The changelog string or null if not found.
 */
export function getChangeLogFromCommit(commitMsg: string, beforeCommit?: string) {
  const regex = /^Resolve "(.*?)"$/;

  const match = commitMsg.match(regex);

  if (match && match[1]) {
    const mrId = getMrIdFromCommit(beforeCommit);

    if (!beforeCommit || !mrId) return  null;

    return `${match[1]} !${mrId}`;
  }

  return null;
}

/**
 * Analyzes the content of an array of buffers.
 * @param buffers - The input array of buffers.
 * @returns An array of strings analyzed from the buffers.
 */
export function parseBufferContents(buffers: (Buffer | null)[]) {
  const strings = buffers
    .map((buffer) => {
      return buffer && buffer.byteLength && buffer.toString();
    })
    .filter(Boolean);

  const joined = strings.join("\n");

  return joined.split("\n").filter(Boolean);
}

/**
 * Extracts the merge request ID (MR ID) from a commit message.
 * @param commitMsg - The commit message string.
 * @returns The MR ID if present in the commit message, or undefined otherwise.
 */
export function getMrIdFromCommit(commitMsg: string) {
  const match = commitMsg.match(/!(\d+)/);
  return match ? parseInt(match[1]) : undefined;
}

/**
 * Extracts the action (Added, Updated, or Fixed) from a given changelog string.
 * @param changelog - The changelog string to extract the action from.
 * @returns The action (Added, Updated, or Fixed) if found, or undefined if not found.
 */
export function getActionFromChangeLog(changelog: string) {
  if (changelog.includes('Added')) {
    return 'Added';
  } else if (changelog.includes('Updated')) {
    return 'Updated';
  } else if (changelog.includes('Fixed')) {
    return 'Fixed';
  } else {
    return undefined;
  }
}

/**
 * Sorts an array of changelog strings based on the action (Added, Updated, Fixed) and the merge request ID.
 * @param changelogs - An array of changelog strings to be sorted.
 * @returns The sorted array of changelog strings.
 */
export function sortChangeLogs(changelogs: string[]) {
  const sortedMessages = changelogs.sort((a, b) => {
    const aAction = getActionFromChangeLog(a);
    const bAction = getActionFromChangeLog(b);
    const aNumber = getMrIdFromCommit(a);
    const bNumber = getMrIdFromCommit(b);

    const actionOrder = {
      'Added': 1,
      'Updated': 2,
      'Fixed': 3
    };

    if (actionOrder[aAction] !== actionOrder[bAction]) {
      return actionOrder[aAction] - actionOrder[bAction];
    } else if (aNumber !== bNumber) {
      return bNumber - aNumber;
    } else {
      return 0;
    }
  });

  return sortedMessages;
}