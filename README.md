# Telegram Bot 

This is lightweight client for Telegram Bot API. It contains only methods and types
and exports only `fetch` call to make requests.

Generated automatically from Telegram Bot API schema. Schemas are obtained from
[Sys-001's telegram schemas](https://github.com/sys-001/telegram-bot-api-versions/tree/main) repository.

## Installation

```bash
npm install telegram-bot-api-lightweight-client
```

## Usage

To use this library, you need to set token first. You can do it by calling `setToken` function.

There are also ability to set custom endpoint if you need to use local server or proxy. You also can
set custom fetch function if you need to use custom request library.

Basically, all methods are named as in Telegram Bot API documentation. You can find all methods in
'client.ts' file. The only new methods are:

- `client_setClientToken(token: string)`: sets token for all requests.
- `client_setBaseUrl(endpoint: string)`: sets endpoint for all requests.
- `client_setFetch(customFetch: typeof client_fetch)`: sets fetch function for all requests.

Here is an example of usage:

```typescript
import { setToken, getMe } from 'telegram-bot-api-lightweight-client';

setToken('hello:world');

const main = async () => {
  const me = await getMe();
  console.log(me);
};

main();
```

## Features

- No dependencies.
- When using code minifiers, only the fetch command is exported.
- Can be used in browser and Node.js.
- Fully compatible with AWS LLRT.
- Fully typed API.

## New version generation

The client and types code is generated automatically from the schema.
To generate new version, you need to run `npm run generate` command.
The new files will be generated in `./output` folder.

1. Pull and build image for tgscrapper
2. `docker run -it --rm -v c:/tmp:/out tgscrapper app:export-schema --openapi /out/out.json`
3. Save the openapi file as `./schema/openapi.json`
4. Run `npm run generate` command
