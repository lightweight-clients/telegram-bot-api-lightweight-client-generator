const repoName = 'telegram-bot-api-lightweight-client-generator';
const repoOwner = 'HRAshton';

function main() {
  const latestPackageVersion = JSON.parse(UrlFetchApp.fetch('https://registry.npmjs.org/telegram-bot-api-lightweight-client/latest').getContentText()).version;
  console.log('latestPackageVersion', latestPackageVersion);

  const latestApiVersion = UrlFetchApp.fetch('https://core.telegram.org/bots/api-changelog').getContentText().match(/Bot API ([\d\.]+)/)[1];
  console.log('latestApiVersion', latestApiVersion);

  const matches = latestPackageVersion.startsWith(latestApiVersion);
  if (matches) {
    console.log('OK');
    return;
  }

  if (!isIssueExist(latestApiVersion)) {
    createIssue(latestPackageVersion, latestApiVersion);
    console.log('Issue created');
  } else {
    console.info('Issue exists');
  }

  throw new Error('New version: ' + latestApiVersion);
}

function isIssueExist(latestApiVersion) {
  const githubToken = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');

  const response = UrlFetchApp.fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
    headers: {
      Authorization: `token ${githubToken}`,
    },
  });

  const issues = JSON.parse(response.getContentText());

  return issues.some((issue) => issue.title === getIssueName(latestApiVersion));
}

function createIssue(latestPackageVersion, latestApiVersion) {
  const githubToken = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');

  const title = getIssueName(latestApiVersion);
  const body = `
New version of Telegram API is available. Please update the package.
Actual package version: ${latestPackageVersion}
Actual API version: ${latestApiVersion}
Details: https://core.telegram.org/bots/api-changelog
`;

  UrlFetchApp.fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
    method: 'post',
    headers: {
      Authorization: `token ${githubToken}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({ title, body, assignees: [repoOwner] }),
  });
}

function getIssueName(latestApiVersion) {
  return `New Telegram API version detected (${latestApiVersion})`;
}
