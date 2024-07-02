function main() {
  const latestPackageVersion = JSON.parse(UrlFetchApp.fetch('https://registry.npmjs.org/telegram-bot-api-lightweight-client/latest').getContentText()).version;
  console.log('latestPackageVersion', latestPackageVersion);

  const latestApiVersion = UrlFetchApp.fetch('https://core.telegram.org/bots/api-changelog').getContentText().match(/Bot API ([\d\.]+)/)[1];
  console.log('latestApiVersion', latestApiVersion);

  const matches = latestPackageVersion.startsWith(latestApiVersion);
  if (matches) {
    console.log('OK');
  } else {
    throw new Error('New version: ' + latestApiVersion);
  }
}
